// POST /api/ghl/inbound
//
// The bridge between GoHighLevel and the Site Conversation Agent.
//
// GHL workflows W1 (Contact Tag: ai-beta added) and W2 (Customer Replied)
// POST here via the free Webhook action. This route authenticates the
// call, decides whether a reply is allowed at all, generates one, and
// sends it back through GHL's Conversations API so the message appears in
// the normal inbox and goes out from the registered number.
//
// Response timing matters: GHL's webhook action does not wait for or use
// our response, and the model takes ~5s. So we validate synchronously,
// return 202 immediately, and do the slow half in `after()`. If the gates
// reject the send we return 200 with a reason instead, which makes the
// execution log readable when nothing goes out.
//
// Verified against live payload captures on 29 Jul 2026. Three quirks
// that shape this file: there is no conversationId in the payload, tags
// arrive as a comma-separated string, and message.type is an integer.

import { NextRequest, after } from "next/server";
import {
  GHL_TAG,
  GHL_FIELD,
  addTags,
  removeTags,
  updateContactFields,
  findConversationId,
  getConversationMessages,
  sendMessage,
  parseTags,
  channelFromMessageType,
  type AgentChannel,
  type GhlWebhookPayload,
} from "@/lib/ghl";
import {
  claimEvent,
  detectHumanTakeover,
  evaluateGates,
  getThreadState,
  hashBody,
  saveThreadState,
  takePendingQuestion,
} from "@/lib/agent-guardrails";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type AgentMessage = { role: "user" | "assistant"; content: string };

function log(event: string, detail: Record<string, unknown>) {
  console.log(
    `[/api/ghl/inbound] ${event}`,
    JSON.stringify({ ...detail, at: new Date().toISOString() })
  );
}

// Staff notification messages can land inside a contact's conversation
// thread when the notification destination number is the same as the
// contact's number, e.g. while testing against your own mobile. They read
// as "A A replied , Conversation AI / you handling." and would otherwise
// be fed to the model as things the agent said.
//
// Deliberately narrow. An earlier version matched anything containing
// "replied", which would have silently swallowed a prospect writing "I
// replied to your email yesterday". Dropping a real inbound message is
// far worse than leaving one line of noise in the context, so this only
// matches the notification's own signature.
const SYSTEM_NOISE_PATTERNS = [/Conversation AI \/ you handling/i];

function isSystemNoise(body: string): boolean {
  return SYSTEM_NOISE_PATTERNS.some((re) => re.test(body));
}

// Maps GHL's message records into the role/content pairs the agent
// expects. The messages API returns newest-first; the model needs
// oldest-first. Direction on this endpoint is a string ("inbound" /
// "outbound"), unlike the webhook payload which omits it entirely.
function toAgentMessages(
  raw: Array<{ body?: string; direction?: string }>
): AgentMessage[] {
  return raw
    .filter((m) => typeof m.body === "string" && m.body.trim())
    .filter((m) => !isSystemNoise(m.body as string))
    .reverse()
    .map((m) => ({
      role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
      content: (m.body as string).trim().slice(0, 2000),
    }));
}

async function generateReply(args: {
  channel: AgentChannel;
  messages: AgentMessage[];
  context: Record<string, unknown>;
  secret: string;
}): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${SITE_URL}/api/chat/ghl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-key": args.secret,
      },
      body: JSON.stringify({
        channel: args.channel,
        messages: args.messages,
        context: args.context,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `agent ${res.status}: ${text.slice(0, 200)}` };
    }
    const data = (await res.json()) as { message?: string };
    if (!data.message) return { ok: false, error: "agent returned no message" };
    return { ok: true, message: data.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "agent network error",
    };
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[/api/ghl/inbound] AGENT_WEBHOOK_SECRET not set");
    return Response.json({ error: "Not configured." }, { status: 503 });
  }

  let payload: GhlWebhookPayload;
  try {
    payload = (await req.json()) as GhlWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // The free Webhook action cannot set headers, so the secret travels as
  // a Custom Data field in the body.
  if (payload.customData?.agent_key !== secret) {
    log("rejected", { reason: "bad agent_key" });
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const event = payload.customData?.event ?? "";
  const contactId = payload.customData?.contactId || payload.contact_id || "";
  if (!contactId) {
    return Response.json({ error: "No contactId in payload." }, { status: 400 });
  }

  const tags = parseTags(payload.tags);
  const inboundBody =
    typeof payload.message?.body === "string" ? payload.message.body : "";
  const isFirstTouch = event === "new_lead";

  // Channel: for a reply, believe the message type. For a first touch
  // there is no message, so fall back to what the workflow declared.
  const channel: AgentChannel =
    channelFromMessageType(payload.message?.type) ??
    (payload.customData?.channel === "email" ? "email" : "sms");

  // Dedupe before any work. GHL can re-deliver, and three rapid texts
  // should not produce three replies.
  const dedupeKey = isFirstTouch ? `first-touch:${event}` : inboundBody;
  const claimed = await claimEvent(contactId, dedupeKey);
  if (!claimed) {
    log("skipped", { contactId, reason: "duplicate event" });
    return Response.json({ ok: true, skipped: "duplicate" });
  }

  const thread = await getThreadState(contactId);
  const gate = evaluateGates({
    tags,
    timezone: payload.timezone,
    channel,
    inboundBody: inboundBody || undefined,
    // A first touch is a response to the person opting in seconds ago;
    // an inbound reply is by definition someone waiting on us. Both are
    // exempt from quiet hours.
    isReplyToRecentInbound: true,
    thread,
  });

  if (!gate.allow) {
    log("blocked", { contactId, reason: gate.reason, event });
    if (gate.action === "opt_out") {
      await addTags(contactId, [GHL_TAG.optOut]);
      await removeTags(contactId, [GHL_TAG.active, GHL_TAG.beta]);
    }
    return Response.json({ ok: true, skipped: gate.reason });
  }

  // Everything past this point is slow, and GHL neither waits for nor
  // reads our response. Acknowledge now, work after.
  after(async () => {
    const startedAt = Date.now();
    let history: AgentMessage[] = [];
    let hasOpeningMessage = false;

    // Someone opting in via /try-sms can type an opening question. It was
    // parked in Redis by /api/beta/optin because that request finishes
    // before GHL triggers us. Answering it makes the first message land
    // as a reply rather than a greeting.
    if (isFirstTouch) {
      try {
        const pending = await takePendingQuestion(contactId);
        if (pending) {
          history = [{ role: "user", content: pending }];
          hasOpeningMessage = true;
        }
      } catch (err) {
        log("pending_question_failed", { contactId, error: String(err) });
      }
    }

    // No conversationId in the payload, so resolve it. Only needed when
    // there is history to fetch; a first touch has none by definition.
    if (!isFirstTouch) {
      const convo = await findConversationId(contactId);
      if (convo.ok && convo.data) {
        const messages = await getConversationMessages(convo.data, 20);
        if (messages.ok) {
          history = toAgentMessages(messages.data);
        } else {
          log("history_failed", { contactId, error: messages.error });
        }
      } else if (!convo.ok) {
        log("conversation_lookup_failed", {
          contactId,
          error: convo.error,
        });
      }

      // Fall back to just the inbound message if history is unavailable.
      // A reply with no context beats no reply at all.
      if (history.length === 0 && inboundBody) {
        history = [{ role: "user", content: inboundBody }];
      }

      // Human takeover check, done here rather than in a GHL workflow.
      // If the newest outbound message in the thread isn't the one we
      // sent, someone typed into the conversation and the agent stands
      // down for good on this contact.
      if (detectHumanTakeover(history, thread)) {
        log("blocked", { contactId, reason: "human replied in thread" });
        await addTags(contactId, [GHL_TAG.handover]);
        await removeTags(contactId, [GHL_TAG.active]);
        return;
      }
    }

    const reply = await generateReply({
      channel,
      messages: history,
      context: {
        firstName: payload.first_name ?? null,
        source: payload.contact_source ?? null,
        timezone: payload.timezone ?? null,
        tags,
        isFirstTouch,
        hasOpeningMessage,
      },
      secret,
    });

    if (!reply.ok) {
      log("agent_failed", { contactId, error: reply.error });
      await addTags(contactId, [GHL_TAG.escalated]);
      return;
    }

    const sent = await sendMessage({
      contactId,
      channel,
      body: reply.message,
      subject: channel === "email" ? "Following up" : undefined,
    });

    if (!sent.ok) {
      log("send_failed", { contactId, channel, error: sent.error });
      await addTags(contactId, [GHL_TAG.escalated]);
      return;
    }

    await saveThreadState({
      ...thread,
      unansweredOutbound: isFirstTouch ? thread.unansweredOutbound + 1 : 1,
      lastInboundAt: isFirstTouch ? thread.lastInboundAt : Date.now(),
      lastOutboundAt: Date.now(),
      lastOutboundHash: hashBody(reply.message),
    });

    await updateContactFields(contactId, [
      {
        key: GHL_FIELD.lastHandledAt.key,
        value: new Date().toISOString(),
      },
      {
        key: GHL_FIELD.threadState.key,
        value: isFirstTouch ? "engaged" : "in_conversation",
      },
    ]);

    log("sent", {
      contactId,
      channel,
      event,
      chars: reply.message.length,
      ms: Date.now() - startedAt,
    });
  });

  return Response.json({ ok: true, accepted: event }, { status: 202 });
}
