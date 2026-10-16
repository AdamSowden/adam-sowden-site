// The five jobs a smart site does, and which checks feed each one. This is
// the frame the report is written in (decision 7, 15 Oct 2026): Attract,
// Explain, Engage, Qualify and respond, Learn. Foundation checks (platform,
// speed, technical health) are not a job; they sit in the appendix.
//
// "Learn" is reported strictly as what the owner can see. No sentence here
// or in the narrative claims the site improves itself (methodology open item).

import type { Dimension, Finding } from "./types";
import { countStatuses, deficit, weightedScore, type StatusCounts } from "./status";

export type Job = "attract" | "explain" | "engage" | "qualify" | "learn";
export type Group = Job | "foundation";

export const JOBS: Job[] = ["attract", "explain", "engage", "qualify", "learn"];
export const GROUPS: Group[] = [...JOBS, "foundation"];

export const JOB_LABEL: Record<Group, string> = {
  attract: "Attract",
  explain: "Explain",
  engage: "Engage",
  qualify: "Qualify and respond",
  learn: "Learn",
  foundation: "The ground it stands on",
};

/** The question each job answers, shown under the job heading. */
export const JOB_QUESTION: Record<Job, string> = {
  attract: "Is the site bringing new, relevant people in, or sitting still?",
  explain: "Can the right buyer recognise themselves and understand the offer in the first screen?",
  engage: "Can a visitor get a useful answer while their question is live?",
  qualify: "Can a ready buyer take the next step and get a timely answer?",
  learn: "Can the owner see which pages, questions and paths create or lose enquiries?",
};

/** Fixed copy. What a smart site does on each job. Never written by the model. */
export const SMART_SITE_LINE: Record<Job, string> = {
  attract: "A smart site publishes on a schedule, built to rank on Google and to be quoted by AI answer engines, so new people arrive every week without anyone writing.",
  explain: "A smart site tells the right buyer in the first screen who it is for, what they get and why to believe it.",
  engage: "A smart site holds a real conversation on every page. It answers from the site's own content while the visitor's question is live.",
  qualify: "A smart site gives a ready buyer a way to act on any page, works out whether they fit, books them in and answers within minutes, at any hour.",
  learn: "A smart site shows the owner which pages, questions and paths produce enquiries and which lose them.",
};

const GROUP_OF_DIMENSION: Record<Dimension, Group> = {
  1: "explain", 2: "explain", 3: "explain", 4: "explain",
  5: "attract", 6: "attract", 7: "attract",
  8: "engage", 9: "qualify", 10: "learn",
  11: "foundation", 12: "foundation", 13: "foundation",
};

/** Criteria that belong to a different job than their area. */
export const CRITERION_GROUP: Record<string, Group> = {
  "cd-06": "engage",
  "cp-03": "engage",
  "ab-agent": "engage",
  "ab-diagnostic": "engage",
  "ab-cadence": "attract",
  "ab-fresh": "attract",
  "ab-feed": "attract",
  "ab-og": "attract",
  "ab-schema": "attract",
  "ab-response": "qualify",
  "ab-email": "qualify",
};

export function groupOf(f: Pick<Finding, "dimension" | "criterionId">): Group {
  return CRITERION_GROUP[f.criterionId] ?? GROUP_OF_DIMENSION[f.dimension];
}

export type Verdict = "Working" | "Partly" | "Not yet";

/** Public word for a job. The score behind it is never shown. */
export function verdictFor(score: number | null): Verdict {
  if (score === null) return "Not yet";
  if (score >= 70) return "Working";
  if (score >= 40) return "Partly";
  return "Not yet";
}

export type JobScore = {
  job: Group;
  label: string;
  /** Criterion-level weighted score. Internal only. null when nothing measured. */
  score: number | null;
  measured: boolean;
  counts: StatusCounts;
  verdict: Verdict;
  /** Areas (dimensions) with at least one finding in this group. */
  dimensions: Dimension[];
};

export function scoreJobs(findings: Finding[]): JobScore[] {
  return GROUPS.map((g) => {
    const fs = findings.filter((f) => groupOf(f) === g);
    const score = weightedScore(fs);
    return {
      job: g,
      label: JOB_LABEL[g],
      score,
      measured: score !== null,
      counts: countStatuses(fs),
      verdict: verdictFor(score),
      dimensions: [...new Set(fs.map((f) => f.dimension))].sort((a, b) => a - b),
    };
  });
}

/**
 * The three moves: the weakest jobs in score order (foundation excluded), and
 * within each the heaviest failed or partial finding. One per job.
 */
export function movesFor(findings: Finding[], jobs: JobScore[], limit = 3): { job: Job; finding: Finding }[] {
  const ranked = jobs
    .filter((j): j is JobScore & { job: Job } => j.job !== "foundation" && j.score !== null)
    .sort((a, b) => (a.score as number) - (b.score as number));
  const out: { job: Job; finding: Finding }[] = [];
  for (const j of ranked) {
    const gaps = findings.filter((f) => groupOf(f) === j.job && (f.status === "fail" || f.status === "partial")).sort((a, b) => deficit(b) - deficit(a) || b.weight - a.weight);
    if (!gaps[0]) continue;
    out.push({ job: j.job, finding: gaps[0] });
    if (out.length >= limit) break;
  }
  return out;
}
