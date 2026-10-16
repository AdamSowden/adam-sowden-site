// Job state, per-domain cache, PSI cache, concurrency semaphore and daily
// budget for the Analyzer. Upstash Redis when configured (same store the
// diagnostic uses), in-memory fallback otherwise so local dev and tests work.
// The fallback is per-process and resets on restart; it is a floor, not the target.

import { Redis } from "@upstash/redis";
import type { PsiResult } from "./psi";
import type { AnalyzerJob } from "./job";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const TTL = {
  job: 7 * 24 * 3600,
  domain: 24 * 3600,
  psi: 24 * 3600,
  semaphore: 10 * 60,
  budget: 36 * 3600,
  benchmark: 60 * 24 * 3600,
};

export const LIMITS = {
  concurrent: Number(process.env.ANALYZER_MAX_CONCURRENT ?? 5),
  /** WP10: full runs (crawl, PSI, two assessed passes) in flight at once. Bounds model spend under a burst. */
  concurrentSlow: Number(process.env.ANALYZER_MAX_CONCURRENT_SLOW ?? 4),
  dailyFreshRuns: Number(process.env.ANALYZER_DAILY_BUDGET ?? 300),
};

export interface AnalyzerStore {
  getJob(token: string): Promise<AnalyzerJob | null>;
  putJob(job: AnalyzerJob): Promise<void>;
  getDomainToken(host: string): Promise<string | null>;
  setDomainToken(host: string, token: string): Promise<void>;
  getPsi(host: string, strategy: string): Promise<PsiResult | null>;
  setPsi(host: string, strategy: string, psi: PsiResult): Promise<void>;
  /** Returns true if a slot was acquired. */
  acquire(): Promise<boolean>;
  release(): Promise<void>;
  /** Slow-path slots, separate from the fast-path ones. */
  acquireSlow(): Promise<boolean>;
  releaseSlow(): Promise<void>;
  /** Increments today's fresh-run counter; returns the new count. */
  bumpBudget(day: string): Promise<number>;
  getBenchmark(): Promise<AnalyzerJob | null>;
  setBenchmark(job: AnalyzerJob): Promise<void>;
  /** WP9: the last eight benchmark runs, newest first. */
  getBenchmarkHistory(): Promise<BenchmarkEntry[]>;
  pushBenchmarkHistory(entry: BenchmarkEntry): Promise<void>;
}

export type BenchmarkEntry = { token: string; host: string; band: string; overall: number | null; completedAt: number; engage: number | null };
export const BENCHMARK_HISTORY_MAX = 8;

const K = {
  job: (t: string) => `analyzer:job:${t}`,
  domain: (h: string) => `analyzer:domain:${h.toLowerCase()}`,
  psi: (h: string, s: string) => `analyzer:psi:${h.toLowerCase()}:${s}`,
  sem: "analyzer:sem",
  semSlow: "analyzer:sem:slow",
  budget: (d: string) => `analyzer:budget:${d}`,
  benchmark: "analyzer:benchmark:latest",
  benchmarkHistory: "analyzer:benchmark:history",
};

class RedisStore implements AnalyzerStore {
  constructor(private r: Redis) {}
  async getJob(t: string) { return (await this.r.get<AnalyzerJob>(K.job(t))) ?? null; }
  async putJob(j: AnalyzerJob) { await this.r.set(K.job(j.token), j, { ex: TTL.job }); }
  async getDomainToken(h: string) { return (await this.r.get<string>(K.domain(h))) ?? null; }
  async setDomainToken(h: string, t: string) { await this.r.set(K.domain(h), t, { ex: TTL.domain }); }
  async getPsi(h: string, s: string) { return (await this.r.get<PsiResult>(K.psi(h, s))) ?? null; }
  async setPsi(h: string, s: string, p: PsiResult) { await this.r.set(K.psi(h, s), p, { ex: TTL.psi }); }
  async acquire() {
    const n = await this.r.incr(K.sem);
    if (n === 1) await this.r.expire(K.sem, TTL.semaphore);
    if (n > LIMITS.concurrent) { await this.r.decr(K.sem); return false; }
    return true;
  }
  async release() { const n = await this.r.decr(K.sem); if (n < 0) await this.r.set(K.sem, 0, { ex: TTL.semaphore }); }
  async acquireSlow() {
    const n = await this.r.incr(K.semSlow);
    if (n === 1) await this.r.expire(K.semSlow, TTL.semaphore);
    if (n > LIMITS.concurrentSlow) { await this.r.decr(K.semSlow); return false; }
    return true;
  }
  async releaseSlow() { const n = await this.r.decr(K.semSlow); if (n < 0) await this.r.set(K.semSlow, 0, { ex: TTL.semaphore }); }
  async bumpBudget(d: string) { const n = await this.r.incr(K.budget(d)); if (n === 1) await this.r.expire(K.budget(d), TTL.budget); return n; }
  async getBenchmark() { return (await this.r.get<AnalyzerJob>(K.benchmark)) ?? null; }
  async setBenchmark(j: AnalyzerJob) { await this.r.set(K.benchmark, j, { ex: TTL.benchmark }); }
  async getBenchmarkHistory() { return (await this.r.get<BenchmarkEntry[]>(K.benchmarkHistory)) ?? []; }
  async pushBenchmarkHistory(e: BenchmarkEntry) { const h = [e, ...(await this.getBenchmarkHistory())].slice(0, BENCHMARK_HISTORY_MAX); await this.r.set(K.benchmarkHistory, h); }
}

export class MemoryStore implements AnalyzerStore {
  private m = new Map<string, { v: unknown; exp: number }>();
  private sem = 0;
  private semSlow = 0;
  private get<T>(k: string): T | null { const e = this.m.get(k); if (!e) return null; if (e.exp < Date.now()) { this.m.delete(k); return null; } return e.v as T; }
  private set(k: string, v: unknown, ttl: number) { this.m.set(k, { v, exp: Date.now() + ttl * 1000 }); }
  async getJob(t: string) { return this.get<AnalyzerJob>(K.job(t)); }
  async putJob(j: AnalyzerJob) { this.set(K.job(j.token), j, TTL.job); }
  async getDomainToken(h: string) { return this.get<string>(K.domain(h)); }
  async setDomainToken(h: string, t: string) { this.set(K.domain(h), t, TTL.domain); }
  async getPsi(h: string, s: string) { return this.get<PsiResult>(K.psi(h, s)); }
  async setPsi(h: string, s: string, p: PsiResult) { this.set(K.psi(h, s), p, TTL.psi); }
  async acquire() { if (this.sem >= LIMITS.concurrent) return false; this.sem++; return true; }
  async release() { this.sem = Math.max(0, this.sem - 1); }
  async acquireSlow() { if (this.semSlow >= LIMITS.concurrentSlow) return false; this.semSlow++; return true; }
  async releaseSlow() { this.semSlow = Math.max(0, this.semSlow - 1); }
  async bumpBudget(d: string) { const n = (this.get<number>(K.budget(d)) ?? 0) + 1; this.set(K.budget(d), n, TTL.budget); return n; }
  async getBenchmark() { return this.get<AnalyzerJob>(K.benchmark); }
  async setBenchmark(j: AnalyzerJob) { this.set(K.benchmark, j, TTL.benchmark); }
  async getBenchmarkHistory() { return this.get<BenchmarkEntry[]>(K.benchmarkHistory) ?? []; }
  async pushBenchmarkHistory(e: BenchmarkEntry) { this.set(K.benchmarkHistory, [e, ...(await this.getBenchmarkHistory())].slice(0, BENCHMARK_HISTORY_MAX), TTL.benchmark); }
  get inFlight() { return this.sem; }
  get slowInFlight() { return this.semSlow; }
}

let singleton: AnalyzerStore | null = null;
export function getStore(): AnalyzerStore {
  if (singleton) return singleton;
  singleton = UPSTASH_URL && UPSTASH_TOKEN ? new RedisStore(new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })) : new MemoryStore();
  return singleton;
}

export function hasDurableStore(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN);
}

export function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
