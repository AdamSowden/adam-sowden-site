// Dimension 5, SEO. Spec Group C + SEO Audit Skill + blog-skill meta rules.

import type { ExtractorResult, Finding } from "../types";
import { isAllowed } from "../robots";
import { finding, gradeHigh, na, pathOf, pct, type ExtractorContext } from "./common";

export async function runSeo(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl } = ctx;
  const f: Finding[] = [];
  const pages = crawl.pages;
  const home = crawl.home!;
  const paths = (ps: typeof pages) => ps.map((p) => pathOf(p.finalUrl));

  // seo-01 indexable
  const noindex = pages.filter((p) => /noindex/i.test(p.meta.robots) || /noindex/i.test(p.headers["x-robots-tag"] ?? ""));
  if (noindex.some((p) => p === home)) f.push(finding(5, "seo-01", "fail", 15, `Homepage carries noindex (${home.meta.robots || home.headers["x-robots-tag"]}).`, ["/"]));
  else if (noindex.length) f.push(finding(5, "seo-01", "partial", 15, `noindex on ${noindex.length} crawled page(s): ${paths(noindex).join(", ")}.`, paths(noindex)));
  else f.push(finding(5, "seo-01", "pass", 15, "No noindex directives on crawled pages."));

  // seo-02 sitemap
  const sm = crawl.sitemap;
  const referenced = crawl.robots.sitemaps.length > 0;
  if (sm.fetched && referenced) f.push(finding(5, "seo-02", "pass", 10, `Sitemap found with ${sm.urls.length} URLs and referenced from robots.txt.`));
  else if (sm.fetched) f.push(finding(5, "seo-02", "partial", 10, `Sitemap found with ${sm.urls.length} URLs but not referenced from robots.txt.`));
  else f.push(finding(5, "seo-02", "fail", 10, `No valid sitemap found (${sm.errors.slice(0, 2).join("; ") || "no candidates"}).`));

  // seo-03 canonical
  const norm = (u: string) => u.replace(/\/+$/, "").toLowerCase();
  const withCanon = pages.filter((p) => p.meta.canonical);
  const selfRef = withCanon.filter((p) => norm(p.meta.canonical) === norm(p.finalUrl));
  if (selfRef.length === pages.length) f.push(finding(5, "seo-03", "pass", 10, `Self-referencing canonical on all ${pages.length} crawled pages.`));
  else if (withCanon.length === 0) f.push(finding(5, "seo-03", "fail", 10, "No canonical tags on any crawled page."));
  else f.push(finding(5, "seo-03", "partial", 10, `Canonical present on ${withCanon.length} of ${pages.length} pages; self-referencing on ${selfRef.length}. Missing or mismatched: ${paths(pages.filter((p) => !selfRef.includes(p))).join(", ")}.`));

  // seo-04 titles
  const titles = pages.map((p) => p.meta.title);
  const badLen = pages.filter((p) => p.meta.title.length < 15 || p.meta.title.length > 60);
  const dupTitles = titles.filter((t, i) => t && titles.indexOf(t) !== i);
  const titleIssues = badLen.length + dupTitles.length;
  f.push(finding(5, "seo-04", titleIssues === 0 ? "pass" : titleIssues <= 2 ? "partial" : "fail", 10,
    titleIssues === 0 ? "Every crawled page has a unique title of 15 to 60 characters." : `${badLen.length} title(s) outside 15–60 chars (${paths(badLen).join(", ") || "none"}); ${dupTitles.length} duplicate(s).`));

  // seo-05 descriptions
  const noDesc = pages.filter((p) => !p.meta.description);
  const badDesc = pages.filter((p) => p.meta.description && (p.meta.description.length < 50 || p.meta.description.length > 160));
  const descs = pages.map((p) => p.meta.description).filter(Boolean);
  const dupDesc = descs.filter((d, i) => descs.indexOf(d) !== i).length;
  const descIssues = noDesc.length + badDesc.length + dupDesc;
  f.push(finding(5, "seo-05", descIssues === 0 ? "pass" : descIssues <= 2 ? "partial" : "fail", 8,
    descIssues === 0 ? "Every crawled page has a unique meta description of 50 to 160 characters." : `${noDesc.length} missing (${paths(noDesc).join(", ") || "none"}), ${badDesc.length} outside 50–160 chars, ${dupDesc} duplicate(s).`));

  // seo-06 one H1
  const badH1 = pages.filter((p) => p.h1Count !== 1);
  if (!badH1.length) f.push(finding(5, "seo-06", "pass", 12, "Exactly one H1 on every crawled page."));
  else if (home.h1Count !== 1 || badH1.length > pages.length / 2) f.push(finding(5, "seo-06", "fail", 12, `H1 count wrong on ${badH1.length} of ${pages.length} pages: ${badH1.map((p) => `${pathOf(p.finalUrl)} (${p.h1Count})`).join(", ")}.`, paths(badH1)));
  else f.push(finding(5, "seo-06", "partial", 12, `H1 count wrong on ${badH1.length} page(s): ${badH1.map((p) => `${pathOf(p.finalUrl)} (${p.h1Count})`).join(", ")}.`, paths(badH1)));

  // seo-07 alt coverage
  const imgs = pages.reduce((n, p) => n + p.images.total, 0);
  const alts = pages.reduce((n, p) => n + p.images.withAlt, 0);
  if (!imgs) f.push(na(5, "seo-07", 7, "No images on crawled pages."));
  else f.push(finding(5, "seo-07", gradeHigh(pct(alts, imgs), 80, 50), 7, `${alts} of ${imgs} images have alt text (${pct(alts, imgs)}%).`));

  // seo-08 viewport
  const noVp = pages.filter((p) => !/width=device-width/i.test(p.meta.viewport));
  f.push(finding(5, "seo-08", noVp.length === 0 ? "pass" : noVp.length < pages.length ? "partial" : "fail", 8, noVp.length ? `Viewport meta missing on: ${paths(noVp).join(", ")}.` : "Mobile viewport meta on every crawled page."));

  // seo-09 broken links among crawled candidates
  const broken = crawl.failures.filter((x) => x.reason === "http-error" && (x.status ?? 0) >= 400);
  f.push(finding(5, "seo-09", broken.length === 0 ? "pass" : broken.length === 1 ? "partial" : "fail", 8, broken.length ? `Linked pages returning errors: ${broken.map((b) => `${pathOf(b.requestedUrl)} (${b.status})`).join(", ")}.` : "No linked pages returned errors."));

  // seo-10 redirect hygiene: from the crawl's home fetch we only know the final URL; use host difference as proxy
  const hops = crawl.home ? (crawl.home.url !== crawl.home.finalUrl ? 1 : 0) : 0;
  f.push(finding(5, "seo-10", hops <= 1 ? "pass" : "partial", 6, hops ? `Homepage redirected to ${crawl.home!.finalUrl}.` : "Homepage resolved without redirects."));

  // seo-11 robots not blocking all
  const blockedAll = crawl.robots.fetched && !isAllowed(crawl.robots, "*", "/");
  f.push(finding(5, "seo-11", blockedAll ? "fail" : "pass", 6, blockedAll ? "robots.txt disallows / for all user agents." : "robots.txt does not block crawlers from the site."));

  return { dimension: 5, findings: f };
}
