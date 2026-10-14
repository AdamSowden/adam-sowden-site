import { describe, it, expect } from "vitest";
import { buildCrawl, html, bySt } from "./extractors.helpers";
import { runSeo } from "../extractors/seo";
import { runAeo } from "../extractors/aeo";
import { runContentDepth, contentMonthsActive } from "../extractors/content-depth";
import { classifyChat, runEngagement } from "../extractors/engagement";
import { runConversionPath } from "../extractors/conversion-path";
import { runMeasurement } from "../extractors/measurement";
import { runAgenticBuild, fingerprint } from "../extractors/agentic-build";
import { runPerformance } from "../extractors/performance";
import { parsePsi } from "../psi";

const noFetch = { fetchImpl: (async () => new Response("", { status: 599 })) as unknown as typeof fetch, resolver: async () => { throw new Error("no dns in tests"); } };

describe("seo extractor", () => {
  it("passes a clean site and fails the builder-template H1 case", async () => {
    const clean = buildCrawl({
      pages: { "/": html({ head: '<link rel="canonical" href="https://acme.test/">' }), "/services": html({ title: "Services for owners selling in five years", head: '<link rel="canonical" href="https://acme.test/services">' }) },
      robots: "User-agent: *\nAllow: /\nSitemap: https://acme.test/sitemap.xml", sitemap: [{ loc: "https://acme.test/", lastmod: null }],
    });
    const r = bySt((await runSeo({ crawl: clean, psi: null })).findings);
    expect(r["seo-01"]).toBe("pass"); expect(r["seo-02"]).toBe("pass"); expect(r["seo-03"]).toBe("pass"); expect(r["seo-06"]).toBe("pass"); expect(r["seo-11"]).toBe("pass");

    const bad = buildCrawl({ pages: { "/": html({ h1: ["One", "1", ""], head: '<meta name="robots" content="noindex">' }), "/a": html({ h1: ["x", "y"], title: "Acme Advisory: retirement planning for owners" }) } });
    const b = bySt((await runSeo({ crawl: bad, psi: null })).findings);
    expect(b["seo-01"]).toBe("fail"); expect(b["seo-02"]).toBe("fail"); expect(b["seo-03"]).toBe("fail"); expect(b["seo-06"]).toBe("fail"); expect(b["seo-04"]).toBe("partial");
  });
});

describe("aeo extractor", () => {
  it("fails when GPTBot is blocked and passes schema parity", async () => {
    const faq = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How much does retirement planning cost?","acceptedAnswer":{"@type":"Answer","text":"From $3,000."}}]}</script><script type="application/ld+json">{"@type":"Organization","name":"Acme Advisory","url":"https://acme.test","sameAs":["https://linkedin.com/company/acme"]}</script>`;
    const c = buildCrawl({
      pages: { "/": html({ head: faq, body: '<p>You built the business. We help you leave it with the income you want, in plain terms, with a plan you can read in ten minutes.</p><h2>How much does retirement planning cost?</h2><p>From $3,000.</p><a href="/about">About</a>' }) },
      robots: "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /", sitemap: [{ loc: "https://acme.test/", lastmod: new Date().toISOString() }],
    });
    const r = bySt((await runAeo({ crawl: c, psi: null })).findings);
    expect(r["aeo-01"]).toBe("fail"); expect(r["aeo-02"]).toBe("pass"); expect(r["aeo-03"]).toBe("pass"); expect(r["aeo-04"]).toBe("pass"); expect(r["aeo-06"]).toBe("partial"); expect(r["aeo-09"]).toBe("pass");
  });
  it("reports no robots as not blocking and no schema as fail", async () => {
    const c = buildCrawl({ pages: { "/": html({}) } });
    const r = bySt((await runAeo({ crawl: c, psi: null })).findings);
    expect(r["aeo-01"]).toBe("pass"); expect(r["aeo-02"]).toBe("fail"); expect(r["aeo-03"]).toBe("fail"); expect(r["aeo-04"]).toBe("na"); expect(r["aeo-09"]).toBe("na");
  });
});

describe("content depth", () => {
  it("counts active months and flags near-duplicate pages", async () => {
    const now = new Date("2026-10-14");
    expect(contentMonthsActive(["2026-10-01", "2026-09-15", "2026-09-20", "2025-01-01", null], now)).toBe(2);
    const same = "<p>" + "We provide expert accounting services in your city with a dedicated team ready to help. ".repeat(20) + "</p>";
    const c = buildCrawl({ pages: { "/": html({ body: same }), "/city-a": html({ title: "Accounting in City A for small firms", body: same }), "/city-b": html({ title: "Accounting in City B for small firms", body: same }) } });
    const r = bySt((await runContentDepth({ crawl: c, psi: null })).findings);
    expect(r["cd-04"]).toBe("fail"); expect(r["cd-02"]).toBe("na"); expect(r["cd-06"]).toBe("fail");
  });
});

describe("engagement classification", () => {
  it("classes GHL as capture, Tidio as live chat, Chatbase as agent, none as T0", async () => {
    const mk = (head: string) => buildCrawl({ pages: { "/": html({ head }) } });
    expect(classifyChat(mk('<script src="https://widgets.leadconnectorhq.com/loader.js" data-chat-widget-id="x"></script>')).cls).toBe(1);
    expect(classifyChat(mk('<script src="https://code.tidio.co/abc.js"></script>')).cls).toBe(3);
    expect(classifyChat(mk('<script src="https://www.chatbase.co/embed.min.js"></script>')).cls).toBe(4);
    expect(classifyChat(mk("<p>Our conversation agent talks to visitors.</p>")).cls).toBe(0);
    const r = await runEngagement({ crawl: mk(""), psi: null, fetchOpts: noFetch });
    expect(r.score).toBe(5); expect(bySt(r.findings)["eng-01"]).toBe("fail"); expect(bySt(r.findings)["eng-02"]).toBe("na");
  });
});

describe("conversion path", () => {
  it("scores a nine-field form with no other path as leaking", async () => {
    const form = '<form action="/contact" method="post">' + Array.from({ length: 9 }, (_, i) => `<input type="text" name="f${i}">`).join("") + '<input type="email" name="email"></form>';
    const c = buildCrawl({ pages: { "/": html({ body: form + "<p>Call us on 0400 000 000 and we will get back to you.</p>" }) } });
    const r = bySt((await runConversionPath({ crawl: c, psi: null })).findings);
    expect(r["cp-01"]).toBe("fail"); expect(r["cp-02"]).toBe("fail"); expect(r["cp-04"]).toBe("fail"); expect(r["cp-05"]).toBe("partial"); expect(r["cp-06"]).toBe("fail"); expect(r["cp-07"]).toBe("fail");
  });
  it("passes a site with booking, tel, response promise and first-person CTA", async () => {
    const body = '<a href="https://calendly.com/acme/intro">Book my call</a><a href="tel:+61400000000">Call</a><a href="/start">Get my plan</a><p>We reply within 5 minutes, 24/7.</p><form method="post" action="/x"><input type="email" name="email"></form>';
    const c = buildCrawl({ pages: { "/": html({ body }) }, sitemap: [{ loc: "https://acme.test/thank-you", lastmod: null }] });
    const r = bySt((await runConversionPath({ crawl: c, psi: null })).findings);
    expect(r["cp-01"]).toBe("pass"); expect(r["cp-02"]).toBe("pass"); expect(r["cp-04"]).toBe("pass"); expect(r["cp-05"]).toBe("pass"); expect(r["cp-06"]).toBe("pass"); expect(r["cp-07"]).toBe("pass"); expect(r["cp-09"]).toBe("pass"); expect(r["cp-10"]).toBe("pass");
  });
});

describe("measurement", () => {
  it("flags duplicate GA4 properties and hardcoded tags beside GTM", async () => {
    const head = `<script src="https://www.googletagmanager.com/gtm.js?id=GTM-AAAA1"></script><script src="https://www.googletagmanager.com/gtag/js?id=G-AAAAAAAAA1"></script><script>gtag('config','G-BBBBBBBBB2'); gtag('config','G-AAAAAAAAA1');</script><script src="https://connect.facebook.net/en_US/fbevents.js"></script><script>fbq('init','123456789012');fbq('track','PageView');</script>`;
    const c = buildCrawl({ pages: { "/": html({ head }) } });
    const r = bySt((await runMeasurement({ crawl: c, psi: null })).findings);
    expect(r["m-01"]).toBe("pass"); expect(r["m-02"]).toBe("partial"); expect(r["m-03"]).toBe("partial"); expect(r["m-05"]).toBe("uncertain"); expect(r["m-07"]).toBe("na");
  });
  it("fails a site with nothing and passes conversion events with a thank-you page", async () => {
    const none = bySt((await runMeasurement({ crawl: buildCrawl({ pages: { "/": html({}) } }), psi: null })).findings);
    expect(none["m-01"]).toBe("fail"); expect(none["m-04"]).toBe("fail");
    const head = `<script src="https://www.googletagmanager.com/gtag/js?id=G-AAAAAAAAA1"></script><script>window.dataLayer=[];document.querySelector('form')?.addEventListener('submit',()=>dataLayer.push({event:'lead_submit'}));</script>`;
    const c = buildCrawl({ pages: { "/": html({ head, body: '<a href="/thank-you">x</a>' }) } });
    const r = bySt((await runMeasurement({ crawl: c, psi: null })).findings);
    expect(r["m-04"]).toBe("pass"); expect(r["m-02"]).toBe("partial");
  });
  it("requires consent for EU signals", async () => {
    const c = buildCrawl({ origin: "https://acme.co.uk", pages: { "/": html({ lang: "en-GB", head: '<script src="https://www.googletagmanager.com/gtag/js?id=G-AAAAAAAAA1"></script>' }) } });
    expect(bySt((await runMeasurement({ crawl: c, psi: null })).findings)["m-07"]).toBe("fail");
  });
});

describe("agentic build", () => {
  it("scores Elementor with many plugins near zero and Next+Sanity+Vercel high", async () => {
    const plugins = Array.from({ length: 25 }, (_, i) => `<script src="/wp-content/plugins/plugin-${i}/x.js"></script>`).join("");
    const el = buildCrawl({ pages: { "/": html({ head: `<meta name="generator" content="WordPress 6.5">${plugins}<script src="/wp-includes/js/jquery/jquery.min.js?ver=1.12.4"></script><link rel="stylesheet" href="/wp-content/plugins/elementor/a.css">`, body: '<div data-elementor-type="wp-page"><style>' + "a{}".repeat(80000) + "</style><p>" + "word ".repeat(300) + "</p></div>" }) }, headers: { server: "LiteSpeed", "x-powered-by": "PHP/8.1" } });
    const fp = fingerprint(el);
    expect(fp.wordpress).toBe(true); expect(fp.builders).toContain("Elementor"); expect(fp.pluginCount).toBe(26); // 25 plugins plus the elementor stylesheet path expect(fp.jqueryVersion).toBe("1.12.4");
    const r = await runAgenticBuild({ crawl: el, psi: null, fetchOpts: noFetch });
    expect(r.score).toBeLessThanOrEqual(5);

    const nx = buildCrawl({
      pages: { "/": html({ head: '<script src="/_next/static/chunks/a.js"></script><link rel="alternate" type="application/rss+xml" href="/feed.xml"><script src="https://www.chatbase.co/embed.min.js"></script>', body: '<img src="https://cdn.sanity.io/images/x/y.png"><a href="/diagnostic">Diagnostic</a><p>We reply within 2 minutes. ' + "word ".repeat(300) + "</p>" }) },
      headers: { server: "Vercel", "x-vercel-id": "abc" },
      sitemap: Array.from({ length: 45 }, (_, i) => ({ loc: `https://acme.test/blog/post-number-${i}-about-things`, lastmod: new Date(Date.now() - i * 7 * 86400000).toISOString() })),
    });
    const r2 = await runAgenticBuild({ crawl: nx, psi: null, fetchOpts: noFetch });
    expect(r2.score).toBeGreaterThanOrEqual(90);
    expect(bySt(r2.findings)["ab-platform"]).toBe("pass");
  });
});

describe("performance via PSI parse", () => {
  it("parses a minimal PSI payload and grades it", async () => {
    const psi = parsePsi({
      lighthouseResult: { categories: { performance: { score: 0.42 }, seo: { score: 0.9 }, accessibility: { score: 0.88 }, "best-practices": { score: 0.75 } }, audits: { "largest-contentful-paint": { numericValue: 8100 }, "cumulative-layout-shift": { numericValue: 0.29 }, "total-blocking-time": { numericValue: 4950 }, "server-response-time": { numericValue: 60 }, "dom-size": { numericValue: 2200 }, "third-party-summary": { details: { summary: { wastedBytes: 520000, wastedMs: 4500 } } } } },
      loadingExperience: { metrics: {} },
    }, "mobile");
    expect(psi.scores.performance).toBe(42); expect(psi.field.source).toBeNull();
    const r = bySt((await runPerformance({ crawl: buildCrawl({ pages: { "/": html({}) } }), psi })).findings);
    expect(r["perf-01"]).toBe("fail"); expect(r["perf-02"]).toBe("fail"); expect(r["perf-03"]).toBe("fail"); expect(r["perf-04"]).toBe("pass"); expect(r["perf-05"]).toBe("fail"); expect(r["perf-06"]).toBe("fail"); expect(r["perf-07"]).toBe("partial");
  });
  it("marks everything na without PSI", async () => {
    const r = (await runPerformance({ crawl: buildCrawl({ pages: { "/": html({}) } }), psi: null })).findings;
    expect(r.every((f) => f.status === "na")).toBe(true);
  });
});
