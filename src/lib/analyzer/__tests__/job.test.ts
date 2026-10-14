import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MemoryStore, LIMITS } from "../store";
import { startAnalysis, runSlowPath, toPublicJob, describeFailure } from "../job";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";
import type { Assessment } from "../assess/model";

const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
const page = (t: string) => `<html lang="en"><head><title>${t} for owners</title><meta name="description" content="${t} description that is long enough to pass the length check for sure."><meta name="viewport" content="width=device-width"></head><body><main><h1>${t}</h1><p>${"word ".repeat(300)}</p><a href="/start">Get my plan</a></main></body></html>`;
const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
const fetchImpl = fakeFetch({
  "https://acme.test/": { body: home },
  "https://acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /\nSitemap: https://acme.test/sitemap.xml" },
  "https://acme.test/sitemap.xml": { headers: { "content-type": "application/xml" }, body: `<urlset><url><loc>https://acme.test/services</loc><lastmod>2026-10-01</lastmod></url></urlset>` },
  "https://acme.test/services": { body: page("Services") },
  "https://acme.test/about": { body: page("About") },
  "http://acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
  "https://www.acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
});
const fakeAssess = async (system: string): Promise<Assessment> => {
  const ids = [...system.matchAll(/^([a-z]{2}-\d\d) \(/gm)].map((m) => m[1]);
  return { criteria: ids.map((id) => ({ criterionId: id, status: "fail", evidence: "", note: "fake" })) };
};
const base = { resolver, crawl: { fetchImpl, resolver }, assessCaller: fakeAssess, skipPsi: true } as const;

describe("startAnalysis", () => {
  it("rejects junk and private targets with 400", async () => {
    const store = new MemoryStore();
    expect((await startAnalysis("not a url", { ...base, store })).ok).toBe(false);
    const priv = await startAnalysis("http://127.0.0.1/", { ...base, store });
    expect(!priv.ok && priv.status).toBe(400);
  });
  it("runs the fast path and yields a preliminary headline", async () => {
    const store = new MemoryStore();
    const r = await startAnalysis("acme.test", { ...base, store });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cached).toBe(false);
    expect(r.job.state).toBe("fast");
    expect(r.job.preliminary).toBe(true);
    expect(r.job.pages).toHaveLength(1);
    expect(r.job.headline).not.toBeNull();
    expect(r.job.steps.map((s) => s.label)).toContain("First findings ready");
    const pub = toPublicJob(r.job);
    expect(JSON.stringify(pub)).not.toMatch(/"score"/);
    expect(pub.band).toBeTruthy();
    expect(store.inFlight).toBe(0);
  });
  it("completes the slow path, stores the domain token, and serves the cache on repeat", async () => {
    const store = new MemoryStore();
    const r = await startAnalysis("acme.test", { ...base, store });
    if (!r.ok) throw new Error("start failed");
    const done = await runSlowPath(r.job.token, { ...base, store });
    expect(done?.state).toBe("done");
    expect(done?.preliminary).toBe(false);
    expect(done?.pages.length).toBeGreaterThan(1);
    expect(done?.results.some((x) => x.dimension === 1)).toBe(true); // assessed layer ran
    expect(done?.card?.coverage.measuredDimensions).toBeGreaterThanOrEqual(10);
    const again = await startAnalysis("https://acme.test/", { ...base, store });
    expect(again.ok && again.cached).toBe(true);
  });
  it("marks the job partial when the assessed layer throws, keeping fast findings", async () => {
    const store = new MemoryStore();
    const r = await startAnalysis("acme.test", { ...base, store });
    if (!r.ok) throw new Error("start failed");
    const done = await runSlowPath(r.job.token, { ...base, store, assessCaller: async () => { throw new Error("model down"); } });
    expect(done?.state).toBe("partial");
    expect(done?.couldNotCheck.some((c) => c.scope === "assessed")).toBe(true);
    expect(done?.card).not.toBeNull();
  });
  it("enforces the daily budget and the semaphore", async () => {
    const store = new MemoryStore();
    for (let i = 0; i < LIMITS.dailyFreshRuns; i++) await store.bumpBudget(new Date().toISOString().slice(0, 10));
    const r = await startAnalysis("acme.test", { ...base, store });
    expect(!r.ok && r.status).toBe(503);
    const s2 = new MemoryStore();
    for (let i = 0; i < LIMITS.concurrent; i++) await s2.acquire();
    const busy = await startAnalysis("acme.test", { ...base, store: s2 });
    expect(!busy.ok && busy.status).toBe(429);
  });
  it("fails cleanly when the homepage cannot be fetched", async () => {
    const store = new MemoryStore();
    const r = await startAnalysis("https://nope.test/", { ...base, store, resolver: fakeResolver({ "nope.test": PUBLIC }), crawl: { fetchImpl: fakeFetch({}), resolver: fakeResolver({ "nope.test": PUBLIC }) } });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.job.state).toBe("failed");
      expect(r.job.error).toBe(describeFailure("http-error"));
    }
  });
});
