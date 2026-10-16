// Status values and counting, shared by the scoring engine and the five-jobs
// grouping. Pure, no imports from either so neither depends on the other.

import type { Finding, FindingStatus } from "./types";

export type StatusCounts = { pass: number; partial: number; fail: number; uncertain: number; na: number };

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

/** How far a failed or partial finding falls short, weighted. 0 for pass and na. */
export function deficit(f: Finding): number {
  if (f.status === "na") return 0;
  return f.weight * (1 - STATUS_VALUE[f.status as Exclude<FindingStatus, "na">]);
}
