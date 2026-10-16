// The Analyzer job: fast path (homepage only, cheap extractors, headline on
// screen) then slow path (full crawl, PSI, all extractors, assessed layer,
// final scorecard). Routes stay thin; everything testable lives here.

import { randomUUID } from "node:crypto";
import { crawlSite, type CrawlOptions } from "./crawl";
import { runMeasuredExtractors } from "./extractors";
import { runAssessedLayer } from "./assess";
import type { AssessCaller } from "./assess/model";
import { fetchPsi, isPsiFailure, type PsiResult } from "./psi";
import { JOB_LABEL } from "./jobs";
import { buildScoreCard, statementFor, type ScoreCard } from "./scoring";
import { consequenceFor } from "./consequences";
import { summarisePage, type CrawlResult, type ExtractorResult, type PageSummary } from "./types";
import { guardUrl, normaliseInput, type Resolver } from "./url-guard";
import { getStore, LIMITS, todayKey, type AnalyzerStore } from "./store";
import { buildReport, type Report } from "./report";
import type { NarrativeCaller } from "./narrative";
import { reportUrlFor, sendReportEmail } from "./analyzer-email";
import { BOOKING_URL, SITE_URL } from "../site";

export type JobState = "queued" | "fast" | "slow" | "done" | "partial" | "failed";

export type Specific = { dimension: number; label: string; statement: string; consequence: string; status: string };

export type AnalyzerJob = {
  token: string;
  url: string;
  host: string;
  state: JobState;
  preliminary: boolean;
  steps: { label: string; at: number }[];
  pages: PageSummary[];
  results: ExtractorResult[];
  card: ScoreCard | null;
  headline: { statement: string; consequence: string; dimension: number } | null;
  specifics: Specific[];
  couldNotCheck: { scope: string; reason: string }[];
  error: string | null;
  email: string | null;
  costInputs: { enquiries: number; value: number; closeRate: number } | null;
  report: Report | null;
  reportSentAt: number | null;
  reportSendError: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  cachedFrom: string | null;
};

export type StartOutcome =
  | { ok: true; job: AnalyzerJob; cached: boolean }
  | { ok: false; status: 400 | 429 | 503; error: string };

export type RunnerOptions = {
  store?: AnalyzerStore;
  crawl?: CrawlOptions;
  resolver?: Resolver;
  psiApiKey?: string;
  psiFetch?: typeof fetch;
  assessCaller?: AssessCaller;
  assessRuns?: number;
  narrativeCaller?: NarrativeCaller;
  emailFetch?: typeof fetch;
  now?: () => number;
  skipAssessed?: boolean;
  skipPsi?: boolean;
};

function newJob(url: string, host: string, now: number): AnalyzerJob {
  return {
    token: randomUUID().replace(/-/g, ""),
    url, host, state: "queued", preliminary: true, steps: [], pages: [], results: [], card: null, headline: null,
    specifics: [], couldNotCheck: [], error: null, email: null, costInputs: null,
    report: null, reportSentAt: null, reportSendError: null,
    createdAt: now, updatedAt: now, completedAt: null, cachedFrom: null,
  };
}

async function step(job: AnalyzerJob, store: AnalyzerStore, label: string, now: () => number) {
  job.steps.push({ label, at: now() });
  job.updatedAt = now();
  await store.putJob(job);
}

function specificsFrom(card: ScoreCard): Specific[] {
  return card.fixes.map((f) => ({
    dimension: f.dimension,
    label: JOB_LABEL[f.job],
    statement: statementFor(f.finding),
    consequence: consequenceFor(f.finding.criterionId),
    status: f.finding.status,
  }));
}

function applyCard(job: AnalyzerJob, results: ExtractorResult[], crawl: CrawlResult, preliminary: boolean, extraCouldNotCheck: { scope: string; reason: string }[] = []) {
  const card = buildScoreCard(results);
  job.results = results;
  job.card = card;
  job.pages = crawl.pages.map(summarisePage);
  job.headline = card.headline ? { statement: card.headline.statement, consequence: card.headline.consequence, dimension: card.headline.dimension } : null;
  job.specifics = specificsFrom(card).filter((s) => s.statement !== job.headline?.statement).slice(0, 3);
  job.couldNotCheck = [...extraCouldNotCheck, ...crawl.couldNotCheck, ...card.couldNotCheck.map((c) => ({ scope: c.criterionId, reason: c.reason }))];
  job.preliminary = preliminary;
}

/**
 * Validate the URL, apply the per-domain cache and the daily budget, create
 * the job, run the fast path. The caller handles per-IP rate limits and
 * schedules the slow path (after()).
 */
export async function startAnalysis(rawUrl: string, opts: RunnerOptions = {}): Promise<StartOutcome> {
  const store = opts.store ?? getStore();
  const now = opts.now ?? Date.now;
  const normalised = normaliseInput(rawUrl ?? "");
  if (!normalised) return { ok: false, status: 400, error: "That does not look like a website address." };
  const guard = await guardUrl(normalised, opts.resolver);
  if (!guard.ok) {
    const msg = guard.reason === "dns-failed" ? "That domain does not resolve. Check the spelling." : guard.reason === "blocked-scheme" ? "Only http and https sites can be analysed." : "That address cannot be analysed.";
    return { ok: false, status: 400, error: msg };
  }
  const host = guard.host.toLowerCase();

  // Per-domain cache: one fresh run per 24 hours, repeats get the stored job.
  const cachedToken = await store.getDomainToken(host);
  if (cachedToken) {
    const cached = await store.getJob(cachedToken);
    if (cached && (cached.state === "done" || cached.state === "partial")) return { ok: true, job: cached, cached: true };
  }

  const budget = await store.bumpBudget(todayKey(new Date(now())));
  if (budget > LIMITS.dailyFreshRuns) return { ok: false, status: 503, error: "The analyzer has reached today's limit. Try again tomorrow." };

  if (!(await store.acquire())) return { ok: false, status: 429, error: "The analyzer is busy right now. Try again in a minute." };

  const job = newJob(normalised, host, now());
  try {
    await runFastPath(job, store, opts);
  } finally {
    await store.release();
  }
  return { ok: true, job, cached: false };
}

export async function runFastPath(job: AnalyzerJob, store: AnalyzerStore, opts: RunnerOptions = {}): Promise<AnalyzerJob> {
  const now = opts.now ?? Date.now;
  job.state = "fast";
  await step(job, store, "Fetching the homepage", now);
  const crawl = await crawlSite(job.url, { ...opts.crawl, resolver: opts.resolver, maxPages: 1 });
  if (!crawl.home || crawl.home.status >= 400) {
    job.state = "failed";
    job.error = crawl.homeFailure ? describeFailure(crawl.homeFailure.reason) : describeFailure("http-error");
    job.couldNotCheck = crawl.couldNotCheck;
    job.completedAt = now();
    await store.putJob(job);
    return job;
  }
  job.host = crawl.host;
  await step(job, store, "Reading robots.txt and the sitemap", now);
  await step(job, store, "Checking how a visitor can get in touch", now);
  await step(job, store, "Checking AI crawler access and structured data", now);
  const results = await runMeasuredExtractors({ crawl, psi: null, fetchOpts: { ...opts.crawl, resolver: opts.resolver } });
  applyCard(job, results, crawl, true);
  await step(job, store, "First findings ready", now);
  return job;
}

export async function runSlowPath(token: string, opts: RunnerOptions = {}): Promise<AnalyzerJob | null> {
  const store = opts.store ?? getStore();
  const now = opts.now ?? Date.now;
  const job = await store.getJob(token);
  if (!job || job.state === "failed" || job.state === "done") return job;
  job.state = "slow";
  const fetchOpts = { ...opts.crawl, resolver: opts.resolver };
  const extra: { scope: string; reason: string }[] = [];
  try {
    await step(job, store, "Crawling up to eight pages", now);
    const crawl = await crawlSite(job.url, { ...fetchOpts, maxPages: opts.crawl?.maxPages ?? 8 });
    if (!crawl.home) throw new Error(crawl.homeFailure ? describeFailure(crawl.homeFailure.reason) : "Homepage could not be fetched.");

    let psi: PsiResult | null = null;
    if (!opts.skipPsi) {
      await step(job, store, "Measuring Core Web Vitals with PageSpeed Insights", now);
      psi = await store.getPsi(crawl.host, "mobile");
      if (!psi) {
        const r = await fetchPsi(crawl.home.finalUrl, { strategy: "mobile", apiKey: opts.psiApiKey, fetchImpl: opts.psiFetch });
        if (isPsiFailure(r)) {
          extra.push({ scope: "performance", reason: r.reason === "no-key" ? "PageSpeed Insights is not configured." : `PageSpeed Insights failed: ${r.detail}` });
        } else {
          psi = r;
          await store.setPsi(crawl.host, "mobile", psi);
        }
      }
    }

    await step(job, store, "Running the measured checks across all pages", now);
    const measured = await runMeasuredExtractors({ crawl, psi, fetchOpts });

    let assessed: ExtractorResult[] = [];
    if (!opts.skipAssessed) {
      await step(job, store, "Assessing the offer, copy, audience and proof against the standard", now);
      try {
        assessed = await runAssessedLayer(crawl, { caller: opts.assessCaller, runs: opts.assessRuns ?? 2 });
      } catch (e) {
        extra.push({ scope: "assessed", reason: `The assessed layer did not complete: ${(e as Error).message}` });
      }
    }

    applyCard(job, [...assessed, ...measured], crawl, false, extra);
    job.state = job.couldNotCheck.some((c) => c.scope === "all" || c.scope === "assessed") ? "partial" : "done";
    job.completedAt = now();
    await step(job, store, "Report ready", now);
    await store.setDomainToken(job.host, job.token);
    await deliverReport(job, store, opts);
  } catch (e) {
    // The fast-path findings stand; the job is partial, never silently complete.
    job.state = "partial";
    job.error = (e as Error).message;
    job.completedAt = now();
    await step(job, store, "Some checks could not run", now);
  }
  return job;
}

/**
 * Build the report once the job is finished, and send it once if an email is
 * on the job. Safe to call from the slow path and from the email route; it is
 * idempotent on reportSentAt. The web report page also calls buildReport
 * lazily when a job finished before the report was persisted.
 */
export async function deliverReport(job: AnalyzerJob, store: AnalyzerStore, opts: RunnerOptions = {}): Promise<AnalyzerJob> {
  if (!job.card || !(job.state === "done" || job.state === "partial")) return job;
  if (!job.report || (job.costInputs && !job.report.cost)) {
    const benchmark = await store.getBenchmark();
    job.report = await buildReport(job, benchmark, { narrativeCaller: opts.narrativeCaller });
    job.updatedAt = (opts.now ?? Date.now)();
    await store.putJob(job);
  }
  if (job.email && !job.reportSentAt) {
    const res = await sendReportEmail({ to: job.email, report: job.report, reportUrl: reportUrlFor(job.token), bookingUrl: `${SITE_URL}${BOOKING_URL}`, fetchImpl: opts.emailFetch });
    if (res.ok) job.reportSentAt = (opts.now ?? Date.now)();
    else job.reportSendError = res.error ?? "send failed";
    job.updatedAt = (opts.now ?? Date.now)();
    await store.putJob(job);
  }
  return job;
}

export function describeFailure(reason: string): string {
  switch (reason) {
    case "timeout": return "The site took too long to respond.";
    case "dns-failed": return "That domain does not resolve.";
    case "non-html": return "That address does not serve a web page.";
    case "private-address": case "blocked-host": case "blocked-scheme": case "redirect-to-blocked": return "That address cannot be analysed.";
    case "too-many-redirects": return "The site redirects in a loop.";
    case "http-error": return "The site returned an error for its homepage.";
    default: return "The site could not be fetched.";
  }
}

/** What the public screen may see. No scores, no raw HTML (spec §6, §8, §15). */
export function toPublicJob(job: AnalyzerJob) {
  const card = job.card;
  return {
    token: job.token,
    url: job.url,
    host: job.host,
    state: job.state,
    preliminary: job.preliminary,
    steps: job.steps,
    error: job.error,
    band: card?.band ?? null,
    headline: job.headline,
    specifics: job.specifics,
    // Public result shows the five jobs with a verdict word and counts (report decision, 15 Oct 2026). No scores.
    jobs: card?.jobs ? card.jobs.filter((j) => j.job !== "foundation").map((j) => ({ job: j.job, label: j.label, verdict: j.verdict, measured: j.measured, counts: j.counts })) : [],
    checksRun: card ? card.dimensions.reduce((n, d) => n + d.counts.pass + d.counts.partial + d.counts.uncertain + d.counts.fail, 0) : 0,
    couldNotCheck: job.couldNotCheck,
    pagesChecked: job.pages.length,
    hasEmail: Boolean(job.email),
    cachedFrom: job.cachedFrom,
    completedAt: job.completedAt,
  };
}
