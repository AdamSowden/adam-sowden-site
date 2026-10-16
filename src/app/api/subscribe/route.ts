import { NextRequest } from "next/server";
import { clientId, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { isSameSiteRequest } from "@/lib/request-origin";
import {
  decoyFormToken,
  formTokenSecret,
  mintFormToken,
  verifyFormToken,
} from "@/lib/subscribe-token";
import { turnstileEnabled, verifyTurnstile } from "@/lib/turnstile";
import {
  domainAcceptsMail,
  emailDomain,
  isDisposableDomain,
} from "@/lib/email-guard";

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

// ── Abuse controls ───────────────────────────────────────────────────
// Oct 2026: bots posted JSON straight at this route (41 opt-ins in four
// days against ~34 real sessions), each one creating a GHL contact and a
// Resend welcome email to a stranger. The gates below run before anything
// is written. Anything that fails a bot gate gets the same 200 {ok:true}
// a real submit gets, so the sender learns nothing.
//
//   1. Same-site headers (Origin / Sec-Fetch-Site).
//   2. Honeypot field.
//   3. Cloudflare Turnstile, when TURNSTILE_SECRET_KEY is configured.
//   4. Signed form token minted by GET /api/subscribe, fetched by the form
//      just before it posts (always on).
//   5. Disposable-domain block list.
//   6. Rate limits: per IP, and a global daily cap on GHL/Resend writes.
//   7. The address's domain must be able to receive mail (MX / A record).
const PER_IP_LIMIT = 3;
const PER_IP_WINDOW_SEC = 10 * 60;
const GLOBAL_DAILY_CAP = Number(process.env.SUBSCRIBE_DAILY_CAP) || 20;
const GLOBAL_WINDOW_SEC = 24 * 60 * 60;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: unknown;
  firstName?: unknown;
  // Honeypot: bots usually fill every field. Real users never see this.
  website?: unknown;
  // Signed token from GET /api/subscribe.
  formToken?: unknown;
  // Turnstile widget response, present when the widget is configured.
  turnstileToken?: unknown;
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
 * The response a bot gets: indistinguishable from a real success. Logged
 * server-side (reason, IP, email domain only) so the Vercel logs show what
 * is being filtered.
 */
function silentDrop(reason: string, req: NextRequest, domain = ""): Response {
  console.warn(
    `[subscribe] dropped (${reason}) ip=${clientId(req)}${domain ? ` domain=${domain}` : ""}`
  );
  return jsonResponse(200, { ok: true });
}

/**
 * GET /api/subscribe: mint the short-lived form token the form sends back
 * with its POST. A caller that does not look like our own page still gets a
 * token-shaped reply, just one that will never verify.
 */
export async function GET(req: NextRequest) {
  const secret = formTokenSecret();
  const site = isSameSiteRequest(req);
  const token = secret && site.ok ? mintFormToken(secret) : decoyFormToken();
  if (!site.ok) console.warn(`[subscribe] decoy token (${site.reason}) ip=${clientId(req)}`);
  return jsonResponse(200, { token });
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
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  // Gate 1: did this come from a page on our site?
  const site = isSameSiteRequest(req);
  if (!site.ok) return silentDrop(site.reason, req);

  // Gate 2: honeypot.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return silentDrop("honeypot", req);
  }

  // Gate 3: Turnstile (only when configured). A siteverify outage (null)
  // falls through to the form-token gate rather than dropping real people.
  if (turnstileEnabled()) {
    const human = await verifyTurnstile(body.turnstileToken, clientId(req));
    if (human === false) return silentDrop("turnstile", req);
  }

  // Gate 4: signed form token from GET /api/subscribe.
  const secret = formTokenSecret();
  if (!secret || !verifyFormToken(body.formToken, secret)) {
    return silentDrop(secret ? "form token" : "no token secret", req);
  }

  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    return jsonResponse(503, {
      error: "Subscriptions are temporarily unavailable.",
    });
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
  const domain = emailDomain(email);

  // Gate 5: disposable inboxes.
  if (isDisposableDomain(domain)) return silentDrop("disposable domain", req, domain);

  // Gate 6: rate limits. Counted only after the cheap gates so bot traffic
  // cannot burn the budget real subscribers share.
  const perIp = await rateLimit(req, {
    bucket: "subscribe",
    limit: PER_IP_LIMIT,
    windowSec: PER_IP_WINDOW_SEC,
  });
  if (!perIp.success) return tooManyRequests(perIp);
  const global = await rateLimit(req, {
    bucket: "subscribe-global",
    id: "all",
    limit: GLOBAL_DAILY_CAP,
    windowSec: GLOBAL_WINDOW_SEC,
  });
  if (!global.success) {
    console.error(`[subscribe] global daily cap (${GLOBAL_DAILY_CAP}) reached`);
    return tooManyRequests(global);
  }

  // Gate 7: the domain must be able to receive mail. Unknown (DNS timeout)
  // is allowed through; only a definitive "no MX, no A" is rejected.
  if ((await domainAcceptsMail(domain)) === false) {
    console.warn(`[subscribe] no mail records ip=${clientId(req)} domain=${domain}`);
    return jsonResponse(400, {
      error: "That email domain cannot receive mail. Please check the address.",
    });
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
