import { describe, it, expect } from "vitest";
import { parseSitemapXml, fetchSitemaps } from "../sitemap";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";

describe("sitemap", () => {
  it("parses a urlset with lastmod", () => {
    const { urls } = parseSitemapXml(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://acme.test/a</loc><lastmod>2026-09-01</lastmod></url><url><loc>https://acme.test/b</loc></url></urlset>`);
    expect(urls).toEqual([{ loc: "https://acme.test/a", lastmod: "2026-09-01" }, { loc: "https://acme.test/b", lastmod: null }]);
  });
  it("follows a sitemap index", async () => {
    const resolver = fakeResolver({ "acme.test": PUBLIC });
    const fetchImpl = fakeFetch({
      "https://acme.test/sitemap.xml": { headers: { "content-type": "application/xml" }, body: `<sitemapindex><sitemap><loc>https://acme.test/post-sitemap.xml</loc></sitemap></sitemapindex>` },
      "https://acme.test/post-sitemap.xml": { headers: { "content-type": "application/xml" }, body: `<urlset><url><loc>https://acme.test/post-1</loc><lastmod>2026-10-01</lastmod></url></urlset>` },
    });
    const m = await fetchSitemaps("https://acme.test", [], { fetchImpl, resolver });
    expect(m.fetched).toBe(true);
    expect(m.indexes).toEqual(["https://acme.test/sitemap.xml"]);
    expect(m.urls[0].loc).toBe("https://acme.test/post-1");
  });
  it("reports missing sitemaps without throwing", async () => {
    const resolver = fakeResolver({ "acme.test": PUBLIC });
    const fetchImpl = fakeFetch({});
    const m = await fetchSitemaps("https://acme.test", [], { fetchImpl, resolver });
    expect(m.fetched).toBe(false);
    expect(m.errors.length).toBeGreaterThan(0);
  });
});
