// Assemble the full report from a finished job. Structure (report decision,
// 15 Oct 2026): diagnosis, the five jobs with a verdict each, cost of loss,
// the three moves, what fixed looks like, one CTA, and every finding with its
// evidence in a collapsed appendix grouped by job then area. The benchmark
// comparison lives in the appendix and nowhere public (framework §0 decision 3).

import type { AnalyzerJob } from "./job";
import type { Dimension, Finding, PageSummary } from "./types";
import { criterionTitle } from "./criteria-titles";
import { fixFor } from "./fixes";
import { consequenceFor } from "./consequences";
import { costOfLoss, type CostOfLoss } from "./cost-of-loss";
import { writeNarrative, type Narrative, type NarrativeCaller, type NarrativeOutcome } from "./narrative";
import { bandLabelFor, bandMeaningFor, DIMENSION_LABEL, buildScoreCard, statementFor, countStatuses, type StatusCounts } from "./scoring";
import { GROUPS, JOBS, JOB_LABEL, JOB_QUESTION, SMART_SITE_LINE, groupOf, type Group, type Job, type Verdict } from "./jobs";

export type ReportFinding = { criterionId: string; title: string; status: Finding["status"]; layer: Finding["layer"]; evidence: string; note?: string; fix: string | null; consequence: string | null };

/** One area (dimension) as it appears inside a job: only the criteria that belong to that job. */
export type ReportArea = { dimension: Dimension; label: string; measured: boolean; counts: StatusCounts; findings: ReportFinding[]; benchmark: StatusCounts | null };

export type ReportJob = {
  job: Group;
  label: string;
  question: string | null;
  verdict: Verdict;
  measured: boolean;
  counts: StatusCounts;
  /** Model prose for this job, or the fallback. Empty for foundation. */
  narrative: string;
  /** Fixed copy: what a smart site does on this job. null for foundation. */
  smartSiteLine: string | null;
  areas: ReportArea[];
};

export type ReportMove = { order: number; job: Job; jobLabel: string; move: string; consequence: string; evidence: string };

export type Report = {
  host: string;
  url: string;
  band: string;
  /** Public phrase completing "host is ...". */
  bandLabel: string;
  bandMeaning: string;
  preliminary: boolean;
  state: AnalyzerJob["state"];
  generatedAt: number;
  pagesChecked: number;
  /** Pages that duplicate another crawled page (same title, word count and H1 count). */
  pagesDuplicate: number;
  checksRun: number;
  checksCouldNotRun: { scope: string; reason: string }[];
  headline: { statement: string; consequence: string } | null;
  narrative: Narrative;
  narrativeSource: "model" | "fallback";
  slop: NarrativeOutcome["slop"] & { notesDropped: number };
  /** The five jobs in order, then foundation last. */
  jobs: ReportJob[];
  foundationWeak: boolean;
  moves: ReportMove[];
  cost: CostOfLoss | null;
  benchmark: { host: string; runAt: number } | null;
};

function rank(f: Finding): number {
  return { fail: 0, partial: 1, uncertain: 2, pass: 3, na: 4 }[f.status];
}

function toReportFinding(f: Finding): ReportFinding {
  const gap = f.status === "fail" || f.status === "partial";
  return {
    criterionId: f.criterionId,
    title: criterionTitle(f.criterionId),
    status: f.status,
    layer: f.layer,
    evidence: f.status === "na" ? (f.naReason ?? "Not checked.") : f.evidence,
    note: f.note,
    fix: gap ? fixFor(f.criterionId) : null,
    consequence: gap ? consequenceFor(f.criterionId) : null,
  };
}

export function duplicatePages(pages: PageSummary[]): number {
  const seen = new Set<string>();
  let dup = 0;
  for (const p of pages) {
    const key = `${p.title}|${p.wordCount}|${p.h1Count}`;
    if (seen.has(key)) dup++;
    else seen.add(key);
  }
  return dup;
}

export async function buildReport(job: AnalyzerJob, benchmark: AnalyzerJob | null, opts: { narrativeCaller?: NarrativeCaller } = {}): Promise<Report> {
  // Jobs stored before the five-jobs card shape get their card rebuilt from the stored results.
  const card = job.card?.jobs ? job.card : buildScoreCard(job.results);
  const findings = job.results.flatMap((r) => r.findings);
  const benchFindings = benchmark?.results.flatMap((r) => r.findings) ?? [];
  const { narrative, source, slop } = await writeNarrative(card, job.host, findings, opts.narrativeCaller);
  const notesDropped = findings.filter((f) => f.layer === "assessed" && f.note === undefined && f.noteDropped).length;

  const jobs: ReportJob[] = GROUPS.map((g) => {
    const js = card.jobs.find((x) => x.job === g)!;
    const own = findings.filter((f) => groupOf(f) === g);
    const areas: ReportArea[] = js.dimensions.map((dimension) => {
      const fs = own.filter((f) => f.dimension === dimension);
      const bfs = benchFindings.filter((f) => f.dimension === dimension && groupOf(f) === g);
      const live = fs.some((f) => f.status !== "na");
      return {
        dimension,
        label: DIMENSION_LABEL[dimension],
        measured: live,
        counts: countStatuses(fs),
        benchmark: bfs.length && bfs.some((f) => f.status !== "na") ? countStatuses(bfs) : null,
        findings: fs.slice().sort((a, b) => rank(a) - rank(b) || b.weight - a.weight).map(toReportFinding),
      };
    });
    const isJob = g !== "foundation";
    return {
      job: g,
      label: JOB_LABEL[g],
      question: isJob ? JOB_QUESTION[g as Job] : null,
      verdict: js.verdict,
      measured: js.measured,
      counts: js.counts,
      narrative: isJob ? narrative.jobs[g as Job] : "",
      smartSiteLine: isJob ? SMART_SITE_LINE[g as Job] : null,
      areas,
    };
  });
  const foundation = card.jobs.find((x) => x.job === "foundation");

  return {
    host: job.host,
    url: job.url,
    band: card.band,
    bandLabel: bandLabelFor(card.band, card.fixes.length > 0),
    bandMeaning: bandMeaningFor(card.band, card.fixes.length > 0),
    preliminary: job.preliminary,
    state: job.state,
    generatedAt: Date.now(),
    pagesChecked: job.pages.length,
    pagesDuplicate: duplicatePages(job.pages),
    checksRun: findings.filter((f) => f.status !== "na").length,
    checksCouldNotRun: job.couldNotCheck,
    headline: job.headline ? { statement: job.headline.statement, consequence: job.headline.consequence } : null,
    narrative,
    narrativeSource: source,
    slop: { ...slop, notesDropped },
    jobs,
    foundationWeak: Boolean(foundation && foundation.score !== null && foundation.score < 40),
    moves: card.fixes.map((f, i) => ({ order: i + 1, job: f.job, jobLabel: JOB_LABEL[f.job], move: f.fix, consequence: f.consequence, evidence: statementFor(f.finding) })),
    cost: costOfLoss(job.costInputs, findings),
    benchmark: benchmark ? { host: benchmark.host, runAt: benchmark.completedAt ?? benchmark.createdAt } : null,
  };
}

export { JOBS };
