import { describe, it, expect } from "vitest";
import { guardUrl, isPrivateIPv4, isPrivateIPv6, normaliseInput, sameSite } from "../url-guard";
import { fakeResolver, PUBLIC } from "./helpers";

describe("normaliseInput", () => {
  it("adds https and strips fragments and credentials", () => {
    expect(normaliseInput("example.com/path#x")).toBe("https://example.com/path");
    expect(normaliseInput("http://user:pw@example.com")).toBe("http://example.com/");
  });
  it("rejects junk", () => {
    expect(normaliseInput("")).toBeNull();
    expect(normaliseInput("ht!tp://")).toBeNull();
  });
});

describe("private address detection", () => {
  it.each(["10.1.2.3", "127.0.0.1", "169.254.169.254", "172.16.5.5", "192.168.1.1", "100.64.0.1", "0.0.0.0", "224.0.0.1"])("v4 %s is private", (ip) => {
    expect(isPrivateIPv4(ip)).toBe(true);
  });
  it.each(["8.8.8.8", "93.184.216.34", "1.1.1.1"])("v4 %s is public", (ip) => {
    expect(isPrivateIPv4(ip)).toBe(false);
  });
  it.each(["::1", "::", "fc00::1", "fd12::1", "fe80::1", "ff02::1", "::ffff:10.0.0.1", "::ffff:127.0.0.1"])("v6 %s is private", (ip) => {
    expect(isPrivateIPv6(ip)).toBe(true);
  });
  it("v6 public passes", () => {
    expect(isPrivateIPv6("2606:2800:220:1:248:1893:25c8:1946")).toBe(false);
  });
});

describe("guardUrl", () => {
  const resolver = fakeResolver({
    "example.test": PUBLIC,
    "evil.test": ["93.184.216.34", "10.0.0.5"],
    "v6.test": ["::ffff:192.168.0.1"],
  });
  it("allows a public https host", async () => {
    const r = await guardUrl("https://example.test/", resolver);
    expect(r.ok).toBe(true);
  });
  it("rejects non-http schemes", async () => {
    const r = await guardUrl("ftp://example.test/", resolver);
    expect(r.ok && false).toBe(false);
    expect(!r.ok && r.reason).toBe("blocked-scheme");
  });
  it("rejects bare IPs and localhost", async () => {
    expect((await guardUrl("http://127.0.0.1/", resolver)).ok).toBe(false);
    expect((await guardUrl("http://[::1]/", resolver)).ok).toBe(false);
    expect((await guardUrl("http://localhost/", resolver)).ok).toBe(false);
    expect((await guardUrl("http://intranet/", resolver)).ok).toBe(false);
    expect((await guardUrl("http://metadata.google.internal/", resolver)).ok).toBe(false);
  });
  it("rejects when any resolved address is private", async () => {
    const r = await guardUrl("https://evil.test/", resolver);
    expect(!r.ok && r.reason).toBe("private-address");
    const r6 = await guardUrl("https://v6.test/", resolver);
    expect(!r6.ok && r6.reason).toBe("private-address");
  });
  it("reports DNS failure", async () => {
    const r = await guardUrl("https://nope.test/", resolver);
    expect(!r.ok && r.reason).toBe("dns-failed");
  });
});

describe("sameSite", () => {
  it("ignores www", () => {
    expect(sameSite("www.example.com", "example.com")).toBe(true);
    expect(sameSite("blog.example.com", "example.com")).toBe(false);
  });
});
