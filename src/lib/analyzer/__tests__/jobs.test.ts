import { describe, it, expect } from "vitest";
import { CRITERION_GROUP, JOBS, SMART_SITE_LINE, JOB_QUESTION, groupOf, movesFor, scoreJobs, verdictFor } from "../jobs";
import { FIXES } from "../fixes";
import { scanForSlop } from "../slop-scan";
import { fallbackNarrative, narrativeText } from "../narrative";
import { bandLabelFor, bandSentence, buildScoreCard } from "../scoring";
import { duplicatePages } from "../report";
import type { Dimension, ExtractorResult, Finding, FindingStatus } from "../types";

const F = (dimension: Dimension, id: string, status: FindingStatus, weight: number, evidence = `${id} evidence`): Finding => ({ dimension, criterionId: id, layer: "measured", status, weight, evidence, fixId: id, pages: [], naReason: status === "na" ? "n/a" : undefined });
const R = (dimension: Dimension, findings: Finding[]): ExtractorResult => ({ dimension, findings });

describe("five jobs", () => {
  it("every criterion resolves to exactly one group, and every moved criterion has a fix", () => {
    for (const id of Object.keys(FIXES)) expect(["attract", "explain", "engage", "qualify", "learn", "foundation"]).toContain(groupOf({ dimension: 5, criterionId: id }));
    for (const id of Object.keys(CRITERION_GROUP)) expect(FIXES[id], id).toBeDefined();
    expect(groupOf({ dimension: 7, criterionId: "cd-06" })).toBe("engage");
    expect(groupOf({ dimension: 9, criterionId: "cp-03" })).toBe("engage");
    expect(groupOf({ dimension: 11, criterionId: "ab-cadence" })).toBe("attract");
    expect(groupOf({ dimension: 11, criterionId: "ab-platform" })).toBe("foundation");
    expect(groupOf({ dimension: 11, criterionId: "ab-api" })).toBe("foundation");
    expect(groupOf({ dimension: 12, criterionId: "perf-01" })).toBe("foundation");
  });
  it("verdict thresholds", () => {
    expect(verdictFor(70)).toBe("Working");
    expect(verdictFor(69)).toBe("Partly");
    expect(verdictFor(40)).toBe("Partly");
    expect(verdictFor(39)).toBe("Not yet");
    expect(verdictFor(null)).toBe("Not yet");
  });
  it("scores each job at criterion level, moved criteria counted where they belong", () => {
    const findings = [
      F(7, "cd-01", "pass", 20), F(7, "cd-06", "fail", 10), // cd-06 belongs to engage
      F(8, "eng-01", "fail", 70),
      F(9, "cp-03", "fail", 12), F(9, "cp-04", "pass", 12),
      F(12, "perf-01", "na", 10),
    ];
    const jobs = scoreJobs(findings);
    const by = Object.fromEntries(jobs.map((j) => [j.job, j]));
    expect(by.attract.score).toBe(100);
    expect(by.engage.score).toBe(0);
    expect(by.engage.counts.fail).toBe(3);
    expect(by.qualify.score).toBe(100);
    expect(by.foundation.measured).toBe(false);
    expect(by.foundation.verdict).toBe("Not yet");
    expect(by.explain.measured).toBe(false);
  });
  it("moves come from the three weakest jobs, heaviest gap each, one per job", () => {
    const findings = [
      F(5, "seo-06", "partial", 12), F(5, "seo-01", "pass", 15),
      F(9, "cp-01", "fail", 15), F(9, "cp-04", "fail", 12), F(9, "cp-06", "pass", 10),
      F(10, "m-04", "fail", 25),
      F(1, "of-01", "pass", 20),
    ];
    const moves = movesFor(findings, scoreJobs(findings));
    expect(moves.map((m) => m.job)).toEqual(["learn", "qualify", "attract"]);
    expect(moves[1].finding.criterionId).toBe("cp-01");
  });
  it("fixed copy passes the slop gate", () => {
    for (const j of JOBS) {
      expect(scanForSlop(SMART_SITE_LINE[j]).errors).toEqual([]);
      expect(scanForSlop(JOB_QUESTION[j]).errors).toEqual([]);
    }
  });
  it("fallback narrative has a paragraph per job and never claims the site learns", () => {
    const card = buildScoreCard([R(9, [F(9, "cp-01", "fail", 15)]), R(5, [F(5, "seo-01", "pass", 15)])]);
    const n = fallbackNarrative(card, "acme.test");
    for (const j of JOBS) expect(n.jobs[j].length).toBeGreaterThan(10);
    expect(narrativeText(n)).not.toMatch(/learns|improves itself/);
    expect(scanForSlop(narrativeText(n)).errors).toEqual([]);
  });
  it("Working names the opportunity unless nothing failed at all", () => {
    expect(bandLabelFor("Working", true)).toBe("working, with money left on the table");
    expect(bandLabelFor("Working", false)).toBe("doing its job");
    expect(bandLabelFor("Static", false)).toBe("just a business card");
    expect(bandSentence("acme.test", "Leaking")).toBe("acme.test is losing enquiries.");
  });
  it("counts duplicate pages by title, words and H1s", () => {
    const p = (url: string, title: string, wordCount: number) => ({ url, finalUrl: url, status: 200, wordCount, h1Count: 1, renderedClientSide: false, title });
    expect(duplicatePages([p("/", "Home", 610), p("/home", "Home", 610), p("/about", "About", 300)])).toBe(1);
  });
});
