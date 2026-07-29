// POST /api/chat/ghl
//
// The Site Conversation Agent, reshaped for SMS and email and locked
// behind a shared secret.
//
// Why this is a separate route rather than a flag on /api/chat: that one
// streams plain text to a browser widget and is deliberately public with
// wide-open CORS. This one returns a single complete string to a server
// caller and must never be public, because it costs model tokens per
// call. Same prompt module, opposite transport and opposite trust model.

// macOS resolves api.anthropic.com to IPv6 first and then stalls. Same
// prologue as the diagnostic routes; must run before the SDK loads.
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildAgentSystemPrompt,
  enforceSmsLength,
  type AgentContext,
} from "@/lib/agent-sms-prompt";
import type { AgentChannel } from "@/lib/ghl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-5";
const MAX_TOKENS = 400;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

type AgentMessage = { role: "user" | "assistant"; content: string };

type RequestBody = {
  messages?: unknown;
  channel?: unknown;
  context?: unknown;
  agent_key?: unknown;
};

function sanitizeMessages(raw: unknown): AgentMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: AgentMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    out.push({ role, content: trimmed.slice(0, MAX_MESSAGE_CHARS) });
  }
  return out.slice(-MAX_MESSAGES);
}

function readContext(raw: unknown): AgentContext {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    firstName: typeof c.firstName === "string" ? c.firstName : null,
    source: typeof c.source === "string" ? c.source : null,
    timezone: typeof c.timezone === "string" ? c.timezone : null,
    tags: Array.isArray(c.tags)
      ? c.tags.filter((t): t is string => typeof t === "string")
      : [],
    isFirstTouch: c.isFirstTouch === true,
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[/api/chat/ghl] AGENT_WEBHOOK_SECRET not set");
    return Response.json({ error: "Agent is not configured." }, { status: 503 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Agent is not configured." }, { status: 503 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Accept the secret from either the header or the body. GHL's free
  // Webhook action cannot set headers, so anything arriving via a
  // workflow uses the body; internal server-to-server calls use the
  // header.
  const provided =
    req.headers.get("x-agent-key") ||
    (typeof body.agent_key === "string" ? body.agent_key : "");
  if (provided !== secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const channel: AgentChannel = body.channel === "email" ? "email" : "sms";
  const messages = sanitizeMessages(body.messages);
  const context = readContext(body.context);

  // A first touch has no inbound message to respond to, so an empty
  // history is valid there and only there.
  if (messages.length === 0 && !context.isFirstTouch) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey, maxRetries: 3, timeout: 60_000 });

  try {
    const completion = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: buildAgentSystemPrompt(channel, context),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages:
        messages.length > 0
          ? messages
          : [
              {
                role: "user",
                content:
                  "[System: this person has just opted in and is waiting for your first message. They have not written anything yet.]",
              },
            ],
    });

    const text = completion.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) {
      return Response.json(
        { error: "Agent returned an empty message." },
        { status: 502 }
      );
    }

    // Brand-voice backstop, same as /api/chat: em dashes never ship.
    let cleaned = text.replace(/\s*—\s*/g, ", ");
    if (channel === "sms") cleaned = enforceSmsLength(cleaned);

    return Response.json({
      message: cleaned,
      channel,
      model: MODEL,
      truncated: channel === "sms" && cleaned.length < text.length,
    });
  } catch (err) {
    console.error("[/api/chat/ghl] LLM error:", err);
    return Response.json(
      { error: "Agent could not generate a reply." },
      { status: 502 }
    );
  }
}
