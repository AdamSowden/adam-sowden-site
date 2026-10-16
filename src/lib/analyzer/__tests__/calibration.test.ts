import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { pinnedLookup } from "../fetch";
import { stripEvidenceLabels } from "../assess/model";
import { runSlowPath, startAnalysis, BUSY_REASON } from "../job";
import { LIMITS, MemoryStore } from "../store";
import { classifyChatWithProbe } from "../extractors/engagement";
import { runConversionPath } from "../extractors/conversion-path";
import { runAgenticBuild } from "../extractors/agentic-build";
import { runSeo } from "../extractors/seo";
import { runContentDepth } from "../extractors/content-depth";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";
import { buildCrawl, html, bySt } from "./extractors.helpers";

describe("WP10 calibration and hardening", () => {
  it("pinned lookup only ever answers with the guarded addresses", () => {
    const lookup = pinnedLookup(["203.0.113.5", "2001:db8::5"]);
    const single: unknown[] = [];
    lookup("evil.example", {}, (err, address, family) => single.push(err, address, family));
    expect(single).toEqual([null, "203.0.113.5", 4]);
    const all: unknown[] = [];
    lookup("evil.example", { all: true }, (err, list) => all.push(err, list));
    expect(all[1]).toEqual([{ address: "203.0.113.5", family: 4 }, { address: "2001:db8::5", family: 6 }]);
  });

  it("strips our window labels from quoted evidence", () => {
    expect(stripEvidenceLabels("IMAGE ALT TEXT SAMPLE: Rebecca Oakley | google")).toBe("Rebecca Oakley | google");
    expect(stripEvidenceLabels("h2: $4.6m\nh2: 2K+")).toBe("$4.6m 2K+");
    expect(stripEvidenceLabels("Plain quote.")).toBe("Plain quote.");
  });

  it("one chat classification feeds engagement, conversion path and agentic build alike", async () => {
    const crawl = buildCrawl({ pages: { "/": html({ body: '<div data-conversation-agent="first-party"><p>Ask</p></div><a href="/book">Book a call</a>' }) } });
    const c = await classifyChatWithProbe(crawl);
    expect(c.cls).toBe(4);
    const ctx = { crawl, psi: null, fetchOpts: {} };
    const cp = bySt((await runConversionPath(ctx)).findings);
    const ab = bySt((await runAgenticBuild(ctx)).findings);
    expect(cp["cp-03"]).toBe("pass");
    expect(ab["ab-agent"]).toBe("pass");
  });

  it("long titles and descriptions are partial, missing or duplicated ones fail", async () => {
    const long = "x".repeat(90);
    const pages: Record<string, string> = {};
    for (let i = 0; i < 4; i++) pages[`/p${i}`] = html({ title: `${long} ${i}`, desc: `${long}${long} ${i}` });
    const crawl = buildCrawl({ pages: { "/": html({}), ...pages } });
    const seo = bySt((await runSeo({ crawl, psi: null, fetchOpts: {} })).findings);
    expect(seo["seo-04"]).toBe("partial");
    expect(seo["seo-05"]).toBe("partial");
    const dup: Record<string, string> = {};
    for (let i = 0; i < 4; i++) dup[`/d${i}`] = html({ title: "Same title here", desc: "" });
    const seo2 = bySt((await runSeo({ crawl: buildCrawl({ pages: { "/": html({}), ...dup } }), psi: null, fetchOpts: {} })).findings);
    expect(seo2["seo-04"]).toBe("fail");
    expect(seo2["seo-05"]).toBe("fail");
  });

  it("a page reached at two addresses is not a near-duplicate of itself", async () => {
    const body = `<p>${"word ".repeat(200)}</p>`;
    const crawl = buildCrawl({ pages: { "/": html({ body }), "/?ref=x": html({ body }) } });
    const cd = (await runContentDepth({ crawl, psi: null, fetchOpts: {} })).findings.find((f) => f.criterionId === "cd-04")!;
    expect(cd.status).toBe("na");
  });

  it("the slow path waits for a slot and gives up cleanly when none frees", async () => {
    const home = readFileSync(new URL("./fixtures/home.html", import.meta.url), "utf8");
    const resolver = fakeResolver({ "acme.test": PUBLIC, "www.acme.test": PUBLIC });
    const fetchImpl = fakeFetch({
      "https://acme.test/": { body: home },
      "https://acme.test/robots.txt": { headers: { "content-type": "text/plain" }, body: "User-agent: *\nAllow: /" },
      "http://acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
      "https://www.acme.test/": { status: 301, headers: { location: "https://acme.test/" } },
    });
    const store = new MemoryStore();
    for (let i = 0; i < LIMITS.concurrentSlow; i++) await store.acquireSlow();
    const r = await startAnalysis("acme.test", { resolver, crawl: { fetchImpl, resolver }, store });
    if (!r.ok) throw new Error("start failed");
    let t = 0;
    const done = (await runSlowPath(r.job.token, { resolver, crawl: { fetchImpl, resolver }, store, skipAssessed: true, skipPsi: true, slowWaitMs: 10_000, now: () => t, sleep: async () => { t += 3_000; } }))!;
    expect(done.state).toBe("partial");
    expect(done.couldNotCheck.map((c) => c.reason)).toContain(BUSY_REASON);
    expect(store.slowInFlight).toBe(LIMITS.concurrentSlow);
    await store.releaseSlow();
    const ok = (await runSlowPath(r.job.token, { resolver, crawl: { fetchImpl, resolver }, store, skipAssessed: true, skipPsi: true }))!;
    expect(ok.state).toBe("done");
    expect(store.slowInFlight).toBe(LIMITS.concurrentSlow - 1);
  });
});
