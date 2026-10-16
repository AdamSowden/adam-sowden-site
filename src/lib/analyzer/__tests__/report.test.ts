import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { costOfLoss } from "../cost-of-loss";
import { fallbackNarrative, narrativeNumbersOk, stripDashes, writeNarrative } from "../narrative";
import { buildReport } from "../report";
import { renderReportEmail } from "../analyzer-email";
import { buildScoreCard } from "../scoring";
import { MemoryStore } from "../store";
import { startAnalysis, runSlowPath, deliverReport } from "../job";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";
import type { Dimension, ExtractorResult, Finding, FindingStatus } from "../types";
import type { Assessment } from "../assess/model";

const F = (dimension: Dimension, id: string, status: FindingStatus, weight: number, evidence = `${id} evidence`): Finding => ({ dimension, criterionId: id, layer: "measured", status, weight, evidence, fixId: id, pages: [] });

describe("cost of loss", () => {
  const inputs = { enquiries: 40, value: 5000, closeRate: 20 };
  it("does not apply when the response path is in place", () => {
    const c = costOfLoss(inputs, [F(9, "cp-06", "pass", 10), F(9, "cp-07", "pass", 10), F(9, "cp-03", "pass", 12)]);
    expect(c?.applies).toBe(false);
    expect(c?.lowMonthly).toBe(0);
  });
  it("produces a rounded-down monthly range with every step when gaps exist", () => {
    const c = costOfLoss(inputs, [F(9, "cp-06", "fail", 10), F(9, "cp-07", "fail", 10), F(9, "cp-03", "fail", 12)])!;
    expect(c.applies).toBe(true);
    // 40 enquiries, 15% to 25% late, $1,000 expected each, 50% to 100% recoverable: 3,000 to 10,000
    expect(c.lowMonthly).toBe(3000);
    expect(c.highMonthly).toBe(10000);
    expect(c.steps.length).toBe(7);
    expect(c.period).toBe("per month");
    expect(c.sources.length).toBe(2);
  });
  it("returns null without inputs", () => {
    expect(costOfLoss(null, [])).toBeNull();
  });
});

describe("narrative guard", () => {
  const results: ExtractorResult[] = [{ dimension: 9, findings: [F(9, "cp-01", "fail", 15, "Shortest contact form has 9 fields.")] }, { dimension: 5, findings: [F(5, "seo-01", "pass", 15)] }];
  const card = buildScoreCard(results);
  const findings = results.flatMap((r) => r.findings);
  it("rejects invented numbers and accepts numbers from the findings", () => {
    const ok = { diagnosis: "The form has 9 fields.", fixed: "x", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } };
    expect(narrativeNumbersOk(ok, findings)).toBe(true);
    const bad = { ...ok, diagnosis: "You lose 47% of enquiries." };
    expect(narrativeNumbersOk(bad, findings)).toBe(false);
  });
  it("falls back when the model invents a number or throws", async () => {
    const inventing = async () => ({ diagnosis: "Around 83% of visitors leave.", fixed: "x", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } });
    expect((await writeNarrative(card, "acme.test", findings, inventing)).source).toBe("fallback");
    const throwing = async () => { throw new Error("down"); };
    expect((await writeNarrative(card, "acme.test", findings, throwing)).source).toBe("fallback");
    const good = async () => ({ diagnosis: "The form asks for 9 fields — too many.", fixed: "Done.", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } });
    const r = await writeNarrative(card, "acme.test", findings, good);
    expect(r.source).toBe("model");
    expect(r.narrative.diagnosis).not.toContain("—");
  });
  it("fallback narrative mentions the band", () => {
    expect(fallbackNarrative(card, "acme.test").diagnosis).toMatch(/^acme\.test is (losing enquiries|not being found|just a business card|working, with money left on the table|doing its job)\./);
    expect(stripDashes("a — b")).toBe("a, b");
  });
});

describe("report assembly and delivery", () => {
  const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
  const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
  const fetchImpl = fakeFetch({
    "https://acme.test/": { body: home },
    "https://acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /" },
    "http://acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
    "https://www.acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
  });
  const fakeAssess = async (system: string): Promise<Assessment> => ({ criteria: [...system.matchAll(/^([a-z]{2}-\d\d) \(/gm)].map((m) => ({ criterionId: m[1], status: "partial" as const, evidence: "", note: "fake", location: "", confidence: "low" as const })) });
  const fakeNarrative = async () => ({ diagnosis: "Plain opening.", fixed: "Plain fixed.", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } });
  const base = { resolver, crawl: { fetchImpl, resolver }, assessCaller: fakeAssess, skipPsi: true, narrativeCaller: fakeNarrative } as const;

  it("builds a report with the five jobs, moves and a benchmark column, and sends the email once", async () => {
    const store = new MemoryStore();
    const bench = await startAnalysis("acme.test", { ...base, store });
    if (!bench.ok) throw new Error("bench start failed");
    const benchDone = await runSlowPath(bench.job.token, { ...base, store });
    await store.setBenchmark(benchDone!);

    const sent: string[] = [];
    const emailFetch = (async (_url: string, init: RequestInit) => { sent.push(String(init.body)); return new Response(JSON.stringify({ id: "em_1" }), { status: 200 }); }) as unknown as typeof fetch;
    process.env.RESEND_API_KEY = "test"; process.env.RESEND_FROM = "a@b.test";

    const store2 = new MemoryStore();
    await store2.setBenchmark(benchDone!);
    const r = await startAnalysis("acme.test", { ...base, store: store2 });
    if (!r.ok) throw new Error("start failed");
    const job = (await store2.getJob(r.job.token))!;
    job.email = "owner@example.com";
    job.costInputs = { enquiries: 30, value: 4000, closeRate: 25 };
    await store2.putJob(job);
    const done = await runSlowPath(job.token, { ...base, store: store2, emailFetch });
    expect(done?.report).not.toBeNull();
    expect(done?.report?.jobs.map((j) => j.job)).toEqual(["attract", "explain", "engage", "qualify", "learn", "foundation"]);
    expect(done?.report?.moves.length).toBeGreaterThan(0);
    expect(done?.report?.jobs[0].areas[0].benchmark).not.toBeNull();
    expect(done?.report?.jobs.filter((j) => j.job !== "foundation").every((j) => j.smartSiteLine && j.question)).toBe(true);
    expect(done?.report?.cost).not.toBeNull();
    expect(done?.reportSentAt).not.toBeNull();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain("owner@example.com");
    expect(sent[0]).toContain("Read the full report");
    // Second delivery is a no-op.
    await deliverReport(done!, store2, { ...base, emailFetch });
    expect(sent).toHaveLength(1);
  });

  it("renders a short email with the five verdicts, the moves and the report link", async () => {
    const store = new MemoryStore();
    const r = await startAnalysis("acme.test", { ...base, store });
    if (!r.ok) throw new Error("start failed");
    const done = await runSlowPath(r.job.token, { ...base, store });
    const report = await buildReport(done!, null, { narrativeCaller: fakeNarrative });
    const { subject, html, text } = renderReportEmail(report, "https://adamsowden.com/analyzer/r/abc", "https://adamsowden.com/book");
    expect(subject).toContain("acme.test");
    expect(html).toContain("/analyzer/r/abc");
    expect(html).not.toMatch(/score/i);
    expect(html).toContain("Attract");
    expect(html).toContain("Strategy Call");
    expect(text.split("\n").length).toBeLessThan(25);
  });
});
