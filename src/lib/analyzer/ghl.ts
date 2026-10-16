// WP8: the analyzer run lands on the GHL contact the moment an email is
// captured, so the speed-to-lead follow-up is written from the findings
// (site-analyser-spec.md §10: "the first follow-up references at least one
// specific finding. Generic follow-up here is self-refuting").
//
// What is written:
//   tags           sl-lead, sl-analyzer-run, analyzer-run
//   custom fields  analyzer_url, analyzer_band, analyzer_top_finding,
//                  analyzer_report_url, analyzer_run_at (by key; they must
//                  exist in GHL, see GHL-SETUP.md)
//   note           everything above plus the three moves, so the record is
//                  readable before the fields exist
//
// The GHL workflow SL-4 (triggered by sl-analyzer-run) sends the follow-up
// cadence and quotes {{contact.analyzer_top_finding}} verbatim. The Resend
// report email is the T+0 touch, as the diagnostic's report email is.
//
// Best-effort throughout: a GHL failure never blocks the report.

import { GHL_FIELD, GHL_TAG, addNote, updateContactFields, upsertContact, type GhlCallOptions } from "../ghl";

export type AnalyzerContactArgs = {
  email: string;
  host: string;
  url: string;
  /** Internal band key, e.g. "Leaking". */
  band: string;
  /** Public phrase, e.g. "losing enquiries". */
  bandLabel: string;
  /** Verbatim top finding with its consequence. Never generic. */
  topFinding: string;
  reportUrl: string;
  runAt: number;
  moves: string[];
  costRange: { low: number; high: number } | null;
};

export type AnalyzerContactResult = { ok: boolean; contactId?: string | null; fieldsWritten: boolean; error?: string };

export function analyzerContactNote(a: AnalyzerContactArgs): string {
  const when = new Date(a.runAt).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return [
    `Smart Site Analyzer run on ${a.host} (${when}).`,
    `Result: ${a.host} is ${a.bandLabel}. (band: ${a.band})`,
    "",
    "Top finding:",
    a.topFinding,
    "",
    a.moves.length ? "Where to start:" : "",
    ...a.moves.map((m, i) => `${i + 1}. ${m}`),
    a.costRange ? `\nCost of the response gaps, from their own numbers: $${a.costRange.low.toLocaleString("en-US")} to $${a.costRange.high.toLocaleString("en-US")} a month.` : "",
    "",
    `Full report: ${a.reportUrl}`,
    `Site: ${a.url}`,
  ].filter((l) => l !== "" || true).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function analyzerContactFields(a: AnalyzerContactArgs): Array<{ key: string; value: string }> {
  return [
    { key: GHL_FIELD.analyzerUrl.key, value: a.url.slice(0, 500) },
    { key: GHL_FIELD.analyzerBand.key, value: a.bandLabel },
    { key: GHL_FIELD.analyzerTopFinding.key, value: a.topFinding.slice(0, 2000) },
    { key: GHL_FIELD.analyzerReportUrl.key, value: a.reportUrl },
    { key: GHL_FIELD.analyzerRunAt.key, value: new Date(a.runAt).toISOString() },
  ];
}

export async function syncAnalyzerContact(a: AnalyzerContactArgs, callOpts: GhlCallOptions = {}): Promise<AnalyzerContactResult> {
  // Contact writes use GHL_API_KEY, the key the diagnostic upsert has proven
  // has contacts write scope. The speed-to-lead PIT is scoped for
  // conversations and returned 401 on /contacts/upsert (checked 16 Oct 2026).
  const opts: GhlCallOptions = { ...callOpts, token: callOpts.token || process.env.GHL_API_KEY || undefined };
  const up = await upsertContact({ email: a.email, source: "analyzer", tags: [GHL_TAG.lead, GHL_TAG.analyzerState, GHL_TAG.analyzerRun] }, opts);
  if (!up.ok) return { ok: false, fieldsWritten: false, error: up.error };
  const contactId = up.data.contactId;
  if (!contactId) return { ok: true, contactId: null, fieldsWritten: false, error: "Upsert returned no contact id." };

  const fields = await updateContactFields(contactId, analyzerContactFields(a), opts);
  const note = await addNote(contactId, analyzerContactNote(a), opts);
  const errors = [fields.ok ? null : fields.error, note.ok ? null : note.error].filter(Boolean);
  return { ok: true, contactId, fieldsWritten: fields.ok, error: errors.length ? errors.join(" | ") : undefined };
}
