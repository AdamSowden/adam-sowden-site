// Cloudflare Turnstile server-side verification.
//
// Enabled when TURNSTILE_SECRET_KEY is set (the widget needs the matching
// NEXT_PUBLIC_TURNSTILE_SITE_KEY). With no secret the route skips this check
// and relies on the same-site and form-token gates.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verify a widget response token. Returns `true`/`false` for a definite
 * answer from Cloudflare and `null` when siteverify could not be reached, so
 * the caller can decide to fail open during an outage rather than silently
 * dropping genuine subscribers.
 */
export async function verifyTurnstile(
  token: unknown,
  remoteIp?: string
): Promise<boolean | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp && remoteIp !== "unknown" ? remoteIp : undefined,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("[turnstile] siteverify HTTP", res.status);
      return null;
    }
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (data.success !== true) {
      console.warn("[turnstile] rejected:", data["error-codes"]?.join(",") ?? "unknown");
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[turnstile] siteverify unreachable:", err);
    return null;
  }
}
