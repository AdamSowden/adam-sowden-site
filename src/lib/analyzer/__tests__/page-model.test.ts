import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parsePage } from "../page-model";
import type { FetchResult } from "../types";

const html = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
const fetched: FetchResult = {
  requestedUrl: "https://acme.test/",
  finalUrl: "https://www.acme.test/",
  status: 200,
  headers: { server: "nginx" },
  contentType: "text/html",
  body: html,
  bodyBytes: Buffer.byteLength(html),
  truncated: false,
  redirects: [],
  elapsedMs: 10,
};

describe("parsePage", () => {
  const p = parsePage(fetched);
  it("reads meta", () => {
    expect(p.meta.title).toContain("Acme Advisory");
    expect(p.meta.description).toContain("Retirement planning");
    expect(p.meta.canonical).toBe("https://www.acme.test/");
    expect(p.meta.generator).toContain("WordPress");
    expect(p.meta.lang).toBe("en");
    expect(p.meta.og.title).toBe("Acme Advisory");
  });
  it("counts headings and H1s", () => {
    expect(p.h1Count).toBe(2);
    expect(p.headings[0]).toEqual({ level: 1, text: "Retire on your terms, not the market's" });
  });
  it("parses JSON-LD including invalid blocks", () => {
    expect(p.jsonLd).toHaveLength(2);
    expect(p.jsonLd[0].valid).toBe(true);
    expect(p.jsonLd[0].types).toContain("Organization");
    expect(p.jsonLd[1].valid).toBe(false);
  });
  it("splits internal and external links, treating www as same site", () => {
    expect(p.internalLinks.map((l) => l.href)).toContain("https://www.acme.test/services");
    expect(p.externalLinks.some((l) => l.href.startsWith("https://linkedin.com"))).toBe(true);
    expect(p.telLinks).toEqual(["tel:+61400000000"]);
    expect(p.mailtoLinks).toEqual(["mailto:hi@acme.test"]);
  });
  it("models forms without hidden or submit fields", () => {
    expect(p.forms).toHaveLength(1);
    expect(p.forms[0].fieldCount).toBe(4);
    expect(p.forms[0].hasEmail).toBe(true);
    expect(p.forms[0].hasPhone).toBe(true);
    expect(p.forms[0].action).toBe("https://www.acme.test/contact");
  });
  it("captures scripts, inline script text and styles", () => {
    expect(p.scripts.some((s) => s.src.includes("gtm.js"))).toBe(true);
    expect(p.inlineScriptText).toContain("dataLayer");
    expect(p.inlineStyleBytes).toBeGreaterThan(0);
    expect(p.stylesheets[0]).toContain("/wp-content/themes/");
  });
  it("extracts visible text, images, iframes, main count", () => {
    expect(p.text).toContain("You built the business");
    expect(p.text).not.toContain("dataLayer");
    expect(p.images).toEqual({ total: 2, withAlt: 1 });
    expect(p.iframes[0]).toContain("leadconnectorhq");
    expect(p.mainCount).toBe(1);
    expect(p.renderedClientSide).toBe(false);
  });
});
