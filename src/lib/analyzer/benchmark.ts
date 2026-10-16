// WP9: the weekly benchmark. Runs adamsowden.com through the full engine,
// stores the job as the benchmark the report compares against, keeps the
// last eight runs, and alerts when the result is not Working, because then
// either the site regressed or the engine did.

import { getStore, type AnalyzerStore, type BenchmarkEntry } from "./store";
import { runSlowPath, startAnalysis, type RunnerOptions } from "./job";
import { reportUrlFor, sendBenchmarkAlert } from "./analyzer-email";
import { SITE_URL } from "../site";

export const BENCHMARK_HOST = new URL(SITE_URL).host;

export type BenchmarkOutcome =
  | { ok: true; token: string; host: string; band: string; overall: number | null; engage: number | null; alerted: boolean; alertError?: string; elapsedMs: number }
  | { ok: false; error: string };

export type BenchmarkOptions = RunnerOptions & {
  host?: string;
  /** Replaces the Resend alert in tests. */
  alert?: (args: { host: string; band: string; overall: number | null; reportUrl: string; previousBand: string | null }) => Promise<{ ok: boolean; error?: string }>;
};

export function shouldAlert(band: string): boolean {
  return band !== "Working";
}

export async function runBenchmark(opts: BenchmarkOptions = {}): Promise<BenchmarkOutcome> {
  const store: AnalyzerStore = opts.store ?? getStore();
  const host = opts.host ?? BENCHMARK_HOST;
  const started = Date.now();
  const previous = (await store.getBenchmarkHistory())[0] ?? null;

  const start = await startAnalysis(host, { ...opts, store, fresh: true });
  if (!start.ok) return { ok: false, error: start.error };
  if (start.job.state === "failed") return { ok: false, error: start.job.error ?? "The homepage could not be fetched." };
  const job = (await runSlowPath(start.job.token, { ...opts, store })) ?? start.job;
  if (job.state === "failed" || !job.card) return { ok: false, error: job.error ?? "The benchmark run did not finish." };

  await store.setBenchmark(job);
  const engage = job.card.jobs.find((j) => j.job === "engage")?.score ?? null;
  const entry: BenchmarkEntry = { token: job.token, host: job.host, band: job.card.band, overall: job.card.overall, completedAt: job.completedAt ?? Date.now(), engage };
  await store.pushBenchmarkHistory(entry);

  let alerted = false;
  let alertError: string | undefined;
  if (shouldAlert(job.card.band)) {
    const send = opts.alert ?? ((a) => sendBenchmarkAlert({ ...a, fetchImpl: opts.emailFetch }));
    const r = await send({ host: job.host, band: job.card.band, overall: job.card.overall, reportUrl: reportUrlFor(job.token), previousBand: previous?.band ?? null });
    alerted = r.ok;
    alertError = r.error;
  }
  return { ok: true, token: job.token, host: job.host, band: job.card.band, overall: job.card.overall, engage, alerted, alertError, elapsedMs: Date.now() - started };
}
