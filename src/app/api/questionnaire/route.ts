import { NextRequest } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

type Body = {
  email?: string;
  businessDescription?: string;
  stuckOn?: string[];
  tried?: string[];
  platforms?: string[];
  productFit?: string[];
  additionalContext?: string;
  website?: string; // honeypot
};

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { bucket: "questionnaire", limit: 5, windowSec: 60 });
  if (!rl.success) return tooManyRequests(rl);

  const body = (await req.json().catch(() => ({}))) as Body;

  // Honeypot — silently succeed for bots
  if (body.website) {
    return Response.json({ ok: true });
  }

  if (!body.email || typeof body.email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const note = formatNote(body);
  const webhookUrl = process.env.GHL_QUESTIONNAIRE_WEBHOOK_URL;

  // Pre-launch fallback: if the env var isn't set yet (Adam is still
  // wiring up the GHL workflow), log the submission so it isn't lost
  // and return success so the user sees the confirmation state.
  if (!webhookUrl) {
    console.log(
      "[questionnaire] GHL_QUESTIONNAIRE_WEBHOOK_URL not configured. Submission logged:"
    );
    console.log(`  email: ${body.email}`);
    console.log(note);
    return Response.json({ ok: true, fallback: true });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        note,
        // Raw answers, in case the GHL workflow wants to map to custom fields:
        businessDescription: body.businessDescription ?? "",
        stuckOn: body.stuckOn ?? [],
        tried: body.tried ?? [],
        platforms: body.platforms ?? [],
        productFit: body.productFit ?? [],
        additionalContext: body.additionalContext ?? "",
        submittedAt: new Date().toISOString(),
        source: "call-confirmed-questionnaire",
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[questionnaire] GHL webhook failed:",
        res.status,
        text.slice(0, 500)
      );
      return Response.json(
        { error: "Could not save your answers. Try again shortly." },
        { status: 502 }
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[questionnaire] error:", err);
    return Response.json(
      { error: "Network error. Try again shortly." },
      { status: 500 }
    );
  }
}

// Renders the questionnaire as a single readable Note for GHL.
function formatNote(body: Body): string {
  const lines: string[] = [];
  lines.push(`Pre-call questionnaire submitted ${new Date().toISOString()}`);
  lines.push("");

  if (body.businessDescription?.trim()) {
    lines.push("What does the business do?");
    lines.push(body.businessDescription.trim());
    lines.push("");
  }
  if (body.stuckOn?.length) {
    lines.push("Where most stuck:");
    for (const s of body.stuckOn) lines.push(`- ${s}`);
    lines.push("");
  }
  if (body.tried?.length) {
    lines.push("What they've tried so far:");
    for (const s of body.tried) lines.push(`- ${s}`);
    lines.push("");
  }
  if (body.platforms?.length) {
    lines.push("Platforms they've marketed on:");
    for (const s of body.platforms) lines.push(`- ${s}`);
    lines.push("");
  }
  if (body.productFit?.length) {
    lines.push("Most likely product fit:");
    for (const s of body.productFit) lines.push(`- ${s}`);
    lines.push("");
  }
  if (body.additionalContext?.trim()) {
    lines.push("Anything else Adam should know:");
    lines.push(body.additionalContext.trim());
  }
  return lines.join("\n");
}
