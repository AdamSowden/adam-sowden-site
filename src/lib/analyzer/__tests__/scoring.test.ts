import { describe, it, expect } from "vitest";
import { bandFor, buildScoreCard, compareToBenchmark, fixesFor, headlineFor, publicView, scoreDimension, weightedScore } from "../scoring";
import type { Dimension, ExtractorResult, Finding, FindingStatus } from "../types";

const F = (dimension: Dimension, id: string, status: FindingStatus, weight: number, evidence = `${id} evidence`): Finding => ({ dimension, criterionId: id, layer: "measured", status, weight, evidence, fixId: id, pages: [], naReason: status === "na" ? "n/a" : undefined });
const R = (dimension: Dimension, findings: Finding[], score?: number): ExtractorResult => ({ dimension, findings, score });

describe("weightedScore", () => {
  it("redistributes na weight and treats partial and uncertain as half", () => {
    expect(weightedScore([F(5, "a", "pass", 50), F(5, "b", "fail", 50)])).toBe(50);
    expect(weightedScore([F(5, "a", "pass", 50), F(5, "b", "na", 50)])).toBe(100);
    expect(weightedScore([F(5, "a", "partial", 50), F(5, "b", "uncertain", 50)])).toBe(50);
    expect(weightedScore([F(5, "a", "na", 50)])).toBeNull();
  });
  it("honours a score override", () => {
    const d = scoreDimension(R(11, [F(11, "x", "fail", 65)], 90));
    expect(d.score).toBe(90); expect(d.overridden).toBe(true);
  });
});

describe("bands", () => {
  const all = (score: number, except: Partial<Record<Dimension, number>> = {}): ExtractorResult[] =>
    ([5, 6, 7, 8, 9, 10, 11, 12, 13] as Dimension[]).map((d) => R(d, [F(d, `${d}-a`, "pass", 10)], except[d] ?? score));
  it("Working when overall >= 75 and nothing under 50", () => {
    const c = buildScoreCard(all(90));
    expect(c.band).toBe("Working"); expect(c.overall).toBe(90); expect(c.internalTier).toBe("Smart site");
  });
  it("Leaking when conversion path under 40, whatever else", () => {
    expect(buildScoreCard(all(95, { 9: 30 })).band).toBe("Leaking");
  });
  it("Invisible when findability pillar under 40 and not leaking", () => {
    expect(buildScoreCard(all(95, { 5: 30, 6: 30, 7: 30 })).band).toBe("Invisible");
  });
  it("Static when good overall but one dimension under 50", () => {
    const c = buildScoreCard(all(90, { 8: 5 }));
    expect(c.band).toBe("Static"); expect(c.overall).toBeGreaterThanOrEqual(75);
  });
  it("ignores unmeasured dimensions in bands and pillars", () => {
    const rs = all(90).map((r) => (r.dimension === 12 ? R(12, [F(12, "p", "na", 25)]) : r));
    const c = buildScoreCard(rs);
    expect(c.dimensions.find((d) => d.dimension === 12)?.score).toBeNull();
    expect(c.pillars.foundation).toBe(90);
    expect(c.band).toBe("Working");
    expect(c.coverage.measuredDimensions).toBe(8);
    expect(c.couldNotCheck).toHaveLength(1);
    expect(bandFor([], c.pillars, null)).toBe("Static");
  });
});

describe("headline and fixes", () => {
  const rs: ExtractorResult[] = [
    R(5, [F(5, "seo-01", "pass", 15), F(5, "seo-06", "partial", 12, "H1 wrong on 1 page")]),
    R(9, [F(9, "cp-01", "fail", 15, "Shortest contact form has 9 fields"), F(9, "cp-04", "fail", 12, "No booking link"), F(9, "cp-06", "pass", 10)]),
    R(10, [F(10, "m-04", "fail", 25, "No conversion events")]),
  ];
  const card = buildScoreCard(rs);
  it("picks the heaviest failure in the lowest dimension with a consequence", () => {
    expect(card.headline?.dimension).toBe(10);
    expect(card.headline?.finding.criterionId).toBe("m-04");
    expect(card.headline?.consequence).toMatch(/Enquiries are not/);
  });
  it("returns at most one fix per dimension, worst first, with fix text", () => {
    const fixes = fixesFor(rs, card.dimensions);
    expect(fixes.map((f) => f.dimension)).toEqual([10, 9, 5]);
    expect(fixes[1].finding.criterionId).toBe("cp-01");
    expect(fixes[1].fix).toMatch(/five fields/);
  });
  it("headline is null when everything passes", () => {
    expect(headlineFor([R(5, [F(5, "a", "pass", 10)])], buildScoreCard([R(5, [F(5, "a", "pass", 10)])]).dimensions)).toBeNull();
  });
});

describe("benchmark and public view", () => {
  it("computes deltas and hides numbers publicly", () => {
    const site = buildScoreCard([R(5, [F(5, "a", "fail", 10)]), R(6, [F(6, "b", "pass", 10)])]);
    const bench = buildScoreCard([R(5, [F(5, "a", "pass", 10)]), R(6, [F(6, "b", "pass", 10)])]);
    const rows = compareToBenchmark(site, bench);
    expect(rows.find((r) => r.dimension === 5)?.delta).toBe(-100);
    const pv = publicView(site);
    expect(JSON.stringify(pv)).not.toMatch(/"score"/);
    expect(pv.dimensions[0].counts.fail).toBe(1);
  });
});

describe("statementFor", () => {
  it("uses the model note for assessed findings and the evidence otherwise", async () => {
    const { statementFor } = await import("../scoring");
    const assessed: Finding = { dimension: 2, criterionId: "cq-01", layer: "assessed", status: "fail", weight: 20, evidence: "Tax Strategy That Builds Legacies", fixId: "cq-01", pages: [], note: "The headline names a theme but not a buyer, a benefit or a specific" };
    expect(statementFor(assessed)).toBe('The headline names a theme but not a buyer, a benefit or a specific. The page says: "Tax Strategy That Builds Legacies"');
    expect(statementFor(F(5, "seo-06", "fail", 12, "H1 count wrong on 3 pages. Details follow."))).toBe("H1 count wrong on 3 pages.");
  });
});
