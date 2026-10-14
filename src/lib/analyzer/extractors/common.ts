// Shared helpers for the measured extractors.

import type { CrawlResult, Dimension, Finding, FindingStatus, PageModel } from "../types";
import type { PsiResult } from "../psi";
import type { FetchOptions } from "../fetch";

export type ExtractorContext = {
  crawl: CrawlResult;
  psi: PsiResult | null;
  fetchOpts?: FetchOptions;
};

export function finding(
  dimension: Dimension,
  criterionId: string,
  status: Exclude<FindingStatus, "na">,
  weight: number,
  evidence: string,
  pages: string[] = [],
): Finding {
  return { dimension, criterionId, layer: "measured", status, weight, evidence: evidence.slice(0, 600), fixId: criterionId, pages };
}

export function na(dimension: Dimension, criterionId: string, weight: number, reason: string): Finding {
  return { dimension, criterionId, layer: "measured", status: "na", weight, evidence: "", fixId: criterionId, pages: [], naReason: reason };
}

/** Three-way threshold helper: higher is better. */
export function gradeHigh(value: number, pass: number, partial: number): Exclude<FindingStatus, "na" | "uncertain"> {
  if (value >= pass) return "pass";
  if (value >= partial) return "partial";
  return "fail";
}
/** Three-way threshold helper: lower is better. */
export function gradeLow(value: number, pass: number, partial: number): Exclude<FindingStatus, "na" | "uncertain"> {
  if (value <= pass) return "pass";
  if (value <= partial) return "partial";
  return "fail";
}

export function pathOf(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return url;
  }
}

export const ARTICLE_PATH = /\/(blog|post|posts|article|articles|news|insights|resources|guides?)\//i;
export const UTILITY_PATH = /\/(contact|privacy|terms|thank|diagnostic|login|cart|checkout|sitemap|search)(\/|$)/i;

export function isArticle(p: PageModel): boolean {
  return ARTICLE_PATH.test(pathOf(p.finalUrl)) || p.jsonLd.some((j) => j.types.some((t) => /Article|BlogPosting|NewsArticle/.test(t)));
}

export function commercialPages(crawl: CrawlResult): PageModel[] {
  return crawl.pages.filter((p) => !isArticle(p) && !UTILITY_PATH.test(pathOf(p.finalUrl)));
}

export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function daysAgo(d: Date, now = new Date()): number {
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

/** Flatten JSON-LD into a list of objects, following @graph and arrays. */
export function jsonLdObjects(p: PageModel): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) return v.forEach(walk);
    const o = v as Record<string, unknown>;
    if (o["@type"]) out.push(o);
    if (o["@graph"]) walk(o["@graph"]);
    for (const [k, val] of Object.entries(o)) if (k !== "@graph" && val && typeof val === "object") walk(val);
  };
  p.jsonLd.forEach((b) => b.valid && walk(b.parsed));
  return out;
}

export function typesOf(o: Record<string, unknown>): string[] {
  const t = o["@type"];
  return typeof t === "string" ? [t] : Array.isArray(t) ? t.filter((x): x is string => typeof x === "string") : [];
}

export function hasType(o: Record<string, unknown>, re: RegExp): boolean {
  return typesOf(o).some((t) => re.test(t));
}

/** Word-shingle Jaccard similarity, capped for cost. */
export function textSimilarity(a: string, b: string, n = 3, cap = 3000): number {
  const sh = (s: string) => {
    const w = s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, cap);
    const set = new Set<string>();
    for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(" "));
    return set;
  };
  const A = sh(a), B = sh(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

export function allScriptSrcs(crawl: CrawlResult): string[] {
  return [...new Set(crawl.pages.flatMap((p) => p.scripts.map((s) => s.src)))];
}

export function allInline(crawl: CrawlResult): string {
  return crawl.pages.map((p) => p.inlineScriptText).join("\n");
}

export function allHtml(crawl: CrawlResult): string {
  return crawl.pages.map((p) => p.html).join("\n");
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

export function short(s: string, n = 140): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
