// The emailed report: short. The diagnosis, the five jobs with a verdict each,
// the three moves, a link to the full web report, one CTA (site-analyser-spec.md
// §8; report decision 15 Oct 2026). Resend, same env as the diagnostic emails.

import type { Report } from "./report";
import { BOOKING_CTA_LABEL, SITE_URL } from "../site";
import { bandLabelFor, type Band } from "./scoring";

const RESEND_API_BASE = "https://api.resend.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderReportEmail(report: Report, reportUrl: string, bookingUrl: string): { subject: string; html: string; text: string } {
  const title = `${report.host} is ${bandLabelFor(report.band as Band, report.moves.length > 0)}.`;
  const subject = `Your site report: ${title}`;
  const jobs = report.jobs.filter((j) => j.job !== "foundation");
  const jobRows = jobs.map((j) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">${esc(j.label)}</td><td style="padding:6px 0 6px 16px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;"><strong>${esc(j.measured ? j.verdict : "Could not measure")}</strong></td></tr>`).join("");
  const moves = report.moves.map((m) => `<li style="margin:0 0 10px 0;"><strong>${esc(m.jobLabel)}.</strong> ${esc(m.move)}<br><span style="color:#555;">${esc(m.consequence)}</span></li>`).join("");
  const cost = report.cost?.applies ? `<p style="margin:18px 0 0 0;">With the numbers you gave, the response gaps are costing roughly $${report.cost.lowMonthly.toLocaleString("en-US")} to $${report.cost.highMonthly.toLocaleString("en-US")} a month. Every step of that working is in the full report.</p>` : "";
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111111;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-size:16px;line-height:1.55;">
<p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#777;">Smart Site Analyzer</p>
<h1 style="font-size:24px;line-height:1.25;margin:0 0 18px 0;">${esc(title)}</h1>
<p style="margin:0 0 18px 0;">${esc(report.narrative.diagnosis)}</p>
<p style="margin:0 0 8px 0;"><strong>The five jobs a website can do, and how yours does on each.</strong></p>
<table style="width:100%;border-collapse:collapse;margin:0 0 18px 0;font-size:15px;">${jobRows}</table>
${moves ? `<p style="margin:0 0 8px 0;"><strong>Where to start.</strong></p><ol style="margin:0 0 18px 20px;padding:0;">${moves}</ol>` : ""}
${cost}
<p style="margin:18px 0 0 0;">The full report has each job explained, what the site looks like fixed, and every check with its evidence.</p>
<p style="margin:18px 0 0 0;"><a href="${esc(reportUrl)}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">Read the full report</a></p>
<p style="margin:28px 0 0 0;">The next step is turning this site into a smart site: the same site, moved onto a build that does the five jobs on its own. The pages and addresses Google already ranks come across with it, and whatever was holding it back gets cleaned up on the way. Twenty minutes on the call to pick the one visitor path most worth fixing first and work out whether there&#39;s a practical fit. No generic pitch, no obligation.</p>
<p style="margin:10px 0 0 0;"><a href="${esc(bookingUrl)}" style="color:#188bf6;">${esc(BOOKING_CTA_LABEL)}</a></p>
<p style="margin:32px 0 0 0;font-size:13px;color:#777;">Checked ${report.pagesChecked} page${report.pagesChecked === 1 ? "" : "s"}, ${report.checksRun} checks. Public pages only; nothing was submitted to the site.</p>
</div></body></html>`;
  const text = [
    title, report.narrative.diagnosis, "",
    "The five jobs:", ...jobs.map((j) => `${j.label}: ${j.measured ? j.verdict : "Could not measure"}`),
    "", ...(report.moves.length ? ["Where to start:", ...report.moves.map((m) => `${m.order}. ${m.jobLabel}. ${m.move} ${m.consequence}`)] : []),
    "", `Full report: ${reportUrl}`, `${BOOKING_CTA_LABEL}: ${bookingUrl}`,
  ].join("\n");
  return { subject, html, text };
}

export async function sendReportEmail(args: { to: string; report: Report; reportUrl: string; bookingUrl: string; fetchImpl?: typeof fetch }): Promise<{ ok: boolean; error?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO;
  const bcc = (process.env.ANALYZER_BCC ?? process.env.DIAGNOSTIC_BCC ?? process.env.RESEND_REPLY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || !from) return { ok: false, error: "Resend not configured (RESEND_API_KEY or RESEND_FROM missing)." };
  const { subject, html, text } = renderReportEmail(args.report, args.reportUrl, args.bookingUrl);
  const body: Record<string, unknown> = { from, to: [args.to], subject, html, text };
  if (replyTo) body.reply_to = replyTo;
  if (bcc.length) body.bcc = bcc;
  try {
    const res = await (args.fetchImpl ?? fetch)(`${RESEND_API_BASE}/emails`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return { ok: false, error: `Resend send failed (${res.status}): ${(await res.text()).slice(0, 240)}` };
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** WP9: short internal alert when the weekly benchmark is not Working. Goes to ANALYZER_BCC or RESEND_REPLY_TO. */
export async function sendBenchmarkAlert(args: { host: string; band: string; overall: number | null; reportUrl: string; previousBand: string | null; fetchImpl?: typeof fetch }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = (process.env.ANALYZER_BCC ?? process.env.RESEND_REPLY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || !from || !to.length) return { ok: false, error: "Resend not configured for alerts (RESEND_API_KEY, RESEND_FROM, ANALYZER_BCC or RESEND_REPLY_TO)." };
  const subject = `Analyzer benchmark: ${args.host} came out ${args.band}`;
  const text = [
    `The weekly benchmark run on ${args.host} came out ${args.band}${args.overall !== null ? ` (internal ${args.overall})` : ""}.${args.previousBand ? ` Last run: ${args.previousBand}.` : ""}`,
    "Either the site regressed or the engine did. Check the report before the next prospect reads a comparison against it.",
    args.reportUrl,
  ].join("\n\n");
  try {
    const res = await (args.fetchImpl ?? fetch)(`${RESEND_API_BASE}/emails`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from, to, subject, text }) });
    if (!res.ok) return { ok: false, error: `Resend alert failed (${res.status}): ${(await res.text()).slice(0, 240)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function reportUrlFor(token: string): string {
  return `${SITE_URL}/analyzer/r/${token}`;
}
