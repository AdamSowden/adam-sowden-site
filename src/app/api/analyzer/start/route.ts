// POST /api/analyzer/start  { url }
//
// Validates, rate limits, runs the fast path inline (headline finding on
// screen in ~15s), then continues the slow path after the response is sent.
// Public and free; no email gate (site-analyser-spec.md §13).

import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import { NextRequest, after } from "next/server";
import { startAnalysis, runSlowPath, toPublicJob } from "@/lib/analyzer/job";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Fast path ~15s plus the slow path continuation (crawl, PSI, assessed layer).
export const maxDuration = 300;

type Body = { url?: unknown };

export async function POST(req: NextRequest) {
  const hourly = await rateLimit(req, { bucket: "analyzer-start", limit: 3, windowSec: 3600 });
  if (!hourly.success) return tooManyRequests(hourly);
  const daily = await rateLimit(req, { bucket: "analyzer-start-day", limit: 20, windowSec: 86400 });
  if (!daily.success) return tooManyRequests(daily);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.url !== "string") return Response.json({ error: "Enter a website address." }, { status: 400 });

  const outcome = await startAnalysis(body.url, { psiApiKey: process.env.PSI_API_KEY });
  if (!outcome.ok) return Response.json({ error: outcome.error }, { status: outcome.status });

  if (!outcome.cached && outcome.job.state !== "failed") {
    const token = outcome.job.token;
    after(async () => {
      try {
        await runSlowPath(token, { psiApiKey: process.env.PSI_API_KEY });
      } catch (err) {
        console.error("[analyzer] slow path error", token, err);
      }
    });
  }
  return Response.json({ job: toPublicJob(outcome.job), cached: outcome.cached });
}
