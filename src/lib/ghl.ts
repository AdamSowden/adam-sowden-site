// Shared GoHighLevel (LeadConnector v2) client.
//
// Consolidates the endpoint/auth constants that were previously
// copy-pasted across api/subscribe, lib/diagnostic-ghl.ts and
// lib/speed-to-lead-ghl.ts. Those three still hold their own copies for
// now (changing proven lead-capture paths is a separate job); everything
// new goes through here.
//
// Auth: prefers GHL_SPEEDTOLEAD_PIT (the dedicated Private Integration
// Token, scoped to contacts + conversations read/write) and falls back to
// GHL_API_KEY so this keeps working before the PIT is wired into Vercel.
//
// Convention matches the rest of lib/: raw fetch, no SDK, env read inside
// the function, and every export returns a result object rather than
// throwing. A GHL failure must never take down the caller.

export const GHL_LOCATION_ID = "dXsicmsnd5tcT6Q3Ul5Q";
export const GHL_API_VERSION = "2021-07-28";

const GHL_BASE = "https://services.leadconnectorhq.com";

// GHL webhook payloads encode message channel as an integer, not a
// string. Confirmed against live captures on 29 Jul 2026: an inbound SMS
// arrives as `message.type === 2`. The docs describe a `direction` and
// `status` field too; neither is actually sent, so never rely on them.
export const GHL_MESSAGE_TYPE = {
  CALL: 1,
  SMS: 2,
  EMAIL: 3,
} as const;

export type AgentChannel = "sms" | "email";

export function channelFromMessageType(type: unknown): AgentChannel | null {
  if (type === GHL_MESSAGE_TYPE.SMS) return "sms";
  if (type === GHL_MESSAGE_TYPE.EMAIL) return "email";
  return null;
}

// Contact custom fields are written by API key but READ back from webhook
// payloads under their display name. Two identifiers for the same field,
// so keep the mapping in one place.
export const GHL_FIELD = {
  agentMode: { key: "ai_agent_mode", displayName: "AI Agent Mode" },
  threadState: { key: "ai_thread_state", displayName: "AI Thread State" },
  lastHandledAt: {
    key: "ai_last_handled_at",
    displayName: "AI Last Handled At",
  },
  consentTimestamp: {
    key: "consent_timestamp",
    displayName: "Consent Timestamp",
  },
  consentIp: { key: "consent_ip", displayName: "Consent IP" },
  consentTextVersion: {
    key: "consent_text_version",
    displayName: "Consent Text Version",
  },
} as const;

export const GHL_TAG = {
  beta: "ai-beta",
  active: "ai-agent-active",
  handover: "ai-handover",
  optOut: "ai-optout",
  escalated: "ai-escalated",
} as const;

export type GhlResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function getToken(): string | null {
  return process.env.GHL_SPEEDTOLEAD_PIT || process.env.GHL_API_KEY || null;
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function ghlFetch<T>(
  path: string,
  init: RequestInit,
  label: string
): Promise<GhlResult<T>> {
  const token = getToken();
  if (!token) {
    return {
      ok: false,
      error: `${label}: neither GHL_SPEEDTOLEAD_PIT nor GHL_API_KEY is set.`,
    };
  }

  try {
    const res = await fetch(`${GHL_BASE}${path}`, {
      ...init,
      headers: { ...headers(token), ...(init.headers ?? {}) },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `${label} failed (${res.status}): ${text.slice(0, 240)}`,
      };
    }

    // Some GHL endpoints return an empty body on success.
    const raw = await res.text();
    if (!raw) return { ok: true, data: undefined as T };
    try {
      return { ok: true, data: JSON.parse(raw) as T };
    } catch {
      return { ok: true, data: undefined as T };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : `${label}: network error`,
    };
  }
}

// ---------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------

export type GhlMessage = {
  id?: string;
  body?: string;
  // 1 = inbound, 2 = outbound in the messages API. Distinct from the
  // webhook payload's message.type, which is the CHANNEL. Confusing, but
  // that's the API.
  direction?: string;
  messageType?: string;
  type?: number;
  dateAdded?: string;
};

type ConversationSearchResponse = {
  conversations?: Array<{ id?: string; lastMessageDate?: string }>;
};

type MessagesResponse = {
  messages?: { messages?: GhlMessage[] };
};

// The webhook payload contains NO conversationId (verified against live
// captures), so every turn has to resolve it from the contact first.
export async function findConversationId(
  contactId: string
): Promise<GhlResult<string | null>> {
  const qs = new URLSearchParams({
    locationId: GHL_LOCATION_ID,
    contactId,
    limit: "1",
  });
  const res = await ghlFetch<ConversationSearchResponse>(
    `/conversations/search?${qs.toString()}`,
    { method: "GET" },
    "Conversation search"
  );
  if (!res.ok) return res;
  const id = res.data?.conversations?.[0]?.id ?? null;
  return { ok: true, data: id };
}

export async function getConversationMessages(
  conversationId: string,
  limit = 20
): Promise<GhlResult<GhlMessage[]>> {
  const res = await ghlFetch<MessagesResponse>(
    `/conversations/${conversationId}/messages?limit=${limit}`,
    { method: "GET" },
    "Conversation messages"
  );
  if (!res.ok) return res;
  return { ok: true, data: res.data?.messages?.messages ?? [] };
}

export type SendMessageArgs = {
  contactId: string;
  channel: AgentChannel;
  body: string;
  /** Email only. Ignored for SMS. */
  subject?: string;
  /** Email only. Defaults to the RESEND_FROM-style identity configured in GHL. */
  fromEmail?: string;
};

export async function sendMessage(
  args: SendMessageArgs
): Promise<GhlResult<{ messageId?: string }>> {
  const payload: Record<string, unknown> =
    args.channel === "sms"
      ? { type: "SMS", contactId: args.contactId, message: args.body }
      : {
          type: "Email",
          contactId: args.contactId,
          subject: args.subject || "Following up",
          html: args.body,
        };

  if (args.channel === "email" && args.fromEmail) {
    payload.emailFrom = args.fromEmail;
  }

  return ghlFetch<{ messageId?: string }>(
    "/conversations/messages",
    { method: "POST", body: JSON.stringify(payload) },
    `Send ${args.channel}`
  );
}

// ---------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------

export async function addTags(
  contactId: string,
  tags: string[]
): Promise<GhlResult<undefined>> {
  return ghlFetch<undefined>(
    `/contacts/${contactId}/tags`,
    { method: "POST", body: JSON.stringify({ tags }) },
    "Add tags"
  );
}

export async function removeTags(
  contactId: string,
  tags: string[]
): Promise<GhlResult<undefined>> {
  return ghlFetch<undefined>(
    `/contacts/${contactId}/tags`,
    { method: "DELETE", body: JSON.stringify({ tags }) },
    "Remove tags"
  );
}

// Writes custom fields by KEY (not display name). GHL accepts
// `customFields: [{ key, field_value }]` on the contact update endpoint.
export async function updateContactFields(
  contactId: string,
  fields: Array<{ key: string; value: string }>
): Promise<GhlResult<undefined>> {
  return ghlFetch<undefined>(
    `/contacts/${contactId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        customFields: fields.map((f) => ({
          key: f.key,
          field_value: f.value,
        })),
      }),
    },
    "Update contact fields"
  );
}

// ---------------------------------------------------------------------
// Webhook payload parsing
// ---------------------------------------------------------------------

// Shape of what GHL's outbound Webhook action actually posts. Verified
// against live captures from W1 (Contact Tag) and W2 (Customer Replied)
// on 29 Jul 2026. Custom fields arrive as top-level keys named after the
// field's DISPLAY NAME, so this type is deliberately open-ended.
export type GhlWebhookPayload = {
  contact_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  /** Comma-separated, NOT an array. Values may contain spaces. */
  tags?: string;
  timezone?: string;
  country?: string;
  contact_source?: string;
  date_created?: string;
  location?: { id?: string; name?: string };
  message?: { type?: number; body?: string };
  workflow?: { id?: string; name?: string };
  customData?: {
    event?: string;
    agent_key?: string;
    locationId?: string;
    contactId?: string;
    channel?: string;
    trigger_source?: string;
  };
  [key: string]: unknown;
};

export function parseTags(tags: unknown): string[] {
  if (typeof tags !== "string" || !tags.trim()) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function hasTag(payload: GhlWebhookPayload, tag: string): boolean {
  return parseTags(payload.tags).includes(tag);
}

/** Reads a custom field from a webhook payload by display name. */
export function readField(
  payload: GhlWebhookPayload,
  field: { displayName: string }
): string {
  const value = payload[field.displayName];
  return typeof value === "string" ? value.trim() : "";
}
