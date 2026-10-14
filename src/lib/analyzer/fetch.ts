// Safe fetcher for the Analyzer: identified UA, timeout, body cap, manual
// redirect following with the SSRF guard re-applied on every hop.

import { guardUrl, type Resolver, defaultResolver } from "./url-guard";
import type { FetchFailure, FetchResult, HttpHeaders } from "./types";

export const ANALYZER_UA =
  "SmartSitesAnalyzer/1.0 (+https://adamsowden.com/analyzer; checks public pages only)";

export type FetchOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  resolver?: Resolver;
  /** Accept any content type (used for robots.txt and sitemaps). */
  allowNonHtml?: boolean;
  fetchImpl?: typeof fetch;
};

const DEFAULTS = { timeoutMs: 10_000, maxBytes: 2 * 1024 * 1024, maxRedirects: 5 };

function headersToObject(h: Headers): HttpHeaders {
  const out: HttpHeaders = {};
  h.forEach((v, k) => {
    out[k.toLowerCase()] = v;
  });
  return out;
}

async function readCapped(res: Response, maxBytes: number): Promise<{ text: string; bytes: number; truncated: boolean }> {
  if (!res.body) return { text: "", bytes: 0, truncated: false };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    received += value.byteLength;
    if (received > maxBytes) {
      chunks.push(value.subarray(0, value.byteLength - (received - maxBytes)));
      truncated = true;
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      break;
    }
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  const ct = res.headers.get("content-type") || "";
  const m = ct.match(/charset=([^;]+)/i);
  let charset = (m?.[1] || "utf-8").trim().toLowerCase().replace(/^"|"$/g, "");
  if (charset === "utf8") charset = "utf-8";
  let text: string;
  try {
    text = new TextDecoder(charset).decode(buf);
  } catch {
    text = new TextDecoder("utf-8").decode(buf);
  }
  return { text, bytes: total, truncated };
}

/**
 * Fetch a URL safely. Returns a FetchResult or a FetchFailure; never throws for
 * expected conditions. A failure is reported as "could not check", never as a
 * finding against the site.
 */
export async function safeFetch(input: string, opts: FetchOptions = {}): Promise<FetchResult | FetchFailure> {
  const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs;
  const maxBytes = opts.maxBytes ?? DEFAULTS.maxBytes;
  const maxRedirects = opts.maxRedirects ?? DEFAULTS.maxRedirects;
  const resolver = opts.resolver ?? defaultResolver;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const started = Date.now();
  const redirects: string[] = [];
  let current = input;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const guard = await guardUrl(current, resolver);
    if (!guard.ok) {
      return {
        requestedUrl: input,
        reason: hop === 0 ? guard.reason : "redirect-to-blocked",
        detail: guard.detail,
      };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetchImpl(guard.url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": ANALYZER_UA,
          accept: opts.allowNonHtml
            ? "text/plain,text/xml,application/xml,text/html;q=0.9,*/*;q=0.5"
            : "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "accept-language": "en-US,en;q=0.8",
          "accept-encoding": "gzip, deflate, br",
        },
      });
    } catch (e) {
      clearTimeout(timer);
      const msg = (e as Error).name === "AbortError" ? "timeout" : "network";
      return { requestedUrl: input, reason: msg, detail: (e as Error).message || msg };
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { requestedUrl: input, reason: "http-error", status: res.status, detail: "Redirect without a Location header." };
      let next: string;
      try {
        next = new URL(loc, guard.url).toString();
      } catch {
        return { requestedUrl: input, reason: "http-error", status: res.status, detail: `Bad redirect target: ${loc}` };
      }
      redirects.push(next);
      if (hop === maxRedirects) {
        return { requestedUrl: input, reason: "too-many-redirects", detail: `More than ${maxRedirects} redirects.` };
      }
      current = next;
      continue;
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const isHtml = /text\/html|application\/xhtml\+xml/.test(contentType) || contentType === "";
    if (!opts.allowNonHtml && !isHtml) {
      try {
        await res.body?.cancel();
      } catch {
        /* ignore */
      }
      return { requestedUrl: input, reason: "non-html", status: res.status, detail: `Content type ${contentType || "unknown"}.` };
    }
    const { text, bytes, truncated } = await readCapped(res, maxBytes);
    return {
      requestedUrl: input,
      finalUrl: guard.url.toString(),
      status: res.status,
      headers: headersToObject(res.headers),
      contentType,
      body: text,
      bodyBytes: bytes,
      truncated,
      redirects,
      elapsedMs: Date.now() - started,
    };
  }
  return { requestedUrl: input, reason: "too-many-redirects", detail: "Redirect loop." };
}

export function isFetchFailure(r: FetchResult | FetchFailure): r is FetchFailure {
  return (r as FetchFailure).reason !== undefined;
}
