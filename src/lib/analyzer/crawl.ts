// Site crawl: homepage, then up to N pages chosen from navigation links and
// the sitemap, same site only, robots honoured for everything but the
// homepage, polite concurrency.

import { safeFetch, isFetchFailure, ANALYZER_UA, type FetchOptions } from "./fetch";
import { parsePage } from "./page-model";
import { fetchRobots, isAllowed } from "./robots";
import { fetchSitemaps } from "./sitemap";
import { normaliseInput, sameSite } from "./url-guard";
import type { CouldNotCheck, CrawlResult, FetchFailure, PageModel } from "./types";

export type CrawlOptions = FetchOptions & {
  maxPages?: number;
  concurrency?: number;
};

const SKIP_PATH = /\.(pdf|jpe?g|png|gif|svg|webp|mp4|mp3|zip|docx?|xlsx?|pptx?|css|js|xml|json|ico)(\?|$)/i;
const LOW_VALUE = /\/(tag|tags|category|categories|author|page|feed|wp-json|cart|checkout|login|signin|register|account|privacy|terms|cookie|sitemap)(\/|$)/i;
const ARTICLE_PATH_RE = /\/(blog|post|posts|article|articles|news|insights)\/[a-z0-9-]{8,}/i;
const HIGH_VALUE = /\/(services?|products?|solutions?|pricing|about|team|contact|book|work-with|for-|industries|case-stud|results|faq|how-it-works)/i;

function canonicalKey(u: string): string {
  try {
    const x = new URL(u);
    x.hash = "";
    x.search = "";
    let p = x.pathname.replace(/\/+$/, "") || "/";
    p = p.toLowerCase();
    return `${x.hostname.replace(/^www\./, "")}${p}`;
  } catch {
    return u;
  }
}

function rankCandidates(home: PageModel, sitemapUrls: string[], host: string): string[] {
  const scored = new Map<string, number>();
  const add = (u: string, score: number) => {
    try {
      const x = new URL(u);
      if (!sameSite(x.hostname, host)) return;
      if (SKIP_PATH.test(x.pathname)) return;
      if (x.pathname === "/" || x.pathname === "") return;
      const key = canonicalKey(u);
      scored.set(key, Math.max(scored.get(key) ?? -Infinity, score));
    } catch {
      /* ignore */
    }
  };
  // Nav links first: those inside <nav> or <header> would be ideal, but the
  // model only keeps the flat list, so weight by position and path shape.
  home.internalLinks.forEach((l, i) => {
    let s = 100 - Math.min(i, 60);
    if (HIGH_VALUE.test(l.href)) s += 40;
    if (LOW_VALUE.test(l.href)) s -= 60;
    add(l.href, s);
  });
  sitemapUrls.forEach((u) => {
    let s = 20;
    if (HIGH_VALUE.test(u)) s += 30;
    if (LOW_VALUE.test(u)) s -= 40;
    add(u, s);
  });
  return [...scored.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function crawlSite(input: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  const started = Date.now();
  const maxPages = opts.maxPages ?? 8;
  const concurrency = opts.concurrency ?? 3;
  const couldNotCheck: CouldNotCheck[] = [];
  const failures: FetchFailure[] = [];

  const normalised = normaliseInput(input);
  const emptyRobots = { fetched: false, status: null, raw: "", groups: [], sitemaps: [] };
  const emptySitemap = { fetched: false, urls: [], indexes: [], errors: [], truncated: false };
  if (!normalised) {
    return { host: "", home: null, homeFailure: { requestedUrl: input, reason: "invalid-url", detail: "Not a valid URL." }, pages: [], failures, robots: emptyRobots, sitemap: emptySitemap, couldNotCheck, elapsedMs: 0 };
  }

  const homeRes = await safeFetch(normalised, opts);
  if (isFetchFailure(homeRes)) {
    return { host: new URL(normalised).hostname, home: null, homeFailure: homeRes, pages: [], failures, robots: emptyRobots, sitemap: emptySitemap, couldNotCheck: [{ scope: "all", reason: `Homepage could not be fetched: ${homeRes.reason}.` }], elapsedMs: Date.now() - started };
  }
  const home = parsePage(homeRes);
  const origin = new URL(home.finalUrl).origin;
  const host = new URL(home.finalUrl).hostname;

  if (home.status >= 400) couldNotCheck.push({ scope: "home", reason: `Homepage returned HTTP ${home.status}.` });
  if (home.renderedClientSide) couldNotCheck.push({ scope: "content", reason: "Page content is rendered by JavaScript; text-based checks ran on the initial HTML only." });

  const robots = await fetchRobots(origin, opts);
  const sitemap = await fetchSitemaps(origin, robots.sitemaps, opts);
  if (!robots.fetched) couldNotCheck.push({ scope: "robots", reason: "No robots.txt was found." });
  if (!sitemap.fetched) couldNotCheck.push({ scope: "sitemap", reason: "No sitemap was found." });

  const candidates = rankCandidates(home, sitemap.urls.map((u) => u.loc), host);
  const homeKey = canonicalKey(home.finalUrl);
  const allowed = (path: string) => isAllowed(robots, ANALYZER_UA, path) && isAllowed(robots, "*", path);
  const pathFromKey = (key: string) => "/" + key.split("/").slice(1).join("/");
  const toFetch: string[] = [];
  // Reserve one slot for the most recent article so article-level checks can run.
  const latestArticle = sitemap.urls
    .filter((u) => ARTICLE_PATH_RE.test(u.loc) && !LOW_VALUE.test(u.loc))
    .sort((a, b) => (b.lastmod ?? "").localeCompare(a.lastmod ?? ""))[0];
  if (latestArticle && maxPages > 2) {
    try {
      const u = new URL(latestArticle.loc);
      if (sameSite(u.hostname, host) && allowed(u.pathname)) toFetch.push(`${origin}${u.pathname}`);
    } catch { /* ignore */ }
  }
  for (const key of candidates) {
    if (toFetch.length >= maxPages - 1) break;
    if (key === homeKey) continue;
    const path = pathFromKey(key);
    if (toFetch.some((t) => canonicalKey(t) === key)) continue;
    if (!allowed(path)) continue;
    toFetch.push(`${origin}${path}`);
  }

  const results = await mapLimit(toFetch, concurrency, (u) => safeFetch(u, opts));
  const pages: PageModel[] = [home];
  results.forEach((r) => {
    if (isFetchFailure(r)) failures.push(r);
    else if (r.status < 400) pages.push(parsePage(r));
    else failures.push({ requestedUrl: r.requestedUrl, reason: "http-error", status: r.status, detail: `HTTP ${r.status}` });
  });

  return { host, home, homeFailure: null, pages, failures, robots, sitemap, couldNotCheck, elapsedMs: Date.now() - started };
}
