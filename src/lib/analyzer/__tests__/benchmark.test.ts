import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { runBenchmark, shouldAlert } from "../benchmark";
import { BENCHMARK_HISTORY_MAX, MemoryStore } from "../store";
import { startAnalysis } from "../job";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";
import type { Assessment } from "../assess/model";

const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
const fetchImpl = fakeFetch({
  "https://acme.test/": { body: home },
  "https://acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /" },
  "http://acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
  "https://www.acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
});
const fakeAssess = async (system: string): Promise<Assessment> => ({ criteria: [...system.matchAll(/^([a-z]{2}-\d\d) \(/gm)].map((m) => ({ criterionId: m[1], status: "pass" as const, evidence: "", note: "fake", location: "", confidence: "low" as const })) });
const fakeNarrative = async () => ({ diagnosis: "Plain.", fixed: "Plain.", jobs: { attract: "a", explain: "e", engage: "g", qualify: "q", learn: "l" } });

describe("weekly benchmark", () => {
  it("alerts on anything but Working", () => {
    expect(shouldAlert("Working")).toBe(false);
    for (const b of ["Leaking", "Invisible", "Static"]) expect(shouldAlert(b)).toBe(true);
  });
  it("runs fresh past the domain cache, stores the benchmark and the history, and alerts when not Working", async () => {
    const store = new MemoryStore();
    const base = { resolver, crawl: { fetchImpl, resolver }, assessCaller: fakeAssess, skipPsi: true, narrativeCaller: fakeNarrative, store } as const;
    // A cached public run exists for the host; the benchmark must not reuse it.
    const cached = await startAnalysis("acme.test", base);
    if (!cached.ok) throw new Error("seed failed");
    await store.setDomainToken("acme.test", cached.job.token);

    const alerts: { band: string; previousBand: string | null }[] = [];
    const alert = async (a: { band: string; previousBand: string | null }) => { alerts.push(a); return { ok: true }; };
    const out = await runBenchmark({ ...base, host: "acme.test", alert });
    if (!out.ok) throw new Error(out.error);
    expect(out.token).not.toBe(cached.job.token);
    expect((await store.getBenchmark())?.token).toBe(out.token);
    const history = await store.getBenchmarkHistory();
    expect(history[0].token).toBe(out.token);
    expect(history[0].engage).toBe(out.engage);
    // The fixture site is nowhere near Working, so the alert fires with no previous band.
    expect(out.band).not.toBe("Working");
    expect(alerts).toEqual([{ band: out.band, previousBand: null }].map((a) => expect.objectContaining(a)));

    const again = await runBenchmark({ ...base, host: "acme.test", alert });
    if (!again.ok) throw new Error(again.error);
    expect(alerts[1].previousBand).toBe(out.band);
    expect((await store.getBenchmarkHistory()).length).toBe(2);
  });
  it("keeps only the last eight runs", async () => {
    const store = new MemoryStore();
    for (let i = 0; i < BENCHMARK_HISTORY_MAX + 3; i++) await store.pushBenchmarkHistory({ token: `t${i}`, host: "acme.test", band: "Static", overall: 50, completedAt: i, engage: 5 });
    const h = await store.getBenchmarkHistory();
    expect(h.length).toBe(BENCHMARK_HISTORY_MAX);
    expect(h[0].token).toBe(`t${BENCHMARK_HISTORY_MAX + 2}`);
  });
});
