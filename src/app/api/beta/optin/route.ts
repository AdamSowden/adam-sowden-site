// POST /api/beta/optin
//
// The door into the Speed-to-Lead Agent beta. Backs the unlisted
// /try-sms page.
//
// This route's job stops at tagging. It creates or updates the GHL
// contact, records consent, and applies `ai-beta` — then GHL's W1
// workflow fires the webhook and the agent sends the first message. It
// deliberately does NOT send anything itself: the whole point of the
// beta is to prove the GHL-triggered path that every client account will
// run, so sending from here would test a route we never ship.
//
// Sequencing matters. The `ai-beta` tag goes on LAST, after the consent
// record is written. Tagging first would fire the agent before there was
// any evidence the person agreed to be texted.

import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import {
  GHL_API_VERSION,
  GHL_LOCATION_ID,
  GHL_FIELD,
  GHL_TAG,
  addTags,
  updateContactFields,
} from "@/lib/ghl";
import { setPendingQuestion } from "@/lib/agent-guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_UPSERT_ENDPOINT =
  "https://services.leadconnectorhq.com/contacts/upsert";

// Bump this whenever the consent wording on /try-sms changes. Stored
// against the contact so we can always say which text they agreed to.
const CONSENT_TEXT_VERSION = "2026-07-29-beta-sms-v1";

// Mirrors the existing Consent Options field already in use on the GHL
// location, so the beta uses the same wording as every other opt-in
// rather than inventing a second standard.
export const CONSENT_TEXT =
  "I consent to receive automated text messages from Adam Sowden at the phone number provided. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt out.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each submission costs an SMS and a model call, and the page is a public
// URL once shared. Light Redis-backed limits: per IP and per phone.
const RATE_LIMIT_PER_IP_PER_HOUR = 5;
const PHONE_COOLDOWN_SECONDS = 600;

type OptinBody = {
  firstName?: unknown;
  phone?: unknown;
  email?: unknown;
  question?: unknown;
  consent?: unknown;
  // Honeypot. Real users never see this field.
  website?: unknown;
};

function jsonResponse(
  status: number,
  body: Record<string, unknown>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

let redisSingleton: Redis | null = null;
function getRedis(): Redis | null {
  if (redisSingleton) return redisSingleton;
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

// E.164 or nothing. We cannot guess a country from a bare "0412..." —
// Adam is in Australia, most leads are US, and silently picking the wrong
// prefix means the text goes to a stranger or nowhere. Better to ask.
function normalisePhone(raw: string): { phone: string } | { error: string } {
  let s = raw.trim().replace(/[\s()\-.]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (!s.startsWith("+")) {
    return {
      error:
        "Please include your country code, starting with +. For example +61412345678 or +14155550123.",
    };
  }
  const digits = s.slice(1);
  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    return { error: "That does not look like a valid mobile number." };
  }
  return { phone: `+${digits}` };
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

type UpsertResponse = { contact?: { id?: string } };

async function upsertContact(args: {
  firstName: string;
  phone: string;
  email: string;
}): Promise<{ ok: true; contactId: string } | { ok: false; error: string }> {
  const token =
    process.env.GHL_SPEEDTOLEAD_PIT || process.env.GHL_API_KEY || null;
  if (!token) {
    return { ok: false, error: "GHL token not configured." };
  }

  const payload: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    phone: args.phone,
    source: "adamsowden.com/try-sms",
  };
  if (args.firstName) payload.firstName = args.firstName;
  if (args.email) payload.email = args.email;

  try {
    const res = await fetch(GHL_UPSERT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Contact upsert failed (${res.status}): ${text.slice(0, 240)}`,
      };
    }
    const data = (await res.json()) as UpsertResponse;
    const contactId = data.contact?.id;
    if (!contactId) {
      return { ok: false, error: "Upsert succeeded but returned no contact id." };
    }
    return { ok: true, contactId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "GHL network error",
    };
  }
}

// Durable, human-readable consent record on the contact timeline.
// The custom fields are the structured version; this note is the one a
// person can read if a complaint ever needs answering, and it survives
// any later change to the field schema.
async function writeConsentNote(args: {
  contactId: string;
  ip: string;
  at: string;
  question: string;
}): Promise<void> {
  const token =
    process.env.GHL_SPEEDTOLEAD_PIT || process.env.GHL_API_KEY || null;
  if (!token) return;

  const lines = [
    "SMS consent captured via adamsowden.com/try-sms",
    `Timestamp: ${args.at}`,
    `IP: ${args.ip}`,
    `Wording version: ${CONSENT_TEXT_VERSION}`,
    `Wording shown: "${CONSENT_TEXT}"`,
  ];
  if (args.question) lines.push(`They asked: ${args.question}`);

  try {
    await fetch(
      `https://services.leadconnectorhq.com/contacts/${args.contactId}/notes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Version: GHL_API_VERSION,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ body: lines.join("\n") }),
      }
    );
  } catch (err) {
    console.error("[/api/beta/optin] consent note failed:", err);
  }
}

export async function POST(req: NextRequest) {
  let body: OptinBody;
  try {
    body = (await req.json()) as OptinBody;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." });
  }

  // Honeypot: pretend it worked, do nothing.
  if (typeof body.website === "string" && body.website.trim()) {
    return jsonResponse(200, { ok: true });
  }

  if (body.consent !== true) {
    return jsonResponse(400, {
      error: "Please tick the consent box so we can text you.",
    });
  }

  const rawPhone = typeof body.phone === "string" ? body.phone : "";
  if (!rawPhone.trim()) {
    return jsonResponse(400, { error: "Please enter your mobile number." });
  }
  const normalised = normalisePhone(rawPhone);
  if ("error" in normalised) {
    return jsonResponse(400, { error: normalised.error });
  }
  const phone = normalised.phone;

  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
  const emailRaw =
    typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const email = emailRaw && EMAIL_REGEX.test(emailRaw) ? emailRaw : "";
  const question =
    typeof body.question === "string" ? body.question.trim().slice(0, 500) : "";

  const ip = clientIp(req);
  const at = new Date().toISOString();

  // Rate limiting. Skipped rather than failed if Redis is unavailable —
  // a store outage should not close the door on a genuine tester.
  const redis = getRedis();
  if (redis) {
    try {
      const phoneKey = `beta:optin:phone:${phone}`;
      const claimed = await redis.set(phoneKey, at, {
        ex: PHONE_COOLDOWN_SECONDS,
        nx: true,
      });
      if (claimed === null) {
        return jsonResponse(429, {
          error:
            "That number was just submitted. Check your messages, the first text arrives within a minute.",
        });
      }

      const ipKey = `beta:optin:ip:${ip}`;
      const count = await redis.incr(ipKey);
      if (count === 1) await redis.expire(ipKey, 3600);
      if (count > RATE_LIMIT_PER_IP_PER_HOUR) {
        return jsonResponse(429, {
          error: "Too many sign-ups from this connection. Try again later.",
        });
      }
    } catch (err) {
      console.warn("[/api/beta/optin] rate limit check skipped:", err);
    }
  }

  const upsert = await upsertContact({ firstName, phone, email });
  if (!upsert.ok) {
    console.error("[/api/beta/optin] upsert failed:", upsert.error);
    return jsonResponse(502, {
      error: "Could not save your details. Try again shortly.",
    });
  }

  const contactId = upsert.contactId;

  // Consent evidence before the agent is allowed to speak.
  const fields = await updateContactFields(contactId, [
    { key: GHL_FIELD.consentTimestamp.key, value: at },
    { key: GHL_FIELD.consentIp.key, value: ip },
    { key: GHL_FIELD.consentTextVersion.key, value: CONSENT_TEXT_VERSION },
  ]);
  if (!fields.ok) {
    console.error("[/api/beta/optin] consent fields failed:", fields.error);
  }
  await writeConsentNote({ contactId, ip, at, question });

  // Park the opening question for the agent to answer. Must happen before
  // the tag below, since tagging is what triggers the agent.
  if (question) {
    try {
      await setPendingQuestion(contactId, question);
    } catch (err) {
      console.warn("[/api/beta/optin] could not park question:", err);
    }
  }

  // Last: the tag that starts the agent. Everything above has to be on
  // record before this fires.
  const tagged = await addTags(contactId, [GHL_TAG.beta]);
  if (!tagged.ok) {
    console.error("[/api/beta/optin] tag failed:", tagged.error);
    return jsonResponse(502, {
      error:
        "Your details are saved but the agent could not be started. Adam has been notified.",
    });
  }

  console.log(
    "[/api/beta/optin] enrolled",
    JSON.stringify({ contactId, hasEmail: Boolean(email), at })
  );

  return jsonResponse(200, { ok: true });
}
