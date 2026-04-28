import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── GHL ──────────────────────────────────────────────────────────────
const GHL_LOCATION_ID = "dXsicmsnd5tcT6Q3Ul5Q";
const GHL_TAG = "adam-sowden-newsletter";
const GHL_SOURCE = "adamsowden.com";
const GHL_API_VERSION = "2021-07-28";
// Upsert: creates new contacts AND updates existing ones, re-applying
// the tag every call. The GHL Workflow "tag added" trigger fires reliably
// even for returning subscribers or contacts that already exist in GHL
// from another source but weren't previously tagged for the newsletter.
const GHL_CONTACTS_ENDPOINT =
  "https://services.leadconnectorhq.com/contacts/upsert";

// ── Resend ───────────────────────────────────────────────────────────
const RESEND_API_BASE = "https://api.resend.com";

// ── ─────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: unknown;
  firstName?: unknown;
  // Honeypot: bots usually fill every field. Real users never see this.
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

/**
 * Add the contact to the Resend audience for newsletter broadcasts.
 *
 * Best-effort: if this fails, we log it server-side but do NOT fail the
 * subscribe request. GHL is the source of truth and the welcome workflow
 * has already fired by the time we get here. Resend failures are
 * recoverable later via a sync script.
 *
 * Returns true if the contact is now in the audience (newly added or
 * already existed), false otherwise.
 */
async function addToResendAudience(
  email: string,
  firstName: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.warn(
      "Resend not configured (RESEND_API_KEY or RESEND_AUDIENCE_ID missing). Skipping audience add."
    );
    return false;
  }

  try {
    const res = await fetch(
      `${RESEND_API_BASE}/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          unsubscribed: false,
        }),
      }
    );

    if (res.ok) return true;

    // 4xx with "already exists" type message → treat as success.
    const text = await res.text();
    if (
      (res.status === 400 || res.status === 409 || res.status === 422) &&
      /already|exist|duplicate/i.test(text)
    ) {
      return true;
    }

    console.error("Resend audience add failed:", res.status, text);
    return false;
  } catch (err) {
    console.error("Resend audience add error:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    return jsonResponse(503, {
      error: "Subscriptions are temporarily unavailable.",
    });
  }

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  // Honeypot: silently succeed without doing anything when filled.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return jsonResponse(200, { ok: true });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const firstName =
    typeof body.firstName === "string"
      ? body.firstName.trim().slice(0, 80)
      : "";

  if (!email || !EMAIL_REGEX.test(email) || email.length > 200) {
    return jsonResponse(400, { error: "Please enter a valid email address." });
  }

  try {
    // Step 1 — GHL upsert (CRM source of truth, fires welcome workflow)
    const ghlRes = await fetch(GHL_CONTACTS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        email,
        firstName: firstName || undefined,
        tags: [GHL_TAG],
        source: GHL_SOURCE,
      }),
    });

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error("GHL contact upsert failed:", ghlRes.status, errText);
      return jsonResponse(502, {
        error: "We could not save your details. Please try again in a minute.",
      });
    }

    let ghlPayload: { new?: boolean } = {};
    try {
      ghlPayload = (await ghlRes.json()) as { new?: boolean };
    } catch {
      // Response wasn't JSON. Treat as a successful new create.
    }
    const alreadySubscribed = ghlPayload.new === false;

    // Step 2 — Resend audience add (broadcast list, best-effort)
    // Run after GHL succeeds so the welcome workflow has been triggered
    // even if Resend has an outage. Don't await in a way that blocks
    // the response if Resend hangs — but we DO want to know synchronously
    // whether it worked, so we do await with the function's own internal
    // try/catch keeping it from throwing.
    const inResend = await addToResendAudience(email, firstName);

    return jsonResponse(200, {
      ok: true,
      alreadySubscribed,
      // Hidden in the success message rendering, but available for
      // monitoring and debugging in network responses.
      inResend,
    });
  } catch (err) {
    console.error("subscribe route error:", err);
    return jsonResponse(502, {
      error: "We could not save your details. Please try again in a minute.",
    });
  }
}
