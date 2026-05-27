// GHL contact upsert for completed Marketing Bottleneck Diagnostics.
//
// Follows the same pattern as src/app/api/subscribe/route.ts but tags the
// contact `diagnostic-completed` and writes diagnostic-specific custom
// fields. The actual owner-notification email is sent by a GHL workflow
// that fires on the `diagnostic-completed` tag — no Resend send for the
// owner here.
//
// Custom fields need to exist in GHL with these exact keys before the
// workflow can reference them. See ./diagnostic-ghl-setup.md or the
// build plan for the GHL admin checklist.

const GHL_LOCATION_ID = "dXsicmsnd5tcT6Q3Ul5Q";
const GHL_SOURCE = "adamsowden.com";
const GHL_API_VERSION = "2021-07-28";
const GHL_CONTACTS_ENDPOINT =
  "https://services.leadconnectorhq.com/contacts/upsert";

const DIAGNOSTIC_TAG = "diagnostic-completed";

type UpsertArgs = {
  email: string;
  firstName: string | null;
  businessName: string | null;
  location: string | null;
  industry: string | null;
  dependencyProfile: string;
  personalisedCtaLine: string;
};

// GHL supports two custom-field formats in /contacts/upsert. The modern
// LeadConnector form is { id, field_value }. Keys are not accepted by
// the upsert endpoint — IDs only. Until the user provides field IDs
// from their GHL dashboard, we fall back to stuffing everything into
// the existing first-class fields (firstName, name, etc.) plus the
// note via the contact upsert's `note` field. The owner workflow can
// then parse the note.
//
// To enable structured custom fields: set these env vars to the GHL
// custom-field IDs (visible in GHL Settings → Custom Fields):
//   GHL_FIELD_ID_BUSINESS_NAME
//   GHL_FIELD_ID_LOCATION
//   GHL_FIELD_ID_INDUSTRY
//   GHL_FIELD_ID_DEPENDENCY_PROFILE
//   GHL_FIELD_ID_PERSONALISED_CTA_LINE
type CustomField = { id: string; field_value: string };

function buildCustomFields(args: UpsertArgs): CustomField[] {
  const fields: CustomField[] = [];
  const map: Array<[string | undefined, string | null]> = [
    [process.env.GHL_FIELD_ID_BUSINESS_NAME, args.businessName],
    [process.env.GHL_FIELD_ID_LOCATION, args.location],
    [process.env.GHL_FIELD_ID_INDUSTRY, args.industry],
    [process.env.GHL_FIELD_ID_DEPENDENCY_PROFILE, args.dependencyProfile],
    [
      process.env.GHL_FIELD_ID_PERSONALISED_CTA_LINE,
      args.personalisedCtaLine,
    ],
  ];
  for (const [id, value] of map) {
    if (id && value && value.trim().length > 0) {
      fields.push({ id, field_value: value.slice(0, 2000) });
    }
  }
  return fields;
}

// Compose a single note string with everything the GHL workflow might
// want to reference, as a fallback when custom-field IDs are not set.
function buildNote(args: UpsertArgs): string {
  const lines = [
    "Marketing Bottleneck Diagnostic completed.",
    "",
    `Business: ${args.businessName ?? "—"}`,
    `Location: ${args.location ?? "—"}`,
    `Industry: ${args.industry ?? "—"}`,
    "",
    "Bottleneck Profile:",
    args.dependencyProfile,
    "",
    "Personalised CTA line:",
    args.personalisedCtaLine,
  ];
  return lines.join("\n");
}

export async function upsertDiagnosticContact(
  args: UpsertArgs
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "GHL_API_KEY not set — diagnostic contact not synced.",
    };
  }

  const customFields = buildCustomFields(args);
  const payload: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    email: args.email,
    source: GHL_SOURCE,
    tags: [DIAGNOSTIC_TAG],
  };
  if (args.firstName) payload.firstName = args.firstName;
  if (customFields.length > 0) payload.customFields = customFields;

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
        error: `GHL upsert failed (${res.status}): ${text.slice(0, 240)}`,
      };
    }

    // Optional: post a follow-up note containing the profile/CTA if no
    // custom-field IDs are configured. We do this in a separate request
    // because /contacts/upsert doesn't accept a note inline. Best-effort.
    if (customFields.length === 0) {
      try {
        const body = (await res.clone().json().catch(() => ({}))) as {
          contact?: { id?: string };
          new?: boolean;
        };
        const contactId = body.contact?.id;
        if (contactId) {
          await fetch(
            `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                Version: GHL_API_VERSION,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ body: buildNote(args) }),
            }
          );
        }
      } catch (err) {
        console.error("GHL note attach failed (non-fatal):", err);
      }
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "GHL network error",
    };
  }
}
