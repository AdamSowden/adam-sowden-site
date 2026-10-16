// Same-site check for form-backed API routes.
//
// Browsers always send `Origin` on a POST made with fetch() and, in every
// current engine, `Sec-Fetch-Site: same-origin` for a request the page makes
// to its own origin. A script posting JSON straight at the route sends
// neither (or sends a foreign one). This is a cheap first gate, not a proof:
// headers can be forged. Pair it with the signed form token and, where
// configured, Turnstile.

import { SITE_URL } from "@/lib/site";

export type SameSiteResult = { ok: true } | { ok: false; reason: string };

function hostOf(value: string): string | null {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

function withWwwTwin(host: string): string[] {
  return host.startsWith("www.") ? [host, host.slice(4)] : [host, `www.${host}`];
}

/** Hosts a legitimate request may come from: the deployment itself and the canonical site. */
export function allowedHosts(req: Request): Set<string> {
  const hosts = new Set<string>();
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const own = (forwarded || req.headers.get("host") || "").toLowerCase();
  if (own) withWwwTwin(own).forEach((h) => hosts.add(h));
  const canonical = hostOf(SITE_URL);
  if (canonical) withWwwTwin(canonical).forEach((h) => hosts.add(h));
  return hosts;
}

/**
 * True when the request looks like it was made by a page on this site.
 * Requires `Sec-Fetch-Site: same-origin` when the header is present, and an
 * `Origin` (or, for GET, a `Referer`) whose host is one of ours.
 */
export function isSameSiteRequest(req: Request): SameSiteResult {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return { ok: false, reason: `sec-fetch-site=${fetchSite}` };
  }
  const source = req.headers.get("origin") ?? req.headers.get("referer");
  if (!source) return { ok: false, reason: "no origin or referer" };
  const host = hostOf(source);
  if (!host) return { ok: false, reason: "unparseable origin" };
  if (!allowedHosts(req).has(host)) {
    return { ok: false, reason: `foreign origin ${host}` };
  }
  return { ok: true };
}
