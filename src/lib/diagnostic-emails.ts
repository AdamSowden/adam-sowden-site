// Resend-powered prospect email for the AI Marketing Diagnostic.
//
// Sends a styled HTML report to the prospect after they complete the
// diagnostic. Owner notification email is NOT sent from here — it goes
// out via a GHL workflow triggered by the `diagnostic-completed` tag.
// See diagnostic-ghl.ts for the GHL upsert.
//
// Inline styles only — every email client strips external CSS. Max
// width 640px, navy header, off-white body, serif headings to match
// adamsowden.com palette.

import type { DiagnosticReport } from "./diagnostic-prompts";

const RESEND_API_BASE = "https://api.resend.com";

// ── HTML helpers ────────────────────────────────────────────────────────

// Convert paragraph-separated plain text (\n\n) to a stack of <p> tags
// with the body style. Single paragraphs render as a single <p>.
// Markdown **bold** is converted to <strong>. All other text is escaped.
function paragraphsToHtml(text: string, fontSize = "16px"): string {
  return text
    .split("\n\n")
    .filter((p) => p.trim().length > 0)
    .map(
      (p) =>
        `<p style="margin:0 0 16px; color:#1a2332; font-size:${fontSize}; line-height:1.8;">${escapeAndBold(
          p.trim()
        )}</p>`
    )
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escape HTML first, then convert escaped **bold** markers to <strong>.
// Order matters: escape before bold-wrapping, otherwise an attacker could
// inject HTML inside a bold delimiter. The bold regex matches non-greedy
// content between two pairs of asterisks.
function escapeAndBold(s: string): string {
  const escaped = escapeHtml(s);
  return escaped.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong style="font-weight:600; color:#0a0f1e;">$1</strong>'
  );
}

// ── Template ────────────────────────────────────────────────────────────

type EmailTemplateVars = {
  firstName: string;
  report: DiagnosticReport;
  bookingUrl: string;
};

function renderEmail({
  firstName,
  report,
  bookingUrl,
}: EmailTemplateVars): string {
  const safeName = escapeHtml(firstName);
  // closingParagraph and dependencyProfile may contain markdown **bold**
  // (rare but allowed). personalisedCtaLine is plain text.
  const closing = escapeAndBold(report.closingParagraph);
  const cta = escapeHtml(report.personalisedCtaLine);
  const profile = escapeAndBold(report.dependencyProfile);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Marketing Diagnostic Report</title>
</head>
<body style="margin:0; padding:0; background-color:#F9FAFB; font-family:'Inter', Arial, sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;">
    <tr>
      <td align="center" style="padding:32px 24px;">
        <h1 style="margin:0; color:#ffffff; font-family:Georgia, serif; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
          Your AI Marketing Diagnostic Report
        </h1>
        <p style="margin:8px 0 0; color:rgba(255,255,255,0.55); font-size:14px;">
          Prepared for ${safeName} by Adam Sowden
        </p>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">

          <!-- Intro -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0; color:#1a2332; font-size:16px; line-height:1.7;">
                Hi ${safeName}, here is your personalised AI Marketing Diagnostic Report based on our diagnostic conversation.
              </p>
            </td>
          </tr>

          <!-- Dependency Profile -->
          <tr>
            <td style="background-color:#0a0f1e; border-radius:8px; padding:24px;">
              <h2 style="margin:0 0 12px; color:#ffffff; font-family:Georgia, serif; font-size:18px;">Your AI Marketing Opportunity</h2>
              <p style="margin:0; color:rgba(255,255,255,0.85); font-size:15px; line-height:1.8;">${profile}</p>
            </td>
          </tr>

          <tr><td style="height:32px;"></td></tr>

          <!-- Strategy Gaps -->
          <tr>
            <td style="padding-bottom:32px;">
              <h2 style="margin:0 0 16px; color:#0a0f1e; font-family:Georgia, serif; font-size:20px;">Strategy Gaps</h2>
              <div>${paragraphsToHtml(report.strategyGaps)}</div>
            </td>
          </tr>

          <!-- AI Transformation Status -->
          <tr>
            <td style="padding-bottom:32px;">
              <h2 style="margin:0 0 16px; color:#0a0f1e; font-family:Georgia, serif; font-size:20px;">AI Transformation Status</h2>
              <div>${paragraphsToHtml(report.aiTransformationStatus)}</div>
            </td>
          </tr>

          <!-- Education Position -->
          <tr>
            <td style="padding-bottom:32px;">
              <h2 style="margin:0 0 16px; color:#0a0f1e; font-family:Georgia, serif; font-size:20px;">Education Position</h2>
              <div>${paragraphsToHtml(report.educationPosition)}</div>
            </td>
          </tr>

          <!-- Fix Sequence -->
          <tr>
            <td style="padding-bottom:32px; border-left:3px solid #188bf6; padding-left:20px;">
              <h2 style="margin:0 0 16px; color:#0a0f1e; font-family:Georgia, serif; font-size:20px;">Your Fix Sequence</h2>
              <div>${paragraphsToHtml(report.fixSequence)}</div>
            </td>
          </tr>

          <!-- This Week Quick Win Plan -->
          <tr>
            <td style="padding:24px 28px 32px; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px;">
              <h2 style="margin:0 0 16px; color:#0a0f1e; font-family:Georgia, serif; font-size:20px;">This Week Quick Win Plan</h2>
              <div>${paragraphsToHtml(report.quickWinPlan, "15px")}</div>
            </td>
          </tr>

          <tr><td style="height:32px;"></td></tr>

          <!-- Closing -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0; color:#1a2332; font-size:16px; line-height:1.8;">${closing}</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:32px; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px;">
              <p style="margin:0 0 16px; color:#1a2332; font-size:15px; line-height:1.6; font-style:italic;">
                ${cta}
              </p>
              <a href="${bookingUrl}"
                 style="display:inline-block; background-color:#188bf6; color:#ffffff; font-size:16px; font-weight:600; padding:14px 32px; border-radius:9999px; text-decoration:none;">
                Book MY Free 20-Minute Chat
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:40px;">
              <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.6; border-top:1px solid #ddd; padding-top:20px;">
                Adam Sowden &middot; adamsowden.com<br>
                You received this because you completed the AI Marketing Diagnostic.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Send via Resend ─────────────────────────────────────────────────────

type SendArgs = {
  to: string;
  firstName: string;
  report: DiagnosticReport;
  bookingUrl: string;
};

export async function sendProspectReportEmail(
  args: SendArgs
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const replyTo = process.env.RESEND_REPLY_TO;
  // Comma-separated list of addresses to blind-copy on every prospect
  // report email. Defaults to the configured reply-to address (Adam)
  // so Adam keeps a copy of every report by default. Set to an empty
  // string in env to disable.
  const bccRaw =
    process.env.DIAGNOSTIC_BCC ?? process.env.RESEND_REPLY_TO ?? "";
  const bcc = bccRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        "Resend not configured — RESEND_API_KEY or RESEND_FROM missing.",
    };
  }

  const html = renderEmail({
    firstName: args.firstName,
    report: args.report,
    bookingUrl: args.bookingUrl,
  });

  const subject = `${args.firstName}, your AI Marketing Diagnostic Report is ready`;

  const body: Record<string, unknown> = {
    from,
    to: [args.to],
    subject,
    html,
  };
  if (replyTo) body.reply_to = replyTo;
  if (bcc.length > 0) body.bcc = bcc;

  try {
    const res = await fetch(`${RESEND_API_BASE}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Resend send failed (${res.status}): ${text.slice(0, 240)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend network error",
    };
  }
}
