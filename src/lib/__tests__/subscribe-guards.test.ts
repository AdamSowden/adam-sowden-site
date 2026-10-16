import { describe, expect, it } from "vitest";
import { isSameSiteRequest } from "@/lib/request-origin";
import {
  FORM_TOKEN_TTL_MS,
  decoyFormToken,
  mintFormToken,
  verifyFormToken,
} from "@/lib/subscribe-token";
import { emailDomain, isDisposableDomain } from "@/lib/email-guard";

function req(headers: Record<string, string>, method = "POST"): Request {
  return new Request("https://adamsowden.com/api/subscribe", { method, headers });
}

describe("isSameSiteRequest", () => {
  it("accepts a browser POST from the site's own page", () => {
    const r = isSameSiteRequest(
      req({
        host: "adamsowden.com",
        origin: "https://adamsowden.com",
        "sec-fetch-site": "same-origin",
      })
    );
    expect(r.ok).toBe(true);
  });

  it("accepts a localhost dev submit and a Vercel preview host", () => {
    expect(
      isSameSiteRequest(
        req({ host: "localhost:3000", origin: "http://localhost:3000", "sec-fetch-site": "same-origin" })
      ).ok
    ).toBe(true);
    expect(
      isSameSiteRequest(
        req({
          host: "site-abc.vercel.app",
          "x-forwarded-host": "site-abc.vercel.app",
          origin: "https://site-abc.vercel.app",
        })
      ).ok
    ).toBe(true);
  });

  it("accepts the www twin of the canonical host", () => {
    expect(
      isSameSiteRequest(req({ host: "adamsowden.com", origin: "https://www.adamsowden.com" })).ok
    ).toBe(true);
  });

  it("rejects a raw POST with no Origin (curl, scripts)", () => {
    const r = isSameSiteRequest(req({ host: "adamsowden.com" }));
    expect(r.ok).toBe(false);
  });

  it("rejects a foreign Origin and a cross-site fetch", () => {
    expect(
      isSameSiteRequest(req({ host: "adamsowden.com", origin: "https://evil.example" })).ok
    ).toBe(false);
    expect(
      isSameSiteRequest(
        req({ host: "adamsowden.com", origin: "https://adamsowden.com", "sec-fetch-site": "cross-site" })
      ).ok
    ).toBe(false);
  });

  it("falls back to Referer for same-origin GETs", () => {
    expect(
      isSameSiteRequest(
        req({ host: "adamsowden.com", referer: "https://adamsowden.com/blog/x", "sec-fetch-site": "same-origin" }, "GET")
      ).ok
    ).toBe(true);
  });
});

describe("form token", () => {
  const secret = "test-secret";

  it("round-trips", () => {
    const t = mintFormToken(secret);
    expect(verifyFormToken(t, secret)).toBe(true);
  });

  it("rejects a tampered, expired, foreign-secret or decoy token", () => {
    const t = mintFormToken(secret, 1_000_000);
    expect(verifyFormToken(t, secret, 1_000_000 + 1000)).toBe(true);
    expect(verifyFormToken(t, secret, 1_000_000 + FORM_TOKEN_TTL_MS + 1)).toBe(false);
    expect(verifyFormToken(t, "other", 1_000_000)).toBe(false);
    expect(verifyFormToken(t.slice(0, -2) + "zz", secret, 1_000_000)).toBe(false);
    expect(verifyFormToken(decoyFormToken(), secret)).toBe(false);
    expect(verifyFormToken(undefined, secret)).toBe(false);
    expect(verifyFormToken("a.b", secret)).toBe(false);
  });

  it("rejects a token claiming an expiry further out than we ever mint", () => {
    const far = `${Date.now() + 10 * FORM_TOKEN_TTL_MS}.nonce.sig`;
    expect(verifyFormToken(far, secret)).toBe(false);
  });
});

describe("email guard", () => {
  it("extracts the domain", () => {
    expect(emailDomain("Someone@Example.COM")).toBe("example.com");
    expect(emailDomain("nope")).toBe("");
  });

  it("blocks disposable providers and their subdomains", () => {
    expect(isDisposableDomain("mailchuwee.com")).toBe(true);
    expect(isDisposableDomain("mailinator.com")).toBe(true);
    expect(isDisposableDomain("foo.yopmail.com")).toBe(true);
    expect(isDisposableDomain("gmail.com")).toBe(false);
    expect(isDisposableDomain("adamsowden.com")).toBe(false);
  });
});
