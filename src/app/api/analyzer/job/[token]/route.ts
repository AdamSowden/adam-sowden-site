// GET /api/analyzer/job/:token  -> public view of a job for progress polling.

import { NextRequest } from "next/server";
import { getStore } from "@/lib/analyzer/store";
import { toPublicJob } from "@/lib/analyzer/job";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const rl = await rateLimit(req, { bucket: "analyzer-poll", limit: 240, windowSec: 60 });
  if (!rl.success) return tooManyRequests(rl);
  const { token } = await ctx.params;
  if (!/^[a-f0-9]{32}$/.test(token)) return Response.json({ error: "Not found." }, { status: 404 });
  const job = await getStore().getJob(token);
  if (!job) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ job: toPublicJob(job) }, { headers: { "cache-control": "no-store" } });
}
