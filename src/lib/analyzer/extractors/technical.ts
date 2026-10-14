// Dimension 13, Technical health and accessibility. Quality checklist §3, §7;
// SEO Audit Skill security; spec Group C. Makes up to three extra fetches.

import { isFetchFailure, safeFetch } from "../fetch";
import type { ExtractorResult, Finding } from "../types";
import { finding, na, pathOf, type ExtractorContext } from "./common";

const SEC_HEADERS: [string, string][] = [
  ["strict-transport-security", "HSTS"],
  ["x-content-type-options", "X-Content-Type-Options"],
  ["x-frame-options|content-security-policy", "frame protection (X-Frame-Options or CSP frame-ancestors)"],
  ["referrer-policy", "Referrer-Policy"],
];

export async function runTechnical(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl, fetchOpts } = ctx;
  const f: Finding[] = [];
  const home = crawl.home!;
  const final = new URL(home.finalUrl);
  const pages = crawl.pages;

  // tech-01 https + http redirect
  if (final.protocol !== "https:") f.push(finding(13, "tech-01", "fail", 15, `Site serves over ${final.protocol} at ${home.finalUrl}.`));
  else {
    const httpProbe = await safeFetch(`http://${final.host}/`, { ...fetchOpts, maxRedirects: 3, timeoutMs: 6000 });
    if (isFetchFailure(httpProbe)) f.push(finding(13, "tech-01", "partial", 15, `HTTPS in use; http variant could not be checked (${httpProbe.reason}).`));
    else if (httpProbe.finalUrl.startsWith("https://")) f.push(finding(13, "tech-01", "pass", 15, "HTTPS in use and http redirects to https."));
    else f.push(finding(13, "tech-01", "partial", 15, `HTTPS in use but http://${final.host}/ serves without redirecting (HTTP ${httpProbe.status}).`));
  }

  // tech-02 www consolidation
  const altHost = final.hostname.startsWith("www.") ? final.hostname.slice(4) : `www.${final.hostname}`;
  const altProbe = await safeFetch(`https://${altHost}/`, { ...fetchOpts, maxRedirects: 3, timeoutMs: 6000 });
  if (isFetchFailure(altProbe)) {
    if (altProbe.reason === "dns-failed") f.push(finding(13, "tech-02", "partial", 8, `${altHost} does not resolve; visitors typing it get an error.`));
    else f.push(na(13, "tech-02", 8, `Alternate host ${altHost} could not be checked (${altProbe.reason}).`));
  } else {
    const consolidated = new URL(altProbe.finalUrl).hostname === final.hostname;
    f.push(finding(13, "tech-02", consolidated ? "pass" : "fail", 8, consolidated ? `${altHost} redirects to ${final.hostname}.` : `${altHost} serves a separate copy of the site (HTTP ${altProbe.status}) instead of redirecting.`));
  }

  // tech-03 security headers
  const missing = SEC_HEADERS.filter(([k]) => !k.split("|").some((h) => home.headers[h] !== undefined)).map(([, label]) => label);
  const present = SEC_HEADERS.length - missing.length;
  f.push(finding(13, "tech-03", present >= 3 ? "pass" : present >= 1 ? "partial" : "fail", 12, missing.length ? `Missing security headers: ${missing.join(", ")}.` : "All four baseline security headers present."));

  // tech-04 mixed content
  const mixed = pages.flatMap((p) => (p.finalUrl.startsWith("https://") ? [...p.scripts.map((s) => s.src), ...p.stylesheets, ...p.iframes].filter((u) => u.startsWith("http://")) : []));
  f.push(finding(13, "tech-04", mixed.length ? "fail" : "pass", 10, mixed.length ? `Insecure resources on https pages: ${[...new Set(mixed)].slice(0, 3).join(", ")}.` : "No http resources on https pages."));

  // tech-05 lang
  const noLang = pages.filter((p) => !p.meta.lang);
  f.push(finding(13, "tech-05", noLang.length === 0 ? "pass" : noLang.length < pages.length ? "partial" : "fail", 5, noLang.length ? `html lang missing on: ${noLang.map((p) => pathOf(p.finalUrl)).join(", ")}.` : `html lang set (${home.meta.lang}).`));

  // tech-06 main landmarks
  const multiMain = pages.filter((p) => p.mainCount > 1);
  const noMain = pages.filter((p) => p.mainCount === 0);
  if (multiMain.length) f.push(finding(13, "tech-06", "fail", 5, `Multiple main landmarks on: ${multiMain.map((p) => `${pathOf(p.finalUrl)} (${p.mainCount})`).join(", ")}.`));
  else if (noMain.length === pages.length) f.push(finding(13, "tech-06", "partial", 5, "No main landmark on any crawled page."));
  else f.push(finding(13, "tech-06", "pass", 5, "One main landmark per page."));

  // tech-07 broken internal links (same source as seo-09, lighter weight here)
  const broken = crawl.failures.filter((x) => x.reason === "http-error");
  f.push(finding(13, "tech-07", broken.length === 0 ? "pass" : broken.length <= 1 ? "partial" : "fail", 8, broken.length ? `${broken.length} linked page(s) returned errors.` : "No linked pages returned errors."));

  // tech-08 Lighthouse accessibility
  const a11y = ctx.psi?.scores.accessibility;
  if (a11y == null) f.push(na(13, "tech-08", 20, "Accessibility score requires the PageSpeed run."));
  else f.push(finding(13, "tech-08", a11y >= 90 ? "pass" : a11y >= 70 ? "partial" : "fail", 20, `Lighthouse accessibility ${a11y}${ctx.psi!.a11yFailures.length ? `; failing: ${ctx.psi!.a11yFailures.slice(0, 4).join("; ")}` : ""}.`));

  // tech-09 version exposure
  const exposed = [home.headers["x-powered-by"], home.headers["server"], home.meta.generator].filter((v) => v && /\d+\.\d+/.test(v));
  f.push(finding(13, "tech-09", exposed.length ? "partial" : "pass", 5, exposed.length ? `Version strings exposed: ${exposed.join(" | ")}.` : "No server or CMS version strings exposed."));

  // tech-10 real 404
  const probe = await safeFetch(`${final.origin}/analyzer-probe-${Date.now().toString(36)}`, { ...fetchOpts, maxRedirects: 2, timeoutMs: 6000 });
  if (isFetchFailure(probe)) f.push(na(13, "tech-10", 12, `404 handling could not be checked (${probe.reason}).`));
  else if (probe.status === 404 || probe.status === 410) f.push(finding(13, "tech-10", "pass", 12, `Unknown paths return HTTP ${probe.status}.`));
  else if (probe.status >= 300 && probe.status < 400) f.push(finding(13, "tech-10", "partial", 12, `Unknown paths redirect (to ${probe.finalUrl}) instead of returning 404.`));
  else f.push(finding(13, "tech-10", "fail", 12, `Unknown paths return HTTP ${probe.status} (soft 404).`));

  return { dimension: 13, findings: f };
}
