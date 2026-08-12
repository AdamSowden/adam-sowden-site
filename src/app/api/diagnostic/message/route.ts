// POST /api/diagnostic/message
//
// Appends the user's message to the session, calls Claude with the
// conversation system prompt and forced tool use, persists the AI reply
// and any newly-extracted fields, and returns the reply plus the
// captured-email flag.

import { setDefaultResultOrder } from "node:dns";
// Force IPv4-first DNS resolution. macOS networks frequently advertise
// AAAA records but can't actually route IPv6, which makes Node's default
// "verbatim" order stall on connection attempts to api.anthropic.com.
// curl falls back to IPv4 silently; Node does not. Setting this once at
// module load fixes ETIMEDOUT errors in this route's Anthropic SDK calls.
setDefaultResultOrder("ipv4first");

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  CONVERSATION_SYSTEM_PROMPT,
  DIAGNOSTIC_CHAT_MODEL,
  RESPOND_TOOL,
  type RespondToolOutput,
} from "@/lib/diagnostic-prompts";
import {
  getSession,
  updateSession,
  isExpired,
  type ConversationTurn,
} from "@/lib/diagnostic-store";
import { captureSpeedToLead } from "@/lib/speed-to-lead-ghl";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_USER_MESSAGE_CHARS = 2000;
const MAX_MESSAGES_PER_SESSION = 25;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { sessionToken?: unknown; userMessage?: unknown };

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { bucket: "diagnostic-message", limit: 30, windowSec: 60 });
  if (!rl.success) return tooManyRequests(rl);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Diagnostic chat is not configured." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionToken =
    typeof body.sessionToken === "string" ? body.sessionToken.trim() : "";
  const rawMessage =
    typeof body.userMessage === "string" ? body.userMessage : "";
  const userMessage = rawMessage.trim().slice(0, MAX_USER_MESSAGE_CHARS);

  if (!sessionToken || !userMessage) {
    return Response.json(
      { error: "sessionToken and userMessage are required." },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await getSession(sessionToken);
  } catch (err) {
    console.error("[/api/diagnostic/message] store error:", err);
    return Response.json(
      { error: "Session store unavailable." },
      { status: 503 }
    );
  }

  if (!session) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.isComplete) {
    return Response.json(
      { error: "Session already complete." },
      { status: 400 }
    );
  }
  if (isExpired(session)) {
    return Response.json(
      { error: "Session expired due to inactivity. Please start again." },
      { status: 410 }
    );
  }
  if (session.conversationHistory.length >= MAX_MESSAGES_PER_SESSION * 2) {
    return Response.json(
      { error: "Session message limit reached." },
      { status: 429 }
    );
  }

  const updatedHistory: ConversationTurn[] = [
    ...session.conversationHistory,
    { role: "user", content: userMessage },
  ];

  // 4 retries with the SDK's exponential backoff covers most transient
  // network hiccups (IPv4/IPv6 stalls, brief Anthropic side timeouts).
  // 60s per-request timeout is generous but matches the worst-case
  // observed latency of Sonnet under load.
  const client = new Anthropic({
    apiKey,
    maxRetries: 4,
    timeout: 60_000,
  });

  let toolOutput: RespondToolOutput;
  try {
    const result = await client.messages.create({
      model: DIAGNOSTIC_CHAT_MODEL,
      max_tokens: 1024,
      system: CONVERSATION_SYSTEM_PROMPT,
      tools: [RESPOND_TOOL],
      tool_choice: { type: "tool", name: RESPOND_TOOL.name },
      messages: updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const toolUse = result.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("No tool_use block returned by the model.");
    }
    toolOutput = toolUse.input as RespondToolOutput;
  } catch (err) {
    console.error("[/api/diagnostic/message] LLM error:", err);
    // Gentle fallback so the user isn't stuck. Keep the conversation
    // alive; ask them to repeat without surfacing the raw error.
    const fallbackMessage =
      "I apologise, something went wrong. Could you repeat your last answer?";
    return Response.json({
      message: fallbackMessage,
      questionIndex: session.questionIndex,
      isEmailCaptured: false,
      capturedEmail: null,
    });
  }

  // Brand-voice backstop: strip em-dashes the model may have slipped in.
  const cleanedMessage = toolOutput.message.replace(/\s*—\s*/g, ", ");

  updatedHistory.push({ role: "assistant", content: cleanedMessage });

  // Validate email if the model claims to have captured one. Bad capture
  // should not finalise the session.
  let acceptedEmail: string | null = null;
  if (
    toolOutput.isEmailCaptured &&
    typeof toolOutput.capturedEmail === "string"
  ) {
    const candidate = toolOutput.capturedEmail.trim().toLowerCase();
    if (EMAIL_REGEX.test(candidate) && candidate.length <= 320) {
      acceptedEmail = candidate;
    }
  }

  const patch: Partial<typeof session> = {
    conversationHistory: updatedHistory,
    questionIndex: clampIndex(toolOutput.questionIndex),
  };

  // Only fill extracted fields once. Don't let later turns overwrite.
  const ed = toolOutput.extractedData;
  if (ed) {
    if (!session.firstName && ed.firstName)
      patch.firstName = ed.firstName.slice(0, 128);
    if (!session.businessName && ed.businessName)
      patch.businessName = ed.businessName.slice(0, 256);
    if (!session.location && ed.location)
      patch.location = ed.location.slice(0, 256);
    if (!session.industry && ed.industry)
      patch.industry = ed.industry.slice(0, 256);
  }

  if (!session.email && acceptedEmail) {
    patch.email = acceptedEmail;
  }

  try {
    await updateSession(sessionToken, patch);
  } catch (err) {
    console.error("[/api/diagnostic/message] update error:", err);
    return Response.json(
      { error: "Could not save your message. Please try again." },
      { status: 503 }
    );
  }

  // Speed-to-Lead: the first turn we capture the lead's email, register
  // them in GHL tagged `sl-lead` so the instant-response + follow-up
  // workflows can engage even if they abandon the diagnostic. `session` is
  // the pre-update snapshot, so this fires only once. Best-effort: it must
  // never break the diagnostic flow.
  if (!session.email && acceptedEmail) {
    try {
      const result = await captureSpeedToLead({
        email: acceptedEmail,
        firstName: patch.firstName ?? session.firstName ?? null,
        source: "diagnostic",
        stateTag: "sl-diagnostic-started",
      });
      if (!result.ok) {
        console.error("[speed-to-lead] capture not ok:", result.error);
      }
    } catch (err) {
      console.error("[speed-to-lead] capture failed (non-fatal):", err);
    }
  }

  return Response.json({
    message: cleanedMessage,
    questionIndex: patch.questionIndex,
    isEmailCaptured: Boolean(acceptedEmail),
    capturedEmail: acceptedEmail,
  });
}

function clampIndex(n: unknown): number {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : 1;
  if (v < 1) return 1;
  if (v > 20) return 20;
  return v;
}
