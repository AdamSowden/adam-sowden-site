// Dimension 7, Content depth and freshness. Spec Group D, SEO Content Strategy.

import type { ExtractorResult, Finding } from "../types";
import { ARTICLE_PATH, UTILITY_PATH, commercialPages, finding, na, parseDate, pathOf, textSimilarity, type ExtractorContext } from "./common";

const LOW_VALUE = /\/(tag|tags|category|categories|author|page\/\d+|feed|wp-json|cart|checkout|login|privacy|terms|thank|attachment)(\/|$)/i;

export function contentMonthsActive(lastmods: (string | null)[], now = new Date()): number {
  const months = new Set<string>();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 12);
  for (const lm of lastmods) {
    const d = parseDate(lm);
    if (d && d >= cutoff && d <= now) months.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
  }
  return months.size;
}

export async function runContentDepth(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl } = ctx;
  const f: Finding[] = [];
  const pages = crawl.pages;
  const sm = crawl.sitemap;

  // cd-01 substantive page count
  if (sm.fetched && sm.urls.length) {
    const substantive = sm.urls.filter((u) => !LOW_VALUE.test(u.loc) && !/\.(xml|pdf|jpe?g|png)$/i.test(u.loc));
    f.push(finding(7, "cd-01", substantive.length >= 30 ? "pass" : substantive.length >= 10 ? "partial" : "fail", 20, `${substantive.length} content URLs in the sitemap (excluding tags, categories and utility pages).`));
  } else {
    const n = pages.filter((p) => p.wordCount >= 300).length;
    f.push(finding(7, "cd-01", n >= 6 ? "partial" : "fail", 20, `No sitemap; ${n} of ${pages.length} crawled pages have 300+ words. Page count could not be established.`));
  }

  // cd-02 cadence
  const articleMods = sm.urls.filter((u) => ARTICLE_PATH.test(u.loc)).map((u) => u.lastmod);
  const anyMods = sm.urls.map((u) => u.lastmod);
  const source = articleMods.some(Boolean) ? articleMods : anyMods;
  if (!source.some(Boolean)) f.push(na(7, "cd-02", 25, "Sitemap has no lastmod dates, so publishing cadence cannot be measured."));
  else {
    const months = contentMonthsActive(source);
    f.push(finding(7, "cd-02", months >= 9 ? "pass" : months >= 3 ? "partial" : "fail", 25, `Content dated in ${months} of the last 12 months${articleMods.some(Boolean) ? " (article URLs)" : " (all sitemap URLs; no article section identified)"}.`));
  }

  // cd-03 thin pages
  const measurable = pages.filter((p) => !UTILITY_PATH.test(pathOf(p.finalUrl)) && !p.renderedClientSide);
  if (!measurable.length) f.push(na(7, "cd-03", 15, "No measurable pages (content rendered client-side)."));
  else {
    const thin = measurable.filter((p) => p.wordCount < 300);
    const share = thin.length / measurable.length;
    f.push(finding(7, "cd-03", share < 0.25 ? "pass" : share <= 0.5 ? "partial" : "fail", 15, thin.length ? `${thin.length} of ${measurable.length} crawled pages under 300 words: ${thin.map((p) => `${pathOf(p.finalUrl)} (${p.wordCount})`).join(", ")}.` : `All ${measurable.length} crawled content pages exceed 300 words.`));
  }

  // cd-04 near-duplicate pages
  const seenPath = new Set<string>();
  const comm = commercialPages(crawl).filter((p) => p.wordCount >= 150).filter((p) => { const k = pathOf(p.finalUrl).toLowerCase().replace(/\/+$/, "") || "/"; if (seenPath.has(k)) return false; seenPath.add(k); return true; });
  let worst = 0, pair = "";
  for (let i = 0; i < comm.length; i++) for (let j = i + 1; j < comm.length; j++) {
    const s = textSimilarity(comm[i].text, comm[j].text);
    if (s > worst) { worst = s; pair = `${pathOf(comm[i].finalUrl)} and ${pathOf(comm[j].finalUrl)}`; }
  }
  if (comm.length < 2) f.push(na(7, "cd-04", 15, "Fewer than two commercial pages to compare."));
  else f.push(finding(7, "cd-04", worst < 0.6 ? "pass" : worst <= 0.8 ? "partial" : "fail", 15, `Highest text similarity between crawled commercial pages: ${Math.round(worst * 100)}% (${pair}).`));

  // cd-05 specificity on the homepage
  const home = crawl.home!;
  const words = Math.max(1, home.wordCount);
  const specifics = (home.text.match(/(\$|£|€|AUD|USD)\s?\d[\d,.]*|\b\d+(\.\d+)?\s?%|\b(19|20)\d{2}\b|\b\d{1,3}(,\d{3})+\b|\b\d+\s?(years?|months?|weeks?|days?|hours?|minutes?|clients?|businesses|leads?)\b/gi) ?? []).length;
  const per1k = Math.round((specifics / words) * 1000 * 10) / 10;
  f.push(finding(7, "cd-05", per1k >= 3 ? "pass" : per1k >= 1 ? "partial" : "fail", 15, `${specifics} specific figures (money, percentages, years, counts) in ${words} homepage words (${per1k} per 1,000).`));

  // cd-06 buyer questions answered
  const hasFaqSchema = pages.some((p) => p.jsonLd.some((b) => b.types.includes("FAQPage")));
  const faqHeading = pages.some((p) => p.headings.some((h) => /faq|frequently asked|common questions|questions/i.test(h.text)));
  const qHeadings = pages.some((p) => p.headings.some((h) => h.level >= 2 && /\?\s*$/.test(h.text)));
  if (hasFaqSchema || faqHeading) f.push(finding(7, "cd-06", "pass", 10, `A FAQ section exists${hasFaqSchema ? " with FAQPage schema" : ""}.`));
  else if (qHeadings) f.push(finding(7, "cd-06", "partial", 10, "Question-form headings exist but no FAQ section."));
  else f.push(finding(7, "cd-06", "fail", 10, "No FAQ section and no question-form headings on crawled pages."));

  return { dimension: 7, findings: f };
}
