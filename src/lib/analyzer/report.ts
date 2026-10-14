// Assemble the full report from a finished job: narrative, cost of loss,
// findings grouped by pillar with evidence, the three fixes, and the
// benchmark comparison (emailed/web report only; framework §0 decision 3).

import type { AnalyzerJob } from "./job";
import type { Finding, Pillar } from "./types";
import { criterionTitle } from "./criteria-titles";
import { fixFor } from "./fixes";
import { consequenceFor } from "./consequences";
import { costOfLoss, type CostOfLoss } from "./cost-of-loss";
import { writeNarrative, type Narrative, type NarrativeCaller } from "./narrative";
import { PILLARS, PILLAR_LABEL, statementFor, type StatusCounts } from "./scoring";

export type ReportFinding = { criterionId: string; title: string; status: Finding["status"]; layer: Finding["layer"]; evidence: string; note?: string; fix: string | null; consequence: string | null };

export type ReportDimension = { dimension: number; label: string; measured: boolean; counts: StatusCounts; findings: ReportFinding[]; benchmark: StatusCounts | null };

export type Report = {
  host: string;
  url: string;
  band: string;
  bandMeaning: string;
  preliminary: boolean;
  state: AnalyzerJob["state"];
  generatedAt: number;
  pagesChecked: number;
  checksRun: number;
  checksCouldNotRun: { scope: string; reason: string }[];
  headline: { statement: string; consequence: string } | null;
  narrative: Narrative;
  narrativeSource: "model" | "fallback";
  pillars: { pillar: Pillar; label: string; dimensions: ReportDimension[] }[];
  fixes: { order: number; dimensionLabel: string; fix: string; consequence: string; evidence: string }[];
  cost: CostOfLoss | null;
  benchmark: { host: string; runAt: number } | null;
};

const BAND_MEANING: Record<string, string> = {
  Leaking: "Enquiries reach the site and are being lost between arriving and being answered.",
  Invisible: "The site works, but it is not being found, and answer engines cannot read it well.",
  Static: "The site functions. It does nothing on its own.",
  Working: "The site is performing. The findings below are refinements, not repairs.",
};

export async function buildReport(job: AnalyzerJob, benchmark: AnalyzerJob | null, opts: { narrativeCaller?: NarrativeCaller } = {}): Promise<Report> {
  const card = job.card!;
  const findings = job.results.flatMap((r) => r.findings);
  const { narrative, source } = await writeNarrative(card, job.host, findings, opts.narrativeCaller);
  const pillars = PILLARS.map((p) => ({
    pillar: p,
    label: PILLAR_LABEL[p],
    dimensions: card.dimensions.filter((d) => d.pillar === p).map((d) => {
      const r = job.results.find((x) => x.dimension === d.dimension);
      const bd = benchmark?.card?.dimensions.find((x) => x.dimension === d.dimension);
      return {
        dimension: d.dimension,
        label: d.label,
        measured: d.score !== null,
        counts: d.counts,
        benchmark: bd && bd.score !== null ? bd.counts : null,
        findings: (r?.findings ?? [])
          .slice()
          .sort((a, b) => rank(a) - rank(b) || b.weight - a.weight)
          .map((f) => ({
            criterionId: f.criterionId,
            title: criterionTitle(f.criterionId),
            status: f.status,
            layer: f.layer,
            evidence: f.status === "na" ? (f.naReason ?? "Not checked.") : f.evidence,
            note: f.note,
            fix: f.status === "fail" || f.status === "partial" ? fixFor(f.criterionId) : null,
            consequence: f.status === "fail" || f.status === "partial" ? consequenceFor(f.criterionId) : null,
          })),
      };
    }),
  }));
  return {
    host: job.host,
    url: job.url,
    band: card.band,
    bandMeaning: BAND_MEANING[card.band],
    preliminary: job.preliminary,
    state: job.state,
    generatedAt: Date.now(),
    pagesChecked: job.pages.length,
    checksRun: findings.filter((f) => f.status !== "na").length,
    checksCouldNotRun: job.couldNotCheck,
    headline: job.headline ? { statement: job.headline.statement, consequence: job.headline.consequence } : null,
    narrative,
    narrativeSource: source,
    pillars,
    fixes: card.fixes.map((f, i) => ({ order: i + 1, dimensionLabel: card.dimensions.find((d) => d.dimension === f.dimension)?.label ?? "", fix: f.fix, consequence: f.consequence, evidence: statementFor(f.finding) })),
    cost: costOfLoss(job.costInputs, findings),
    benchmark: benchmark ? { host: benchmark.host, runAt: benchmark.completedAt ?? benchmark.createdAt } : null,
  };
}

function rank(f: Finding): number {
  return { fail: 0, partial: 1, uncertain: 2, pass: 3, na: 4 }[f.status];
}
