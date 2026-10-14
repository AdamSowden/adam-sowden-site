// The emailed report: short. Headline, the three fixes, a link to the full
// web report, one CTA (site-analyser-spec.md §8). Resend, same env as the
// diagnostic emails.

import type { Report } from "./report";
import { SITE_URL } from "../site";

const RESEND_API_BASE = "https://api.resend.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderReportEmail(report: Report, reportUrl: string, bookingUrl: string): { subject: string; html: string; text: string } {
  const subject = `Your site report for ${report.host}: ${report.band}`;
  const fixes = report.fixes.map((f) => `<li style="margin:0 0 10px 0;"><strong>${esc(f.fix)}</strong><br><span style="color:#555;">${esc(f.consequence)}</span></li>`).join("");
  const cost = report.cost?.applies ? `<p style="margin:18px 0 0 0;">With the numbers you gave, the response gaps are costing roughly $${report.cost.lowMonthly.toLocaleString("en-US")} to $${report.cost.highMonthly.toLocaleString("en-US")} a month. Every step of that working is in the full report.</p>` : "";
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111111;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;font-size:16px;line-height:1.55;">
<p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#777;">Smart Site Analyzer</p>
<h1 style="font-size:24px;line-height:1.25;margin:0 0 18px 0;">${esc(report.host)}: ${esc(report.band)}</h1>
<p style="margin:0 0 18px 0;">${esc(report.bandMeaning)}</p>
${report.headline ? `<p style="margin:0 0 6px 0;"><strong>The finding that matters most.</strong></p><p style="margin:0 0 6px 0;">${esc(report.headline.statement)}</p><p style="margin:0 0 18px 0;color:#555;">${esc(report.headline.consequence)}</p>` : ""}
<p style="margin:0 0 8px 0;"><strong>The three things to fix, in order.</strong></p>
<ol style="margin:0 0 18px 20px;padding:0;">${fixes}</ol>
${cost}
<p style="margin:18px 0 0 0;">The full report has every finding with its evidence, grouped by area, and what the site looks like once the fixes are done.</p>
<p style="margin:18px 0 0 0;"><a href="${esc(reportUrl)}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">Read the full report</a></p>
<p style="margin:28px 0 0 0;">If you want to talk through what it would take to fix, book a 20-minute call. No pitch.</p>
<p style="margin:10px 0 0 0;"><a href="${esc(bookingUrl)}" style="color:#188bf6;">Book a Quick Chat</a></p>
<p style="margin:32px 0 0 0;font-size:13px;color:#777;">Checked ${report.pagesChecked} page${report.pagesChecked === 1 ? "" : "s"}, ${report.checksRun} checks. Public pages only; nothing was submitted to the site.</p>
</div></body></html>`;
  const text = [
    `${report.host}: ${report.band}`, report.bandMeaning, "",
    report.headline ? `The finding that matters most: ${report.headline.statement} ${report.headline.consequence}` : "",
    "", "The three things to fix, in order:", ...report.fixes.map((f) => `${f.order}. ${f.fix} ${f.consequence}`),
    "", `Full report: ${reportUrl}`, `Book a Quick Chat: ${bookingUrl}`,
  ].filter((l) => l !== undefined).join("\n");
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

export function reportUrlFor(token: string): string {
  return `${SITE_URL}/analyzer/r/${token}`;
}
