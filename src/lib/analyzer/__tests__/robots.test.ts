import { describe, it, expect } from "vitest";
import { parseRobots, isAllowed, aiCrawlerStatus, isAgentBlocked } from "../robots";

const raw = `
User-agent: *
Disallow: /admin/
Allow: /admin/public
Sitemap: https://acme.test/sitemap.xml

User-agent: GPTBot
User-agent: ClaudeBot
Disallow: /

User-agent: PerplexityBot
Allow: /
`;

describe("robots", () => {
  const m = parseRobots(raw);
  it("parses groups and sitemaps", () => {
    expect(m.groups).toHaveLength(3);
    expect(m.groups[1].agents).toEqual(["GPTBot", "ClaudeBot"]);
    expect(m.sitemaps).toEqual(["https://acme.test/sitemap.xml"]);
  });
  it("applies longest-match allow over disallow", () => {
    expect(isAllowed(m, "SmartSitesAnalyzer", "/admin/secret")).toBe(false);
    expect(isAllowed(m, "SmartSitesAnalyzer", "/admin/public/x")).toBe(true);
    expect(isAllowed(m, "SmartSitesAnalyzer", "/services")).toBe(true);
  });
  it("detects blocked, allowed and unaddressed AI crawlers", () => {
    const s = aiCrawlerStatus(m);
    expect(s.blocked).toEqual(expect.arrayContaining(["GPTBot", "ClaudeBot"]));
    expect(s.allowed).toContain("PerplexityBot");
    expect(s.unaddressed).toContain("Google-Extended");
    expect(isAgentBlocked(m, "GPTBot")).toBe(true);
    expect(isAgentBlocked(m, "Google-Extended")).toBe(false);
  });
});
