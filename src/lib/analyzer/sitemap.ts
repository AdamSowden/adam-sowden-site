// Sitemap discovery and parsing with sitemap-index support and hard caps.

import * as cheerio from "cheerio";
import { safeFetch, isFetchFailure, type FetchOptions } from "./fetch";
import type { SitemapEntry, SitemapModel } from "./types";

const MAX_URLS = 2000;
const MAX_INDEX_CHILDREN = 10;

export function parseSitemapXml(xml: string): { urls: SitemapEntry[]; children: string[] } {
  const $ = cheerio.load(xml, { xml: true });
  const urls: SitemapEntry[] = [];
  const children: string[] = [];
  $("sitemapindex > sitemap").each((_, el) => {
    const loc = $(el).find("loc").first().text().trim();
    if (loc) children.push(loc);
  });
  $("urlset > url").each((_, el) => {
    const loc = $(el).find("loc").first().text().trim();
    if (!loc) return;
    const lastmod = $(el).find("lastmod").first().text().trim() || null;
    urls.push({ loc, lastmod });
  });
  return { urls, children };
}

export async function fetchSitemaps(origin: string, declared: string[], opts: FetchOptions = {}): Promise<SitemapModel> {
  const candidates = [...new Set([...declared, new URL("/sitemap.xml", origin).toString(), new URL("/sitemap_index.xml", origin).toString()])];
  const model: SitemapModel = { fetched: false, urls: [], indexes: [], errors: [], truncated: false };
  const seen = new Set<string>();
  const queue = candidates.slice();
  let indexChildren = 0;
  while (queue.length && model.urls.length < MAX_URLS) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    const res = await safeFetch(url, { ...opts, allowNonHtml: true, maxBytes: 5 * 1024 * 1024 });
    if (isFetchFailure(res)) {
      model.errors.push(`${url}: ${res.reason}`);
      continue;
    }
    if (res.status >= 400 || !/<(urlset|sitemapindex)/i.test(res.body.slice(0, 2000))) {
      model.errors.push(`${url}: ${res.status >= 400 ? `HTTP ${res.status}` : "not a sitemap"}`);
      continue;
    }
    model.fetched = true;
    const { urls, children } = parseSitemapXml(res.body);
    if (children.length) {
      model.indexes.push(url);
      for (const c of children) {
        if (indexChildren >= MAX_INDEX_CHILDREN) {
          model.truncated = true;
          break;
        }
        indexChildren++;
        queue.push(c);
      }
    }
    for (const u of urls) {
      if (model.urls.length >= MAX_URLS) {
        model.truncated = true;
        break;
      }
      model.urls.push(u);
    }
    // Only keep trying fallbacks if nothing declared worked yet.
    if (model.fetched && !declared.length && !children.length) break;
  }
  return model;
}
