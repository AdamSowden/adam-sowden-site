import { describe, it, expect } from "vitest";
import { buildCrawl, html, bySt } from "./extractors.helpers";
import { buildWindows, renderWindows } from "../assess/windows";
import { runMessageMeasured, fleschKincaid, slopDensity, sentenceVariation } from "../assess/measured";
import { buildSystemPrompt, reconcile, verifyEvidence, type Assessment } from "../assess/model";
import { OFFER_RUBRIC, TARGET_MARKET_RUBRIC } from "../assess/rubrics";
import { runAssessedLayer } from "../assess";

const site = buildCrawl({
  pages: {
    "/": html({
      title: "Acme Advisory — Retirement planning for owners selling in five years",
      h1: "Retire on your terms, not the market's",
      body: `<p>You built the business. We help you leave it with the income you want. <a href="/start">Get my income plan</a></p>
      <h2>Who this is for</h2><p>Owners doing $2M to $20M who plan to sell within five years. If you want the cheapest option, this is not it.</p>
      <h2>How it works</h2><p>Step 1, we map your income. Step 2, we build the plan. It takes two meetings and about three hours of your time. Pricing is scoped per client from $3,000.</p>
      <p>"Our lead value went from $1M to $10M in four months." Sarah, Financial Adviser, Denver</p>
      <p>Over 26 years and $1 billion in appointments booked. Call <a href="tel:+17200000000">+1 720 000 0000</a>. <a href="https://www.linkedin.com/in/acme">LinkedIn</a> <a href="https://g.page/acme/review">Google reviews</a> <a href="/privacy">Privacy</a> <a href="/terms">Terms</a></p>
      <p>Suite 4, 12 Main Street, Lafayette CO. Acme Advisory LLC.</p>`,
    }),
    "/for-advisers": html({ title: "For financial advisers selling the practice", h1: "For advisers", body: "<p>" + "You advise clients all day and your own exit plan is the last thing on the list. ".repeat(10) + "</p>" }),
  },
  sitemap: [{ loc: "https://acme.test/for-advisers", lastmod: null }],
});

describe("windows", () => {
  it("builds hero, opening and page windows with a verifiable corpus", () => {
    const w = buildWindows(site);
    expect(w.hero).toContain("Retire on your terms");
    expect(w.hero).toContain("[CTA: Get my income plan]");
    expect(w.pages.length).toBe(2);
    expect(w.pages[0].proofLines.some((l) => l.includes("$1M to $10M"))).toBe(true);
    expect(renderWindows(w)).toContain("--- PAGE /for-advisers ---");
    expect(w.corpus).toContain("Owners doing $2M to $20M");
  });
});

describe("measured message criteria", () => {
  it("scores you/we, buying stage, audience pages, CTA, business and third-party signals", () => {
    const w = buildWindows(site);
    const r = bySt(runMessageMeasured(site, w));
    expect(["pass", "partial"]).toContain(r["tm-04"]); // fixture copy is deliberately you/we mixed
    expect(r["tm-06"]).toBe("pass");
    expect(r["tm-07"]).toBe("pass");
    expect(r["of-05"]).toBe("pass");
    expect(r["tr-06"]).toBe("pass");
    expect(r["tr-07"]).toBe("pass");
  });
  it("readability helpers behave", () => {
    const plain = "You built the business. We help you leave it well. It takes two meetings. You keep control. The plan is yours. ".repeat(6);
    expect(fleschKincaid(plain).grade).toBeLessThan(6);
    const slop = slopDensity("We leverage a seamless, robust and holistic approach to unlock growth — genuinely. " + "word ".repeat(100));
    expect(slop.per1k).toBeGreaterThan(5);
    expect(slop.hits).toContain("seamless");
    expect(sentenceVariation("Short one. Another short one. Yet another short line. Still short here. And short.")).toBeLessThan(0.3);
  });
});

describe("model reconciliation", () => {
  const corpus = buildWindows(site).corpus;
  const run = (over: Partial<Record<string, { status: "pass" | "partial" | "fail" | "na"; evidence?: string }>>): Assessment => ({
    criteria: OFFER_RUBRIC.criteria.filter((c) => c.kind === "assessed").map((c) => ({
      criterionId: c.id,
      status: over[c.id]?.status ?? "pass",
      evidence: over[c.id]?.evidence ?? "Owners doing $2M to $20M who plan to sell within five years.",
      note: "ok",
      location: "hero",
      confidence: "high" as const,
    })),
  });
  it("keeps agreeing verified statuses", () => {
    const f = bySt(reconcile(run({}), run({}), OFFER_RUBRIC, corpus));
    expect(f["of-11"]).toBe("pass");
  });
  it("takes the lower status and marks uncertain on disagreement", () => {
    const f = reconcile(run({ "of-03": { status: "pass" } }), run({ "of-03": { status: "fail" } }), OFFER_RUBRIC, corpus);
    const x = f.find((k) => k.criterionId === "of-03")!;
    expect(x.status).toBe("uncertain");
    expect(x.evidence).toMatch(/runs disagreed: pass vs fail/);
  });
  it("treats a pass whose evidence is not verbatim as not observed", () => {
    const f = bySt(reconcile(run({ "of-11": { status: "pass", evidence: "This sentence is not on the page at all." } }), run({ "of-11": { status: "pass", evidence: "This sentence is not on the page at all." } }), OFFER_RUBRIC, corpus));
    expect(f["of-11"]).toBe("na"); // not observed: excluded, never 0.5
  });
  it("accepts na only where allowed", () => {
    const tm = (s: "na"): Assessment => ({ criteria: TARGET_MARKET_RUBRIC.criteria.filter((c) => c.kind === "assessed").map((c) => ({ criterionId: c.id, status: s, evidence: "", note: "n/a", location: "", confidence: "low" as const })) });
    const f = bySt(reconcile(tm("na"), tm("na"), TARGET_MARKET_RUBRIC, corpus));
    expect(f["tm-10"]).toBe("na");
    expect(f["tm-01"]).toBe("na"); // not allowed -> not observed, excluded
  });
  it("verifyEvidence normalises whitespace and quotes", () => {
    expect(verifyEvidence("Owners doing $2M   to $20M who plan", corpus)).toBe(true);
    expect(verifyEvidence("short", corpus)).toBe(false);
  });
  it("system prompt lists only assessed criteria with ids", () => {
    const p = buildSystemPrompt(OFFER_RUBRIC);
    expect(p).toContain("of-11");
    expect(p).not.toContain("of-05 (");
    expect(p).toContain("verbatim");
  });
});

describe("runAssessedLayer with a fake caller", () => {
  it("returns four dimensions combining assessed and measured findings", async () => {
    const corpus = buildWindows(site).corpus;
    const caller = async (system: string) => {
      const ids = [...system.matchAll(/^([a-z]{2}-\d\d) \(/gm)].map((m) => m[1]);
      return { criteria: ids.map((id) => ({ criterionId: id, status: "partial" as const, evidence: corpus.slice(0, 60), note: "fake", location: "hero", confidence: "medium" as const })) };
    };
    const results = await runAssessedLayer(site, { caller, runs: 2 });
    expect(results.map((r) => r.dimension)).toEqual([1, 2, 3, 4]);
    const trust = results.find((r) => r.dimension === 4)!;
    expect(trust.findings.some((f) => f.layer === "assessed" && f.status === "partial")).toBe(true);
    expect(trust.findings.some((f) => f.criterionId === "tr-06" && f.layer === "measured")).toBe(true);
  });
});
