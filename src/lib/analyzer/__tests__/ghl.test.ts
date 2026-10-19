import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { analyzerContactFields, analyzerContactNote, syncAnalyzerContact, type AnalyzerContactArgs } from "../ghl";
import { MemoryStore } from "../store";
import { startAnalysis, runSlowPath, deliverReport, topFindingLine } from "../job";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";
import type { Assessment } from "../assess/model";

const args: AnalyzerContactArgs = {
  email: "owner@example.com",
  firstName: "Robin",
  host: "acme.test",
  url: "https://acme.test/",
  band: "Leaking",
  bandLabel: "losing enquiries",
  topFinding: "No chat or conversation surface detected on any crawled page. A visitor with a question right now has nowhere to ask it.",
  reportUrl: "https://adamsowden.com/analyzer/r/abc",
  runAt: Date.UTC(2026, 9, 16, 3, 4),
  moves: ["Engage: Put an agent on every page.", "Qualify and respond: State how fast enquiries are answered."],
  costRange: { low: 3000, high: 10000 },
};

function ghlRecorder(opts: { upsertStatus?: number; fieldsStatus?: number } = {}) {
  const calls: { url: string; method: string; body: Record<string, unknown> }[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    calls.push({ url, method: init.method ?? "GET", body });
    if (url.endsWith("/contacts/upsert")) return new Response(JSON.stringify({ contact: { id: "c_1" }, new: true }), { status: opts.upsertStatus ?? 200 });
    if (url.endsWith("/contacts/c_1")) return new Response("{}", { status: opts.fieldsStatus ?? 200 });
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

describe("analyzer contact sync", () => {
  it("writes the five fields by key and a readable note", () => {
    const fields = analyzerContactFields(args);
    expect(fields.map((f) => f.key)).toEqual(["analyzer_url", "analyzer_band", "analyzer_top_finding", "analyzer_report_url", "analyzer_run_at"]);
    expect(fields[1].value).toBe("losing enquiries");
    expect(fields[4].value).toBe("2026-10-16T03:04:00.000Z");
    const note = analyzerContactNote(args);
    expect(note).toContain("acme.test is losing enquiries");
    expect(note).toContain(args.topFinding);
    expect(note).toContain("1. Engage: Put an agent on every page.");
    expect(note).toContain("$3,000 to $10,000 a month");
    expect(note).toContain(args.reportUrl);
  });
  it("upserts with the three tags, then writes fields and the note", async () => {
    const { calls, fetchImpl } = ghlRecorder();
    const r = await syncAnalyzerContact(args, { fetchImpl, token: "t" });
    expect(r.ok).toBe(true);
    expect(r.contactId).toBe("c_1");
    expect(r.fieldsWritten).toBe(true);
    expect(calls.map((c) => c.method + " " + c.url.replace("https://services.leadconnectorhq.com", ""))).toEqual(["POST /contacts/upsert", "PUT /contacts/c_1", "POST /contacts/c_1/notes"]);
    expect(calls[0].body.tags).toEqual(["sl-lead", "sl-analyzer-run", "analyzer-run"]);
    expect(calls[0].body.source).toBe("adamsowden.com/analyzer");
    expect(calls[0].body.firstName).toBe("Robin");
    expect((calls[1].body.customFields as { key: string }[]).map((f) => f.key)).toContain("analyzer_top_finding");
  });
  it("still succeeds when the fields do not exist yet, and reports it", async () => {
    const { fetchImpl } = ghlRecorder({ fieldsStatus: 422 });
    const r = await syncAnalyzerContact(args, { fetchImpl, token: "t" });
    expect(r.ok).toBe(true);
    expect(r.fieldsWritten).toBe(false);
    expect(r.error).toMatch(/Update contact fields failed \(422\)/);
  });
  it("fails cleanly without a token or when the upsert fails", async () => {
    const saved = { pit: process.env.GHL_SPEEDTOLEAD_PIT, key: process.env.GHL_API_KEY };
    delete process.env.GHL_SPEEDTOLEAD_PIT; delete process.env.GHL_API_KEY;
    const none = await syncAnalyzerContact(args, { fetchImpl: ghlRecorder().fetchImpl });
    expect(none.ok).toBe(false);
    expect(none.error).toMatch(/neither GHL_SPEEDTOLEAD_PIT nor GHL_API_KEY/);
    process.env.GHL_SPEEDTOLEAD_PIT = saved.pit; process.env.GHL_API_KEY = saved.key;
    const bad = await syncAnalyzerContact(args, { fetchImpl: ghlRecorder({ upsertStatus: 500 }).fetchImpl, token: "t" });
    expect(bad.ok).toBe(false);
  });
});

describe("delivery syncs the contact once", () => {
  const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
  const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
  const fetchImpl = fakeFetch({
    "https://acme.test/": { body: home },
    "https://acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /" },
    "http://acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
    "https://www.acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
  });
  const fakeAssess = async (system: string): Promise<Assessment> => ({ criteria: [...system.matchAll(/^([a-z]{2}-\d\d) \(/gm)].map((m) => ({ criterionId: m[1], status: "partial" as const, evidence: "", note: "fake", location: "", confidence: "low" as const })) });
  const fakeNarrative = async () => ({ diagnosis: "Plain.", fixed: "Plain.", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } });
  it("writes the contact after the email, with the verbatim top finding, and not again", async () => {
    process.env.RESEND_API_KEY = "test"; process.env.RESEND_FROM = "a@b.test"; process.env.GHL_API_KEY = "k";
    const store = new MemoryStore();
    const emailFetch = (async () => new Response(JSON.stringify({ id: "em_1" }), { status: 200 })) as unknown as typeof fetch;
    const ghl = ghlRecorder();
    const base = { resolver, crawl: { fetchImpl, resolver }, assessCaller: fakeAssess, skipPsi: true, narrativeCaller: fakeNarrative, store, emailFetch, ghlFetch: ghl.fetchImpl } as const;
    const r = await startAnalysis("acme.test", base);
    if (!r.ok) throw new Error("start failed");
    const job = (await store.getJob(r.job.token))!;
    job.email = "owner@example.com";
    job.firstName = "Robin";
    await store.putJob(job);
    const done = (await runSlowPath(job.token, base))!;
    expect(done.reportSentAt).not.toBeNull();
    expect(done.ghlSyncedAt).not.toBeNull();
    const upsert = ghl.calls.find((c) => c.url.endsWith("/contacts/upsert"))!;
    expect(upsert.body.email).toBe("owner@example.com");
    expect(upsert.body.firstName).toBe("Robin");
    const fields = ghl.calls.find((c) => c.method === "PUT")!.body.customFields as { key: string; field_value: string }[];
    const top = fields.find((f) => f.key === "analyzer_top_finding")!.field_value;
    expect(top).toBe(topFindingLine(done, done.report!));
    expect(top.length).toBeGreaterThan(20);
    expect(fields.find((f) => f.key === "analyzer_report_url")!.field_value).toContain(`/analyzer/r/${done.token}`);
    const before = ghl.calls.length;
    await deliverReport(done, store, base);
    expect(ghl.calls.length).toBe(before);
  });
});
