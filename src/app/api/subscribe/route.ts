import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GHL_LOCATION_ID = "dXsicmsnd5tcT6Q3Ul5Q";
const GHL_TAG = "adam-sowden-newsletter";
const GHL_SOURCE = "adamsowden.com";
const GHL_API_VERSION = "2021-07-28";
// Upsert endpoint creates new contacts AND updates existing ones,
// re-applying the tag every call. This is critical for the GHL Workflow
// "tag added" trigger to fire reliably even for returning subscribers
// or for contacts that already exist in GHL from another source but
// weren't previously tagged for the newsletter.
const GHL_CONTACTS_ENDPOINT =
  "https://services.leadconnectorhq.com/contacts/upsert";

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

    // Upsert: GHL returns {new: true} if a new contact was created and
    // {new: false} if an existing one was updated. Either way the tag
    // is re-applied, which fires the GHL "tag added" workflow trigger.
    if (ghlRes.ok) {
      let payload: { new?: boolean } = {};
      try {
        payload = (await ghlRes.json()) as { new?: boolean };
      } catch {
        // Response wasn't JSON, but the upsert succeeded. Treat as new.
      }
      return jsonResponse(200, {
        ok: true,
        alreadySubscribed: payload.new === false,
      });
    }

    const errText = await ghlRes.text();
    console.error("GHL contact upsert failed:", ghlRes.status, errText);
    return jsonResponse(502, {
      error: "We could not save your details. Please try again in a minute.",
    });
  } catch (err) {
    console.error("subscribe route error:", err);
    return jsonResponse(502, {
      error: "We could not save your details. Please try again in a minute.",
    });
  }
}
