import { describe, it, expect } from "vitest";
import { safeFetch, isFetchFailure } from "../fetch";
import { fakeFetch, fakeResolver, PUBLIC } from "./helpers";

const resolver = fakeResolver({ "a.test": PUBLIC, "b.test": PUBLIC, "priv.test": ["10.0.0.9"] });

describe("safeFetch", () => {
  it("follows redirects across hosts and records them", async () => {
    const fetchImpl = fakeFetch({
      "https://a.test/": { status: 301, headers: { location: "https://b.test/home" } },
      "https://b.test/home": { body: "<html><title>B</title></html>" },
    });
    const r = await safeFetch("https://a.test/", { fetchImpl, resolver });
    expect(isFetchFailure(r)).toBe(false);
    if (!isFetchFailure(r)) {
      expect(r.finalUrl).toBe("https://b.test/home");
      expect(r.redirects).toEqual(["https://b.test/home"]);
      expect(r.status).toBe(200);
    }
  });
  it("refuses a redirect into a private address", async () => {
    const fetchImpl = fakeFetch({ "https://a.test/": { status: 302, headers: { location: "https://priv.test/" } } });
    const r = await safeFetch("https://a.test/", { fetchImpl, resolver });
    expect(isFetchFailure(r) && r.reason).toBe("redirect-to-blocked");
  });
  it("stops redirect loops", async () => {
    const fetchImpl = fakeFetch({
      "https://a.test/": { status: 302, headers: { location: "https://a.test/x" } },
      "https://a.test/x": { status: 302, headers: { location: "https://a.test/" } },
    });
    const r = await safeFetch("https://a.test/", { fetchImpl, resolver, maxRedirects: 3 });
    expect(isFetchFailure(r) && r.reason).toBe("too-many-redirects");
  });
  it("caps oversized bodies and flags truncation", async () => {
    const big = "x".repeat(300 * 1024);
    const fetchImpl = fakeFetch({ "https://a.test/": { body: big, stream: true } });
    const r = await safeFetch("https://a.test/", { fetchImpl, resolver, maxBytes: 100 * 1024 });
    expect(isFetchFailure(r)).toBe(false);
    if (!isFetchFailure(r)) {
      expect(r.truncated).toBe(true);
      expect(r.bodyBytes).toBeLessThanOrEqual(100 * 1024);
    }
  });
  it("rejects non-html unless allowed", async () => {
    const fetchImpl = fakeFetch({ "https://a.test/f.pdf": { body: "%PDF", headers: { "content-type": "application/pdf" } } });
    const r = await safeFetch("https://a.test/f.pdf", { fetchImpl, resolver });
    expect(isFetchFailure(r) && r.reason).toBe("non-html");
    const ok = await safeFetch("https://a.test/f.pdf", { fetchImpl, resolver, allowNonHtml: true });
    expect(isFetchFailure(ok)).toBe(false);
  });
  it("returns timeout as a failure, not a throw", async () => {
    const fetchImpl = ((_: unknown, init: RequestInit) =>
      new Promise<Response>((_res, rej) => {
        init.signal?.addEventListener("abort", () => rej(Object.assign(new Error("aborted"), { name: "AbortError" })));
      })) as unknown as typeof fetch;
    const r = await safeFetch("https://a.test/", { fetchImpl, resolver, timeoutMs: 20 });
    expect(isFetchFailure(r) && r.reason).toBe("timeout");
  });
});
