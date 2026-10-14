// Dimension 6, AEO / machine readability. Spec Group B, blog-skill AEO rules,
// Local SEO Strategist Phase 5.

import type { ExtractorResult, Finding, PageModel } from "../types";
import { aiCrawlerStatus } from "../robots";
import { commercialPages, daysAgo, finding, hasType, isArticle, jsonLdObjects, na, parseDate, pathOf, short, type ExtractorContext } from "./common";

const KEY_AI = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot"];

function firstParagraph(p: PageModel): string {
  // Text after the first H1, up to 60 words.
  const h1 = p.headings.find((h) => h.level === 1)?.text ?? "";
  let t = p.text;
  if (h1) {
    const i = t.indexOf(h1);
    if (i >= 0) t = t.slice(i + h1.length);
  }
  return t.split(/\s+/).slice(0, 60).join(" ");
}

export async function runAeo(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl } = ctx;
  const f: Finding[] = [];
  const home = crawl.home!;
  const pages = crawl.pages;
  const commercial = commercialPages(crawl);

  // aeo-01 AI crawlers
  const ai = aiCrawlerStatus(crawl.robots);
  const blockedKey = ai.blocked.filter((b) => KEY_AI.includes(b));
  if (!crawl.robots.fetched) f.push(finding(6, "aeo-01", "pass", 18, "No robots.txt, so no AI crawler is blocked."));
  else if (blockedKey.length) f.push(finding(6, "aeo-01", "fail", 18, `robots.txt blocks ${blockedKey.join(", ")}. These answer engines cannot read the site.`));
  else if (ai.blocked.length) f.push(finding(6, "aeo-01", "partial", 18, `robots.txt blocks ${ai.blocked.join(", ")}; the major answer-engine crawlers are allowed.`));
  else f.push(finding(6, "aeo-01", "pass", 18, `No AI crawler blocked. Explicitly allowed: ${ai.allowed.join(", ") || "none"}; unaddressed (allowed by default): ${ai.unaddressed.join(", ") || "none"}.`));

  // aeo-02 structured data present and valid
  const blocks = pages.flatMap((p) => p.jsonLd);
  const invalid = blocks.filter((b) => !b.valid).length;
  if (!blocks.length) f.push(finding(6, "aeo-02", "fail", 12, "No JSON-LD structured data on any crawled page."));
  else if (invalid) f.push(finding(6, "aeo-02", "partial", 12, `${blocks.length} JSON-LD block(s), ${invalid} do not parse.`));
  else f.push(finding(6, "aeo-02", "pass", 12, `${blocks.length} valid JSON-LD block(s); types: ${[...new Set(blocks.flatMap((b) => b.types))].slice(0, 8).join(", ")}.`));

  // aeo-03 entity schema
  const orgs = jsonLdObjects(home).filter((o) => hasType(o, /Organization|LocalBusiness|ProfessionalService|AccountingService|FinancialService|LegalService|MedicalBusiness|Corporation/));
  const org = orgs[0];
  if (!org) f.push(finding(6, "aeo-03", "fail", 12, "No Organization or LocalBusiness schema on the homepage."));
  else {
    const sameAs = Array.isArray(org.sameAs) ? (org.sameAs as unknown[]).length : org.sameAs ? 1 : 0;
    const complete = Boolean(org.name) && Boolean(org.url);
    if (complete && sameAs) f.push(finding(6, "aeo-03", "pass", 12, `${String(org["@type"])} schema with name, url and ${sameAs} sameAs link(s).`));
    else f.push(finding(6, "aeo-03", "partial", 12, `${String(org["@type"])} schema present but ${!complete ? "missing name or url" : "no sameAs links to the business's profiles"}.`));
  }

  // aeo-04 FAQ parity
  const faqPages = pages.filter((p) => jsonLdObjects(p).some((o) => hasType(o, /FAQPage/)));
  if (!faqPages.length) f.push(na(6, "aeo-04", 8, "No FAQPage schema to compare."));
  else {
    let total = 0, matched = 0;
    for (const p of faqPages) {
      for (const o of jsonLdObjects(p)) {
        if (!hasType(o, /Question/)) continue;
        const q = String(o.name ?? "").trim();
        if (!q) continue;
        total++;
        if (p.text.toLowerCase().includes(q.toLowerCase().slice(0, 40))) matched++;
      }
    }
    const status = total === 0 ? "fail" : matched === total ? "pass" : matched > 0 ? "partial" : "fail";
    f.push(finding(6, "aeo-04", status, 8, `${matched} of ${total} FAQ schema questions appear in the visible page text.`, faqPages.map((p) => pathOf(p.finalUrl))));
  }

  // aeo-05 answer-first opening (heuristic)
  const openers = commercial.map((p) => ({ p, para: firstParagraph(p) }));
  const good = openers.filter(({ para }) => para.split(/\s+/).length >= 25 && !/^(welcome|we are|we're|founded|our (team|story|mission))/i.test(para));
  if (!openers.length) f.push(na(6, "aeo-05", 8, "No commercial pages crawled."));
  else {
    const share = good.length / openers.length;
    f.push(finding(6, "aeo-05", share >= 0.75 ? "pass" : share >= 0.4 ? "partial" : "fail", 8, `${good.length} of ${openers.length} commercial pages open with a direct statement rather than a greeting or company intro. Homepage opens: "${short(openers[0]?.para ?? "", 160)}"`));
  }

  // aeo-06 question headings
  const qHeadings = pages.flatMap((p) => p.headings.filter((h) => h.level >= 2 && /\?\s*$/.test(h.text)));
  f.push(finding(6, "aeo-06", qHeadings.length >= 3 ? "pass" : qHeadings.length >= 1 ? "partial" : "fail", 10, qHeadings.length ? `${qHeadings.length} question-form heading(s), e.g. "${short(qHeadings[0].text, 90)}".` : "No headings phrased as questions on crawled pages."));

  // aeo-07 heading hierarchy
  let skips = 0;
  for (const p of pages) {
    let prev = 0;
    for (const h of p.headings) {
      if (prev && h.level > prev + 1) skips++;
      prev = h.level;
    }
  }
  const badH1 = pages.filter((p) => p.h1Count !== 1).length;
  f.push(finding(6, "aeo-07", badH1 === 0 && skips === 0 ? "pass" : badH1 <= 1 && skips <= 3 ? "partial" : "fail", 8, `${badH1} page(s) without exactly one H1; ${skips} skipped heading level(s) across crawled pages.`));

  // aeo-08 entity clarity
  const aboutLink = home.internalLinks.some((l) => /\/about/i.test(l.href)) || pages.some((p) => /\/about/i.test(pathOf(p.finalUrl)));
  const person = pages.some((p) => jsonLdObjects(p).some((o) => hasType(o, /^Person$/)));
  const nameInTitle = org && typeof org.name === "string" ? home.meta.title.toLowerCase().includes((org.name as string).toLowerCase().split(" ")[0]) : false;
  const signals = [aboutLink && "About page", person && "Person schema", nameInTitle && "consistent business name"].filter(Boolean) as string[];
  f.push(finding(6, "aeo-08", signals.length === 3 ? "pass" : signals.length >= 1 ? "partial" : "fail", 10, signals.length ? `Entity signals present: ${signals.join(", ")}.` : "No About page link, no Person schema, business name not consistent between schema and title."));

  // aeo-09 freshness
  const dates: Date[] = [];
  for (const u of crawl.sitemap.urls) {
    const d = parseDate(u.lastmod);
    if (d) dates.push(d);
  }
  for (const p of pages) for (const o of jsonLdObjects(p)) for (const k of ["dateModified", "datePublished"]) {
    const d = parseDate(o[k] as string | undefined);
    if (d) dates.push(d);
  }
  if (!dates.length) f.push(na(6, "aeo-09", 8, "No dates found in the sitemap or schema."));
  else {
    const latest = dates.reduce((a, b) => (a > b ? a : b));
    const age = daysAgo(latest);
    f.push(finding(6, "aeo-09", age <= 30 ? "pass" : age <= 90 ? "partial" : "fail", 8, `Most recent dated content: ${latest.toISOString().slice(0, 10)} (${age} days ago).`));
  }

  // aeo-10 article schema on posts
  const articles = pages.filter(isArticle);
  if (!articles.length) f.push(na(6, "aeo-10", 6, "No blog or article pages crawled."));
  else {
    const withSchema = articles.filter((p) => jsonLdObjects(p).some((o) => hasType(o, /Article|BlogPosting/) && o.author && o.datePublished));
    f.push(finding(6, "aeo-10", withSchema.length === articles.length ? "pass" : withSchema.length ? "partial" : "fail", 6, `${withSchema.length} of ${articles.length} article pages carry Article schema with author and date.`, articles.map((p) => pathOf(p.finalUrl))));
  }

  return { dimension: 6, findings: f };
}
