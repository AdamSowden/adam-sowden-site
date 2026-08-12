// POST /api/diagnostic/report
//
// Generates the personalised report after email capture. One-shot LLM
// call to Claude Opus with the full conversation transcript, forced
// tool use to validate the JSON shape. Persists the report, then fires
// (non-blocking) the prospect email via Resend and the GHL contact
// upsert with the `diagnostic-completed` tag.

import { setDefaultResultOrder } from "node:dns";
// Force IPv4-first DNS resolution. See diagnostic/message/route.ts for
// the full explanation. Same fix needed here because Opus calls go to
// the same api.anthropic.com host.
setDefaultResultOrder("ipv4first");

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  DIAGNOSTIC_REPORT_MODEL,
  SUBMIT_REPORT_TOOL,
  buildReportSystemPrompt,
  buildTranscript,
  type DiagnosticReport,
} from "@/lib/diagnostic-prompts";
import {
  getSession,
  markComplete,
} from "@/lib/diagnostic-store";
import { sendProspectReportEmail } from "@/lib/diagnostic-emails";
import { upsertDiagnosticContact } from "@/lib/diagnostic-ghl";
import { BOOKING_URL, SITE_URL } from "@/lib/site";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow extra time for the Opus generation. Anthropic typically responds
// in 15-30s; budget 90s to be safe.
export const maxDuration = 90;

type Body = { sessionToken?: unknown };

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { bucket: "diagnostic-report", limit: 5, windowSec: 60 });
  if (!rl.success) return tooManyRequests(rl);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Diagnostic report generator is not configured." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionToken =
    typeof body.sessionToken === "string" ? body.sessionToken.trim() : "";
  if (!sessionToken) {
    return Response.json(
      { error: "sessionToken is required." },
      { status: 400 }
    );
  }

  let session;
  try {
    session = await getSession(sessionToken);
  } catch (err) {
    console.error("[/api/diagnostic/report] store error:", err);
    return Response.json(
      { error: "Session store unavailable." },
      { status: 503 }
    );
  }

  if (!session) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }
  if (!session.email) {
    return Response.json(
      { error: "Email has not been captured yet." },
      { status: 400 }
    );
  }
  if (session.report) {
    // Idempotent: return the already-generated report.
    return Response.json({ report: session.report });
  }

  const transcript = buildTranscript(session.conversationHistory);
  const systemPrompt = buildReportSystemPrompt({
    firstName: session.firstName ?? "",
    businessName: session.businessName ?? "",
    location: session.location ?? "",
    industry: session.industry ?? "",
    transcript,
  });

  // Generous timeout — Opus can take 30-60s on a multi-paragraph report.
  // 3 retries on transient network errors.
  const client = new Anthropic({
    apiKey,
    maxRetries: 3,
    timeout: 120_000,
  });

  let report: DiagnosticReport;
  try {
    const result = await client.messages.create({
      model: DIAGNOSTIC_REPORT_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools: [SUBMIT_REPORT_TOOL],
      tool_choice: { type: "tool", name: SUBMIT_REPORT_TOOL.name },
      messages: [
        { role: "user", content: "Generate the personalised report now." },
      ],
    });

    const toolUse = result.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("No tool_use block returned by the report model.");
    }
    report = toolUse.input as DiagnosticReport;
  } catch (err) {
    console.error("[/api/diagnostic/report] LLM error:", err);
    return Response.json(
      { error: "Could not generate the report. Please try again." },
      { status: 502 }
    );
  }

  // Sanity-check: log any missing required fields. The forced tool schema
  // should make this impossible, but we've seen partial responses slip
  // through under load.
  const missingFields = [
    "dependencyProfile",
    "strategyGaps",
    "aiTransformationStatus",
    "educationPosition",
    "fixSequence",
    "quickWinPlan",
    "closingParagraph",
    "personalisedCtaLine",
  ].filter(
    (f) => typeof (report as unknown as Record<string, unknown>)[f] !== "string"
  );
  if (missingFields.length > 0) {
    console.warn(
      "[/api/diagnostic/report] LLM returned report with missing fields:",
      missingFields,
      "Raw report keys:",
      Object.keys(report ?? {})
    );
  }

  // Brand-voice backstop: scrub em-dashes from every text field. Now
  // defensive against undefined fields so a partial LLM response renders
  // empty placeholders rather than crashing the request.
  report = scrubEmDashes(report);

  try {
    await markComplete(sessionToken, report);
  } catch (err) {
    console.error("[/api/diagnostic/report] persist error:", err);
    // Continue anyway — the user still gets the rendered report, and the
    // email/GHL hooks below fire from in-memory data.
  }

  // Non-blocking side effects. We don't await these in a way that would
  // delay the response to the user. The browser shows the report
  // immediately; the email and CRM sync happen in the background.
  if (session.email) {
    void fireSideEffects(session.email, session.firstName, session.businessName, session.location, session.industry, report);
  }

  return Response.json({ report });
}

async function fireSideEffects(
  email: string,
  firstName: string | null,
  businessName: string | null,
  location: string | null,
  industry: string | null,
  report: DiagnosticReport
) {
  const bookingUrl = BOOKING_URL.startsWith("http")
    ? BOOKING_URL
    : `${SITE_URL}${BOOKING_URL}`;

  const [emailResult, ghlResult] = await Promise.allSettled([
    sendProspectReportEmail({
      to: email,
      firstName: firstName ?? "there",
      report,
      bookingUrl,
    }),
    upsertDiagnosticContact({
      email,
      firstName,
      businessName,
      location,
      industry,
      dependencyProfile: report.dependencyProfile,
      personalisedCtaLine: report.personalisedCtaLine,
    }),
  ]);

  if (emailResult.status === "rejected" || (emailResult.status === "fulfilled" && !emailResult.value.ok)) {
    const detail =
      emailResult.status === "rejected"
        ? String(emailResult.reason)
        : emailResult.value.error;
    console.error("[diagnostic] prospect email send failed:", detail);
  }
  if (ghlResult.status === "rejected" || (ghlResult.status === "fulfilled" && !ghlResult.value.ok)) {
    const detail =
      ghlResult.status === "rejected"
        ? String(ghlResult.reason)
        : ghlResult.value.error;
    console.error("[diagnostic] GHL upsert failed:", detail);
  }
}

function scrubEmDashes(report: DiagnosticReport): DiagnosticReport {
  // Defensive: any required field that comes back undefined/null from the
  // LLM is replaced with an empty string rather than crashing the whole
  // request. The forced tool_use schema should prevent this, but a
  // refusal or partial response can still slip through.
  const strip = (s: unknown): string =>
    typeof s === "string" ? s.replace(/\s*—\s*/g, ", ") : "";
  const matrix = Array.isArray(report.effortImpactMatrix)
    ? report.effortImpactMatrix
    : [];
  return {
    ...report,
    dependencyProfile: strip(report.dependencyProfile),
    strategyGaps: strip(report.strategyGaps),
    aiTransformationStatus: strip(report.aiTransformationStatus),
    educationPosition: strip(report.educationPosition),
    fixSequence: strip(report.fixSequence),
    quickWinPlan: strip(report.quickWinPlan),
    closingParagraph: strip(report.closingParagraph),
    personalisedCtaLine: strip(report.personalisedCtaLine),
    effortImpactMatrix: matrix.map((item) => ({
      ...item,
      label: strip(item?.label),
    })),
  };
}
