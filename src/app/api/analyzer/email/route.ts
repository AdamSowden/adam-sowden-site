// POST /api/analyzer/email  { token, email, costInputs? }
//
// Stores the email (and optional cost inputs) on the job. Sending the full
// report (WP7) and the GHL upsert + speed-to-lead follow-up (WP8) hang off
// this record. Never required before the first finding (spec §13).

import { NextRequest } from "next/server";
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import { after } from "next/server";
import { getStore } from "@/lib/analyzer/store";
import { deliverReport } from "@/lib/analyzer/job";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type Body = { token?: unknown; email?: unknown; firstName?: unknown; costInputs?: { enquiries?: unknown; value?: unknown; closeRate?: unknown } | null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function num(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "string" ? Number(v.replace(/[,$%\s]/g, "")) : typeof v === "number" ? v : NaN;
  return isFinite(n) && n >= min && n <= max ? n : null;
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, { bucket: "analyzer-email", limit: 10, windowSec: 3600 });
  if (!rl.success) return tooManyRequests(rl);
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  // First name: letters, spaces, hyphens and apostrophes only, so a pasted URL or script never becomes a merge field in GHL.
  const firstName = typeof body.firstName === "string" ? body.firstName.trim().replace(/[^\p{L}\p{M} '\-]/gu, "").slice(0, 60) : "";
  if (!/^[a-f0-9]{32}$/.test(token)) return Response.json({ error: "Not found." }, { status: 404 });
  if (!EMAIL_RE.test(email) || email.length > 254) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  const store = getStore();
  const job = await store.getJob(token);
  if (!job) return Response.json({ error: "Not found." }, { status: 404 });

  let costInputs: { enquiries: number; value: number; closeRate: number } | null = null;
  if (body.costInputs) {
    const enquiries = num(body.costInputs.enquiries, 1, 100000);
    const value = num(body.costInputs.value, 1, 100000000);
    const closeRate = num(body.costInputs.closeRate, 0.1, 100);
    if (enquiries && value && closeRate) costInputs = { enquiries, value, closeRate };
  }

  job.email = email;
  job.firstName = firstName || job.firstName;
  job.costInputs = costInputs ?? job.costInputs;
  job.reportSentAt = null;
  job.updatedAt = Date.now();
  await store.putJob(job);
  const ready = job.state === "done" || job.state === "partial";
  // If the job is already finished, build and send now (after the response).
  // Otherwise the slow path sends when it completes.
  if (ready) {
    after(async () => {
      try {
        await deliverReport(job, store);
      } catch (err) {
        console.error("[analyzer] deliverReport error", token, err);
      }
    });
  }
  return Response.json({ ok: true, reportReady: ready });
}
