import { describe, it, expect } from "vitest";
import { scanForSlop } from "../slop-scan";
import { FIXES } from "../fixes";
import { CONSEQUENCES } from "../consequences";
import { writeNarrative } from "../narrative";
import { gateNote } from "../assess/model";
import { buildScoreCard } from "../scoring";
import type { Dimension, ExtractorResult, Finding, FindingStatus } from "../types";

const F = (dimension: Dimension, id: string, status: FindingStatus, weight: number, evidence = `${id} evidence`): Finding => ({ dimension, criterionId: id, layer: "measured", status, weight, evidence, fixId: id, pages: [] });

describe("slop scanner port", () => {
  it("flags the hard bans and warns on soft tells", () => {
    const r = scanForSlop("Interest arrives and then quietly goes nowhere — genuinely; it's worth noting the robust plan.");
    expect(r.errors.map((e) => e.rule)).toEqual(expect.arrayContaining(["personified-adverb", "em-dash", "filler-qualifier", "semicolon", "banned-phrase"]));
    expect(r.warnings.map((w) => w.rule)).toContain("ai-tell-soft");
  });
  it("passes plain copy", () => {
    expect(scanForSlop("The form has nine fields. Most visitors stop at four.").errors).toHaveLength(0);
  });
  it("every fix and consequence sentence passes the hard bans", () => {
    const bad: string[] = [];
    for (const [id, text] of [...Object.entries(FIXES), ...Object.entries(CONSEQUENCES)]) {
      const r = scanForSlop(text);
      if (r.errors.length) bad.push(`${id}: ${r.errors.map((e) => e.match).join(", ")}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("gates on model prose", () => {
  it("drops a judgement that fails the gate and keeps a clean one", () => {
    expect(gateNote("The headline quietly undersells the offer")).toEqual({ noteDropped: true });
    expect(gateNote("The headline names a theme, not a buyer")).toEqual({ note: "The headline names a theme, not a buyer" });
    expect(gateNote(undefined)).toEqual({});
  });
  it("regenerates a slopped narrative once, then accepts the clean rewrite", async () => {
    const results: ExtractorResult[] = [{ dimension: 9, findings: [F(9, "cp-01", "fail", 15, "Shortest contact form has 9 fields.")] }];
    const card = buildScoreCard(results);
    const findings = results.flatMap((r) => r.findings);
    let calls = 0;
    const caller = async (_s: string, user: string) => {
      calls++;
      const slopped = calls === 1;
      expect(user.includes("rejected by the house style check")).toBe(!slopped);
      const line = slopped ? "The form quietly loses people; it has 9 fields." : "The form has 9 fields and loses people at each one.";
      return { opening: line, fixed: "Done.", pillars: { message: "m", findability: "f", conversion: "c", foundation: "fo" } };
    };
    const out = await writeNarrative(card, "acme.test", findings, caller);
    expect(calls).toBe(2);
    expect(out.source).toBe("model");
    expect(out.slop.regenerated).toBe(true);
    expect(out.slop.firstPassErrors.length).toBeGreaterThan(0);
    expect(out.slop.finalErrors).toHaveLength(0);
    expect(out.narrative.opening).not.toMatch(/quietly|;/);
  });
  it("falls back when the rewrite still fails", async () => {
    const results: ExtractorResult[] = [{ dimension: 5, findings: [F(5, "seo-01", "pass", 15)] }];
    const card = buildScoreCard(results);
    const caller = async () => ({ opening: "Things quietly drift.", fixed: "x", pillars: { message: "a", findability: "b", conversion: "c", foundation: "d" } });
    const out = await writeNarrative(card, "acme.test", results.flatMap((r) => r.findings), caller);
    expect(out.source).toBe("fallback");
    expect(out.slop.regenerated).toBe(true);
    expect(out.slop.finalErrors.length).toBeGreaterThan(0);
  });
});
