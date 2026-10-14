// Scoring engine. Pure functions, no I/O. Build Plan WP4; framework §0 decisions:
// equal 25% pillar weights, dimensions equal within a pillar, public result is
// a band plus pass/partial/fail counts, 0–100 internal only.

import { DIMENSION_PILLAR, type Dimension, type ExtractorResult, type Finding, type FindingStatus, type Pillar } from "./types";
import { consequenceFor } from "./consequences";
import { fixFor } from "./fixes";

export const PILLARS: Pillar[] = ["message", "findability", "conversion", "foundation"];
export const PILLAR_LABEL: Record<Pillar, string> = { message: "Message", findability: "Findability", conversion: "Conversion", foundation: "Foundation" };
export const DIMENSION_LABEL: Record<Dimension, string> = {
  1: "Offer clarity", 2: "Copy quality", 3: "Target market", 4: "Trust and proof",
  5: "SEO", 6: "AI search readiness", 7: "Content depth", 8: "Engagement agent",
  9: "Conversion path and response", 10: "Measurement", 11: "Agentic build", 12: "Performance", 13: "Technical health",
};

export type Band = "Leaking" | "Invisible" | "Static" | "Working";
/** Internal only. Never shown publicly. */
export type InternalTier = "Brochure site" | "Marketing site" | "Optimised site" | "Smart site";

export type StatusCounts = { pass: number; partial: number; fail: number; uncertain: number; na: number };

export type DimensionScore = {
  dimension: Dimension;
  label: string;
  pillar: Pillar;
  /** null when nothing in the dimension could be measured. */
  score: number | null;
  counts: StatusCounts;
  overridden: boolean;
  notes: string[];
};

export type Headline = { finding: Finding; dimension: Dimension; statement: string; consequence: string };

export type Fix = { finding: Finding; dimension: Dimension; fix: string; consequence: string };

export type ScoreCard = {
  dimensions: DimensionScore[];
  pillars: Record<Pillar, number | null>;
  overall: number | null;
  band: Band;
  internalTier: InternalTier | null;
  headline: Headline | null;
  fixes: Fix[];
  couldNotCheck: { criterionId: string; dimension: Dimension; reason: string }[];
  coverage: { measuredDimensions: number; totalDimensions: number };
};

export const STATUS_VALUE: Record<Exclude<FindingStatus, "na">, number> = { pass: 1, partial: 0.5, uncertain: 0.5, fail: 0 };

export function countStatuses(findings: Finding[]): StatusCounts {
  const c: StatusCounts = { pass: 0, partial: 0, fail: 0, uncertain: 0, na: 0 };
  for (const f of findings) c[f.status]++;
  return c;
}

/** Weighted 0–100 with na weights redistributed. null when all na. */
export function weightedScore(findings: Finding[]): number | null {
  const live = findings.filter((f) => f.status !== "na");
  const total = live.reduce((n, f) => n + f.weight, 0);
  if (total === 0) return null;
  const got = live.reduce((n, f) => n + f.weight * STATUS_VALUE[f.status as Exclude<FindingStatus, "na">], 0);
  return Math.round((got / total) * 100);
}

export function scoreDimension(r: ExtractorResult): DimensionScore {
  const counts = countStatuses(r.findings);
  const overridden = typeof r.score === "number";
  const live = r.findings.some((f) => f.status !== "na");
  const score = overridden ? Math.max(0, Math.min(100, Math.round(r.score as number))) : live ? weightedScore(r.findings) : null;
  return { dimension: r.dimension, label: DIMENSION_LABEL[r.dimension], pillar: DIMENSION_PILLAR[r.dimension], score, counts, overridden, notes: r.notes ?? [] };
}

function mean(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => typeof x === "number");
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

export function scorePillars(dims: DimensionScore[]): Record<Pillar, number | null> {
  const out = {} as Record<Pillar, number | null>;
  for (const p of PILLARS) out[p] = mean(dims.filter((d) => d.pillar === p).map((d) => d.score));
  return out;
}

export function scoreOverall(pillars: Record<Pillar, number | null>): number | null {
  return mean(PILLARS.map((p) => pillars[p]));
}

/**
 * Band rules (Build Plan WP4 proposal, confirm on fixtures):
 *  Leaking   conversion-path dimension (9) under 40
 *  Invisible not Leaking and Findability pillar under 40
 *  Working   overall 75 or above and no measured dimension under 50
 *  Static    otherwise
 */
export function bandFor(dims: DimensionScore[], pillars: Record<Pillar, number | null>, overall: number | null): Band {
  const d9 = dims.find((d) => d.dimension === 9)?.score ?? null;
  if (d9 !== null && d9 < 40) return "Leaking";
  if (pillars.findability !== null && pillars.findability < 40) return "Invisible";
  const measured = dims.map((d) => d.score).filter((s): s is number => s !== null);
  if (overall !== null && overall >= 75 && measured.every((s) => s >= 50)) return "Working";
  return "Static";
}

export function internalTierFor(overall: number | null): InternalTier | null {
  if (overall === null) return null;
  if (overall >= 85) return "Smart site";
  if (overall >= 65) return "Optimised site";
  if (overall >= 40) return "Marketing site";
  return "Brochure site";
}

/** First sentence of an evidence string, capped, for the one-line headline. */
export function firstSentence(s: string, cap = 180): string {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  const out = (m ? m[0] : s).trim();
  return out.length > cap ? out.slice(0, cap - 1) + "…" : out;
}

export function headlineFor(results: ExtractorResult[], dims: DimensionScore[]): Headline | null {
  // Lowest-scoring measured dimension, then its heaviest failed (or partial) criterion.
  const ranked = dims.filter((d) => d.score !== null).sort((a, b) => (a.score as number) - (b.score as number));
  for (const d of ranked) {
    const r = results.find((x) => x.dimension === d.dimension);
    if (!r) continue;
    const candidates = r.findings.filter((f) => f.status === "fail" || f.status === "partial").sort((a, b) => b.weight * (1 - STATUS_VALUE[b.status as "fail" | "partial"]) - a.weight * (1 - STATUS_VALUE[a.status as "fail" | "partial"]) || b.weight - a.weight);
    const f = candidates[0];
    if (!f) continue;
    return { finding: f, dimension: d.dimension, statement: firstSentence(f.evidence), consequence: consequenceFor(f.criterionId) };
  }
  return null;
}

/** Top fixes by weighted deficit, at most one per dimension, worst first. */
export function fixesFor(results: ExtractorResult[], dims: DimensionScore[], limit = 3): Fix[] {
  const deficit = (f: Finding, dimScore: number | null) => f.weight * (1 - STATUS_VALUE[f.status as Exclude<FindingStatus, "na">]) * (1 + (100 - (dimScore ?? 50)) / 100);
  const all: { f: Finding; d: Dimension; v: number }[] = [];
  for (const r of results) {
    const dimScore = dims.find((d) => d.dimension === r.dimension)?.score ?? null;
    for (const f of r.findings) {
      if (f.status !== "fail" && f.status !== "partial") continue;
      all.push({ f, d: r.dimension, v: deficit(f, dimScore) });
    }
  }
  all.sort((a, b) => b.v - a.v);
  const seen = new Set<Dimension>();
  const out: Fix[] = [];
  for (const x of all) {
    if (seen.has(x.d)) continue;
    seen.add(x.d);
    out.push({ finding: x.f, dimension: x.d, fix: fixFor(x.f.criterionId), consequence: consequenceFor(x.f.criterionId) });
    if (out.length >= limit) break;
  }
  return out;
}

export function buildScoreCard(results: ExtractorResult[], totalDimensions = 13): ScoreCard {
  const dims = results.map(scoreDimension).sort((a, b) => a.dimension - b.dimension);
  const pillars = scorePillars(dims);
  const overall = scoreOverall(pillars);
  const band = bandFor(dims, pillars, overall);
  const couldNotCheck = results.flatMap((r) => r.findings.filter((f) => f.status === "na").map((f) => ({ criterionId: f.criterionId, dimension: r.dimension, reason: f.naReason ?? "Not checked." })));
  return {
    dimensions: dims,
    pillars,
    overall,
    band,
    internalTier: internalTierFor(overall),
    headline: headlineFor(results, dims),
    fixes: fixesFor(results, dims),
    couldNotCheck,
    coverage: { measuredDimensions: dims.filter((d) => d.score !== null).length, totalDimensions },
  };
}

/** Benchmark comparison for the emailed report only (framework §0 decision 3). */
export type BenchmarkRow = { dimension: Dimension; label: string; site: number | null; benchmark: number | null; delta: number | null };

export function compareToBenchmark(site: ScoreCard, benchmark: ScoreCard): BenchmarkRow[] {
  return site.dimensions.map((d) => {
    const b = benchmark.dimensions.find((x) => x.dimension === d.dimension)?.score ?? null;
    return { dimension: d.dimension, label: d.label, site: d.score, benchmark: b, delta: d.score !== null && b !== null ? d.score - b : null };
  });
}

/** What the public screen may show: band plus counts. No numbers. */
export function publicView(card: ScoreCard): { band: Band; dimensions: { label: string; counts: StatusCounts; measured: boolean }[]; headline: Headline | null; couldNotCheckCount: number } {
  return {
    band: card.band,
    dimensions: card.dimensions.map((d) => ({ label: d.label, counts: d.counts, measured: d.score !== null })),
    headline: card.headline,
    couldNotCheckCount: card.couldNotCheck.length,
  };
}
