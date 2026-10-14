import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { crawlSite } from "../crawl";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";

const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
const page = (t: string) => `<html><head><title>${t}</title></head><body><h1>${t}</h1><p>${"word ".repeat(250)}</p></body></html>`;

describe("crawlSite", () => {
  const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
  const fetchImpl = fakeFetch({
    "https://acme.test/": { status: 301, headers: { location: "https://www.acme.test/" } },
    "https://www.acme.test/": { body: home },
    "https://www.acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nDisallow: /about\nSitemap: https://www.acme.test/sitemap.xml\n" },
    "https://www.acme.test/sitemap.xml": { headers: { "content-type": "application/xml" }, body: `<urlset><url><loc>https://www.acme.test/pricing</loc><lastmod>2026-10-01</lastmod></url><url><loc>https://www.acme.test/blog/tag/x</loc></url></urlset>` },
    "https://www.acme.test/services": { body: page("Services") },
    "https://www.acme.test/about": { body: page("About") },
    "https://www.acme.test/pricing": { body: page("Pricing") },
    "https://www.acme.test/blog/tag/x": { body: page("Tag") },
  });

  it("fetches home, honours robots for other pages, prefers high-value paths", async () => {
    const r = await crawlSite("acme.test", { fetchImpl, resolver, maxPages: 3 });
    expect(r.homeFailure).toBeNull();
    expect(r.host).toBe("www.acme.test");
    expect(r.robots.fetched).toBe(true);
    expect(r.sitemap.urls).toHaveLength(2);
    const urls = r.pages.map((p) => p.finalUrl);
    expect(urls[0]).toBe("https://www.acme.test/");
    expect(urls).toContain("https://www.acme.test/services");
    expect(urls).not.toContain("https://www.acme.test/about"); // disallowed
    expect(r.pages.length).toBeLessThanOrEqual(3);
    expect(urls).not.toContain("https://www.acme.test/blog/tag/x"); // low value, outranked
  });

  it("reports a homepage fetch failure as could-not-check", async () => {
    const r = await crawlSite("https://nope.test/", { fetchImpl, resolver });
    expect(r.home).toBeNull();
    expect(r.homeFailure?.reason).toBe("dns-failed");
    expect(r.couldNotCheck[0].scope).toBe("all");
  });
});
