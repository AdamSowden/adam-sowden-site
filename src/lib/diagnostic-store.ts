// Upstash Redis wrapper for Marketing Bottleneck Diagnostic sessions.
//
// Why Upstash (or Vercel KV — same product): sessions are ephemeral.
// A diagnostic runs for 7-10 minutes then either completes or gets
// abandoned. Redis with a 24h TTL is the right fit. Free tier (10K
// commands/day) easily covers ~250 diagnostics/day.
//
// Active sessions live at key `diagnostic:session:{token}` as a JSON blob.
// Completed sessions are kept under the same key (still TTL'd) since the
// final lead has already been written to GHL by the time the session
// expires. Inbox + GHL contact record are the long-term archive of
// record, not Redis.

import { Redis } from "@upstash/redis";
import type { DiagnosticReport } from "./diagnostic-prompts";

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type DiagnosticSession = {
  sessionToken: string;
  firstName: string | null;
  businessName: string | null;
  location: string | null;
  industry: string | null;
  email: string | null;
  conversationHistory: ConversationTurn[];
  report: DiagnosticReport | null;
  questionIndex: number;
  isComplete: boolean;
  createdAt: number;
  updatedAt: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24h
const SESSION_KEY_PREFIX = "diagnostic:session:";

function sessionKey(token: string): string {
  return `${SESSION_KEY_PREFIX}${token}`;
}

// Lazy singleton — avoids initialising the Redis client on cold start of
// routes that don't touch it.
let redisSingleton: Redis | null = null;

function getRedis(): Redis {
  if (redisSingleton) return redisSingleton;
  // Accept either naming convention:
  //   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash direct)
  //   KV_REST_API_URL        / KV_REST_API_TOKEN          (Vercel Marketplace integration)
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Diagnostic session store not configured. Set UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN in your environment."
    );
  }
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

export async function createSession(
  sessionToken: string,
  openingMessage: string
): Promise<DiagnosticSession> {
  const now = Date.now();
  const session: DiagnosticSession = {
    sessionToken,
    firstName: null,
    businessName: null,
    location: null,
    industry: null,
    email: null,
    conversationHistory: [{ role: "assistant", content: openingMessage }],
    report: null,
    questionIndex: 1,
    isComplete: false,
    createdAt: now,
    updatedAt: now,
  };
  await getRedis().set(sessionKey(sessionToken), JSON.stringify(session), {
    ex: SESSION_TTL_SECONDS,
  });
  return session;
}

export async function getSession(
  sessionToken: string
): Promise<DiagnosticSession | null> {
  const raw = await getRedis().get<string | DiagnosticSession>(
    sessionKey(sessionToken)
  );
  if (!raw) return null;
  // @upstash/redis auto-deserialises JSON values stored as plain JSON, but
  // round-trips strings as-is. Handle both for safety.
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as DiagnosticSession;
    } catch {
      return null;
    }
  }
  return raw;
}

export async function updateSession(
  sessionToken: string,
  patch: Partial<DiagnosticSession>
): Promise<DiagnosticSession | null> {
  const existing = await getSession(sessionToken);
  if (!existing) return null;
  const next: DiagnosticSession = {
    ...existing,
    ...patch,
    sessionToken: existing.sessionToken,
    createdAt: existing.createdAt,
    updatedAt: Date.now(),
  };
  await getRedis().set(sessionKey(sessionToken), JSON.stringify(next), {
    ex: SESSION_TTL_SECONDS,
  });
  return next;
}

export async function markComplete(
  sessionToken: string,
  report: DiagnosticReport
): Promise<DiagnosticSession | null> {
  return updateSession(sessionToken, {
    report,
    isComplete: true,
    questionIndex: 20,
  });
}

// Inactivity guard. The Redis TTL is 24h but a session that has been
// silent for 15 minutes is treated as abandoned. Returns true if the
// session is too old to accept new messages.
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
export function isExpired(session: DiagnosticSession): boolean {
  return Date.now() - session.updatedAt > INACTIVITY_TIMEOUT_MS;
}
