// Hard guardrails for the GHL Speed-to-Lead agent.
//
// These are code, not prompt instructions, deliberately. A model can be
// talked out of a prompt rule; it cannot be talked out of an early
// return. Everything here answers one question: should we send at all?
//
// Redis (the same Upstash instance the diagnostic uses) holds per-contact
// thread state: outbound count, last handled timestamp, and a short-lived
// dedupe marker. GHL remains the archive of record; this is working
// memory only.

import { Redis } from "@upstash/redis";
import type { AgentChannel } from "./ghl";

const THREAD_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const THREAD_KEY_PREFIX = "agent:thread:";
const DEDUPE_KEY_PREFIX = "agent:dedupe:";
const DEDUPE_TTL_SECONDS = 120;

// Quiet hours in the contact's own timezone. The agent does not initiate
// outside these hours. Replies to a message the person just sent are
// exempt, see RECENT_INBOUND_GRACE_MS below.
const QUIET_START_HOUR = 8; // 08:00
const QUIET_END_HOUR = 20; // 20:00

// If the triggering event is younger than this, the person is sitting
// there waiting for a response, so quiet hours don't apply. Someone who
// opts in at 11:40pm expects an answer at 11:40pm, not at 8am.
const RECENT_INBOUND_GRACE_MS = 5 * 60 * 1000;

// Maximum unanswered outbound messages before the agent stops. Reset by
// any inbound reply.
const MAX_UNANSWERED_OUTBOUND = 6;

const OPT_OUT_PATTERNS = [
  /\bstop\b/i,
  /\bstopall\b/i,
  /\bunsubscribe\b/i,
  /\bcancel\b/i,
  /\bquit\b/i,
  /\bremove me\b/i,
  /\bdon'?t (contact|text|message) me\b/i,
];

// Lifecycle tags that mean a human relationship is already underway.
// Texting someone who has a call booked reads as a system that isn't
// paying attention.
export const STAND_DOWN_TAGS = [
  "ai-handover",
  "ai-optout",
  "appointment confirmed",
  "1st call booked",
  "sl-booked",
];

export type ThreadState = {
  contactId: string;
  unansweredOutbound: number;
  lastInboundAt: number | null;
  lastOutboundAt: number | null;
  updatedAt: number;
};

let redisSingleton: Redis | null = null;

function getRedis(): Redis {
  if (redisSingleton) return redisSingleton;
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Agent thread store not configured. Set UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN."
    );
  }
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

function threadKey(contactId: string): string {
  return `${THREAD_KEY_PREFIX}${contactId}`;
}

export async function getThreadState(
  contactId: string
): Promise<ThreadState> {
  const raw = await getRedis().get<string | ThreadState>(
    threadKey(contactId)
  );
  if (raw) {
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as ThreadState;
      } catch {
        // fall through to a fresh state
      }
    } else {
      return raw;
    }
  }
  return {
    contactId,
    unansweredOutbound: 0,
    lastInboundAt: null,
    lastOutboundAt: null,
    updatedAt: Date.now(),
  };
}

export async function saveThreadState(state: ThreadState): Promise<void> {
  await getRedis().set(
    threadKey(state.contactId),
    JSON.stringify({ ...state, updatedAt: Date.now() }),
    { ex: THREAD_TTL_SECONDS }
  );
}

// Dedupe. The webhook payload carries no message id, so we key on the
// contact plus a hash of the body. GHL occasionally re-delivers, and a
// person sending three rapid texts should not get three separate replies.
export async function claimEvent(
  contactId: string,
  body: string
): Promise<boolean> {
  let hash = 0;
  for (let i = 0; i < body.length; i++) {
    hash = (hash * 31 + body.charCodeAt(i)) | 0;
  }
  const key = `${DEDUPE_KEY_PREFIX}${contactId}:${hash}`;
  // NX set returns null when the key already exists.
  const result = await getRedis().set(key, "1", {
    ex: DEDUPE_TTL_SECONDS,
    nx: true,
  });
  return result !== null;
}

export function isOptOut(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed) return false;
  return OPT_OUT_PATTERNS.some((re) => re.test(trimmed));
}

// Hour-of-day in an IANA timezone without pulling in a date library.
// Contact timezone comes straight off the GHL payload (e.g.
// "Australia/Sydney"). Falls back to UTC if it's missing or invalid.
export function localHour(timezone: string | undefined): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone || "UTC",
      hour: "numeric",
      hour12: false,
    });
    return Number(fmt.format(new Date()));
  } catch {
    return new Date().getUTCHours();
  }
}

export function isWithinQuietHours(timezone: string | undefined): boolean {
  const hour = localHour(timezone);
  return hour < QUIET_START_HOUR || hour >= QUIET_END_HOUR;
}

export type GateInput = {
  tags: string[];
  timezone?: string;
  channel: AgentChannel;
  /** The inbound message body, if this turn was triggered by a reply. */
  inboundBody?: string;
  /** True when the person just messaged us and is waiting. */
  isReplyToRecentInbound: boolean;
  thread: ThreadState;
};

export type GateResult =
  | { allow: true }
  | { allow: false; reason: string; action?: "opt_out" };

// One place that decides whether a message may be sent. Called before any
// model tokens are spent, so a blocked send costs nothing.
export function evaluateGates(input: GateInput): GateResult {
  const standDown = STAND_DOWN_TAGS.find((t) => input.tags.includes(t));
  if (standDown) {
    return { allow: false, reason: `stand-down tag present: ${standDown}` };
  }

  if (!input.tags.includes("ai-beta")) {
    return { allow: false, reason: "contact is not in the ai-beta cohort" };
  }

  if (input.inboundBody && isOptOut(input.inboundBody)) {
    return {
      allow: false,
      reason: "opt-out keyword detected",
      action: "opt_out",
    };
  }

  if (
    !input.isReplyToRecentInbound &&
    isWithinQuietHours(input.timezone)
  ) {
    return {
      allow: false,
      reason: `quiet hours in ${input.timezone || "UTC"}`,
    };
  }

  if (input.thread.unansweredOutbound >= MAX_UNANSWERED_OUTBOUND) {
    return {
      allow: false,
      reason: `cadence cap reached (${MAX_UNANSWERED_OUTBOUND} unanswered)`,
    };
  }

  return { allow: true };
}

export { MAX_UNANSWERED_OUTBOUND, RECENT_INBOUND_GRACE_MS };
