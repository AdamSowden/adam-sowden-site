// GET /api/analyzer/benchmark
//
// WP9: the weekly benchmark run, scheduled by Vercel cron (vercel.json) and
// callable by hand with the same secret. Runs adamsowden.com through the
// full engine synchronously, stores it as the benchmark the report compares
// against, and alerts when it is not Working. Never public: Vercel cron
// sends `Authorization: Bearer $CRON_SECRET`; a manual call may use the
// same header or `x-cron-key`.

import { NextRequest } from "next/server";
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import { runBenchmark } from "@/lib/analyzer/benchmark";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  const provided = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "") || req.headers.get("x-cron-key") || "";
  if (provided !== secret) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const psiApiKey = process.env.PSI_API_KEY;
  const out = await runBenchmark({ psiApiKey, skipPsi: !psiApiKey });
  if (!out.ok) {
    console.error("[analyzer] benchmark failed:", out.error);
    return Response.json(out, { status: 502 });
  }
  return Response.json(out);
}
