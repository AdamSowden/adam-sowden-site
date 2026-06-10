// Speed-to-Lead early lead capture for GHL.
//
// Fires the moment we first have a lead's email (e.g. partway through the
// AI Marketing Diagnostic), tagging them `sl-lead` so the Speed-to-Lead
// instant-response + follow-up workflows in GHL can engage them even if
// they never finish the diagnostic. This is distinct from
// ./diagnostic-ghl.ts, which only upserts on diagnostic COMPLETION with
// the `diagnostic-completed` tag.
//
// Same v2 LeadConnector contract as diagnostic-ghl.ts. Best-effort: a
// failure here must never break the caller's flow.
//
// Token: uses GHL_API_KEY (the proven contacts-write key the diagnostic
// already uses). Once the dedicated Speed-to-Lead integration token
// (GHL_SPEEDTOLEAD_PIT) is confirmed to have contacts write scope, swap
// it in here.

const GHL_LOCATION_ID = "dXsicmsnd5tcT6Q3Ul5Q";
const GHL_API_VERSION = "2021-07-28";
const GHL_CONTACTS_ENDPOINT =
  "https://services.leadconnectorhq.com/contacts/upsert";

const SPEED_TO_LEAD_TAG = "sl-lead";

export type SpeedToLeadCapture = {
  email: string;
  firstName?: string | null;
  // Where the lead came from, e.g. "diagnostic" or "chat". Appended to the
  // GHL source as `adamsowden.com/<source>`.
  source?: string;
  // Optional state tag fired alongside `sl-lead`, e.g.
  // "sl-diagnostic-started". Lets GHL workflows branch on lead state.
  stateTag?: string;
};

export async function captureSpeedToLead(
  args: SpeedToLeadCapture
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "GHL_API_KEY not set — sl-lead not captured." };
  }

  const tags = [SPEED_TO_LEAD_TAG];
  if (args.stateTag) tags.push(args.stateTag);

  const payload: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    email: args.email,
    source: args.source ? `adamsowden.com/${args.source}` : "adamsowden.com",
    tags,
  };
  if (args.firstName) payload.firstName = args.firstName;

  try {
    const res = await fetch(GHL_CONTACTS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
        error: `Speed-to-Lead upsert failed (${res.status}): ${text.slice(0, 240)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "GHL network error",
    };
  }
}
