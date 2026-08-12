// Rate limiting for public API routes. See SECURITY-PLAN.md (G-sec).
//
// Uses Upstash Ratelimit when Upstash/KV env is configured (the same store the
// diagnostic already uses), and falls back to a best-effort in-memory limiter
// when it is not, so a chat-only site that has not provisioned Upstash still
// degrades gracefully instead of failing wide open. In-memory is per-lambda on
// Vercel, so it is weaker than the distributed limiter (effective limit scales
// with the number of running instances). Provision Upstash for real protection;
// the fallback is a floor, not the target.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const UPSTASH_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const UPSTASH_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hasUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

export type RateResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when the window resets
};

// ── Upstash (distributed) ───────────────────────────────────────────────
// One Ratelimit instance per (limit, window) config, cached.
const upstashLimiters = new Map<string, Ratelimit>();
let redis: Redis | null = null;

function upstashLimiter(limit: number, windowSec: number): Ratelimit {
  const key = `${limit}:${windowSec}`;
  let rl = upstashLimiters.get(key);
  if (!rl) {
    redis ??= new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
    rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "ratelimit",
    });
    upstashLimiters.set(key, rl);
  }
  return rl;
}

// ── In-memory fallback (per-instance) ───────────────────────────────────
const memory = new Map<string, number[]>();
let warned = false;

function memoryLimit(id: string, limit: number, windowSec: number): RateResult {
  if (!warned) {
    console.warn(
      "[rate-limit] Upstash not configured; using per-instance in-memory fallback. " +
        "Set UPSTASH_REDIS_REST_URL/TOKEN for distributed limiting."
    );
    warned = true;
  }
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const hits = (memory.get(id) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  memory.set(id, hits);
  if (memory.size > 5000) {
    for (const [k, v] of memory) {
      if (v.every((t) => now - t >= windowMs)) memory.delete(k);
    }
  }
  return {
    success: hits.length <= limit,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: now + windowMs,
  };
}

// ── Public API ──────────────────────────────────────────────────────────

/** Best-effort client identifier from proxy headers. */
export function clientId(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (
    fwd?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Rate-limit a request. `bucket` namespaces the limit per endpoint so the chat
 * budget is separate from the subscribe budget for the same IP.
 */
export async function rateLimit(
  req: Request,
  opts: { limit: number; windowSec: number; bucket: string }
): Promise<RateResult> {
  const id = `${opts.bucket}:${clientId(req)}`;
  if (hasUpstash) {
    const r = await upstashLimiter(opts.limit, opts.windowSec).limit(id);
    return {
      success: r.success,
      limit: r.limit,
      remaining: r.remaining,
      reset: r.reset,
    };
  }
  return memoryLimit(id, opts.limit, opts.windowSec);
}

/** Standard 429 response with Retry-After. */
export function tooManyRequests(result: RateResult): Response {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down and try again." }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfter),
        "x-ratelimit-limit": String(result.limit),
        "x-ratelimit-remaining": String(result.remaining),
      },
    }
  );
}
