import { parsePage } from "../page-model";
import { parseRobots } from "../robots";
import type { CrawlResult, FetchResult, PageModel, SitemapEntry } from "../types";

export function pageFrom(url: string, html: string, headers: Record<string, string> = {}, status = 200): PageModel {
  const fetched: FetchResult = {
    requestedUrl: url, finalUrl: url, status, headers: { "content-type": "text/html", ...headers },
    contentType: "text/html", body: html, bodyBytes: Buffer.byteLength(html), truncated: false, redirects: [], elapsedMs: 5,
  };
  return parsePage(fetched);
}

export function buildCrawl(opts: {
  origin?: string;
  pages: Record<string, string>; // path -> html
  headers?: Record<string, string>;
  robots?: string | null;
  sitemap?: SitemapEntry[] | null;
}): CrawlResult {
  const origin = opts.origin ?? "https://acme.test";
  const host = new URL(origin).hostname;
  const pages = Object.entries(opts.pages).map(([path, html]) => pageFrom(`${origin}${path}`, html, opts.headers));
  const robotsRaw = opts.robots ?? null;
  const robots = robotsRaw == null
    ? { fetched: false, status: null, raw: "", groups: [], sitemaps: [] }
    : { fetched: true, status: 200, raw: robotsRaw, ...parseRobots(robotsRaw) };
  const sitemap = opts.sitemap == null
    ? { fetched: false, urls: [], indexes: [], errors: ["none"], truncated: false }
    : { fetched: true, urls: opts.sitemap, indexes: [], errors: [], truncated: false };
  return { host, home: pages[0], homeFailure: null, pages, failures: [], robots, sitemap, couldNotCheck: [], elapsedMs: 1 };
}

export const html = (o: { title?: string; desc?: string; h1?: string | string[]; body?: string; head?: string; lang?: string }) => `<!doctype html><html${o.lang === undefined ? ' lang="en"' : o.lang ? ` lang="${o.lang}"` : ""}><head><title>${o.title ?? "Acme Advisory: retirement planning for owners"}</title>${o.desc === undefined ? '<meta name="description" content="Retirement planning for business owners who plan to sell within five years. Fee only.">' : o.desc ? `<meta name="description" content="${o.desc}">` : ""}<meta name="viewport" content="width=device-width, initial-scale=1">${o.head ?? ""}</head><body><main>${([] as string[]).concat(o.h1 ?? "Retire on your terms").map((h) => `<h1>${h}</h1>`).join("")}${o.body ?? "<p>" + "You built the business and we help you leave it with the income you want. ".repeat(12) + "</p>"}</main></body></html>`;

export const bySt = (findings: { criterionId: string; status: string }[]) => Object.fromEntries(findings.map((f) => [f.criterionId, f.status]));
