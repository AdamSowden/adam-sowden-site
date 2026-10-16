// Scoring engine. Pure functions, no I/O. Build Plan WP4; framework §0 decisions:
// equal 25% pillar weights, dimensions equal within a pillar, public result is
// a band plus pass/partial/fail counts, 0–100 internal only.

import { DIMENSION_PILLAR, type Dimension, type ExtractorResult, type Finding, type Pillar } from "./types";
import { consequenceFor } from "./consequences";
import { fixFor } from "./fixes";
import { STATUS_VALUE, countStatuses, weightedScore, type StatusCounts } from "./status";
import { movesFor, scoreJobs, type Job, type JobScore } from "./jobs";

export { STATUS_VALUE, countStatuses, weightedScore, type StatusCounts };

export const PILLARS: Pillar[] = ["message", "findability", "conversion", "foundation"];
export const PILLAR_LABEL: Record<Pillar, string> = { message: "Message", findability: "Findability", conversion: "Conversion", foundation: "Foundation" };
export const DIMENSION_LABEL: Record<Dimension, string> = {
  1: "Offer clarity", 2: "Copy quality", 3: "Target market", 4: "Trust and proof",
  5: "SEO", 6: "AI search readiness", 7: "Content depth", 8: "Engagement agent",
  9: "Conversion path and response", 10: "Measurement", 11: "Agentic build", 12: "Performance", 13: "Technical health",
};

export type Band = "Leaking" | "Invisible" | "Static" | "Working";

/**
 * Public band words (Adam, 16 Oct 2026). Internal keys stay as the spec named
 * them; what the owner sees completes the sentence "yoursite.com is ...", so
 * the title names their pain, not our verdict.
 */
export const BAND_LABEL: Record<Band, string> = {
  Leaking: "losing enquiries",
  Invisible: "not being found",
  Static: "just a business card",
  Working: "working, with money left on the table",
};

export const BAND_MEANING: Record<Band, string> = {
  Leaking: "People are getting in touch, or trying to, and nobody can see or answer them in time.",
  Invisible: "The people searching for what you do are not reaching the site, and AI answer tools cannot read it.",
  Static: "It says who you are and then stops. A business card floating on the internet, with no phone number on it.",
  Working: "It attracts, explains and answers on its own. The gaps below are where more of the visitors it already gets would turn into enquiries.",
};

/**
 * Public word for the band. A Working site with no failed or partial finding
 * at all (rare) is "doing its job"; otherwise Working names the opportunity.
 */
export function bandLabelFor(band: Band, hasGaps: boolean): string {
  return band === "Working" && !hasGaps ? "doing its job" : BAND_LABEL[band];
}

export function bandMeaningFor(band: Band, hasGaps: boolean): string {
  return band === "Working" && !hasGaps ? "Nothing failed on the checks that ran." : BAND_MEANING[band];
}

/** "skillshubs.com.au is losing enquiries." */
export function bandSentence(host: string, band: Band, hasGaps = true): string {
  return `${host} is ${bandLabelFor(band, hasGaps)}.`;
}

/** Internal only. Never shown publicly. */
export type InternalTier = "Brochure site" | "Marketing site" | "Optimised site" | "Smart site";

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

export type Fix = { finding: Finding; dimension: Dimension; job: Job; fix: string; consequence: string };

export type ScoreCard = {
  dimensions: DimensionScore[];
  pillars: Record<Pillar, number | null>;
  overall: number | null;
  band: Band;
  internalTier: InternalTier | null;
  headline: Headline | null;
  /** The five jobs plus foundation, criterion-level. Verdicts are public; scores are not. */
  jobs: JobScore[];
  /** The three moves: heaviest gap in each of the three weakest jobs. */
  fixes: Fix[];
  couldNotCheck: { criterionId: string; dimension: Dimension; reason: string }[];
  coverage: { measuredDimensions: number; totalDimensions: number };
};

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

/** One plain sentence for a finding: the model's judgement for assessed findings, else the first sentence of the evidence. */
export function statementFor(f: Finding): string {
  if (f.layer === "assessed" && f.note && f.note.length > 12) {
    const quote = firstSentence(f.evidence, 120);
    return quote && !/runs disagreed|could not be verified/.test(quote) ? `${f.note.replace(/[.!?]\s*$/, "")}. The page says: "${quote.replace(/^"|"$/g, "")}"` : f.note;
  }
  return firstSentence(f.evidence);
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
    return { finding: f, dimension: d.dimension, statement: statementFor(f), consequence: consequenceFor(f.criterionId) };
  }
  return null;
}

/**
 * The three moves (report decision, 15 Oct 2026): the three weakest jobs in
 * score order, and in each the heaviest failed or partial finding. Replaces
 * the earlier "one per dimension by deficit" rule, which could leave the cause
 * of a Leaking band out of the three.
 */
export function fixesFor(results: ExtractorResult[], _dims: DimensionScore[], limit = 3): Fix[] {
  const findings = results.flatMap((r) => r.findings);
  return movesFor(findings, scoreJobs(findings), limit).map(({ job, finding }) => ({
    finding,
    dimension: finding.dimension,
    job,
    fix: fixFor(finding.criterionId),
    consequence: consequenceFor(finding.criterionId),
  }));
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
    jobs: scoreJobs(results.flatMap((r) => r.findings)),
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
