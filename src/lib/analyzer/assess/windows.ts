// Text windows the assessed layer reads. Capped so the model sees the same
// slice every time and the call stays cheap.

import type { CrawlResult, PageModel } from "../types";
import { commercialPages, pathOf } from "../extractors/common";

export type PageWindow = {
  path: string;
  title: string;
  description: string;
  headings: string[];
  opening: string;
  ctaTexts: string[];
  formFieldCounts: number[];
  proofLines: string[];
  imageAltSample: string[];
};

export type AssessmentWindows = {
  host: string;
  hero: string;
  opening: string;
  homeTitle: string;
  homeDescription: string;
  schemaDescription: string;
  pages: PageWindow[];
  /** Every string above joined, used to verify quoted evidence. */
  corpus: string;
};

const CTA_RE = /\b(book|get|start|schedule|talk|call|contact|apply|download|try|request|claim|join|see|show me|send me|learn more|submit)\b/i;
const PROOF_RE = /(\$|£|€)\s?\d[\d,.]*\s?(m|k|million|billion)?|\b\d+(\.\d+)?\s?%|\b\d+\s?(years?|clients?|businesses|leads?|hours?|minutes?|x)\b|"[^"]{20,220}"|“[^”]{20,220}”/i;

function words(s: string, n: number): string {
  return s.split(/\s+/).filter(Boolean).slice(0, n).join(" ");
}

function heroOf(home: PageModel): string {
  const h1 = home.headings.find((h) => h.level === 1)?.text ?? "";
  const i = h1 ? home.text.indexOf(h1) : -1;
  const after = i >= 0 ? home.text.slice(i + h1.length) : home.text;
  // Opening per the copy criteria: the H1 plus the first 75 visible words.
  const sub = words(after, 75);
  const cta = home.links.find((l) => l.internal && CTA_RE.test(l.text) && l.text.length <= 60)?.text ?? "";
  return [h1, sub, cta ? `[CTA: ${cta}]` : ""].filter(Boolean).join("\n");
}

function openingOf(home: PageModel): string {
  const h1 = home.headings.find((h) => h.level === 1)?.text ?? "";
  const i = h1 ? home.text.indexOf(h1) : -1;
  const after = i >= 0 ? home.text.slice(i + h1.length) : home.text;
  // After the 75-word opening, the next 150 words (the primary proposition continues).
  return after.split(/\s+/).filter(Boolean).slice(75, 225).join(" ");
}

function proofLinesOf(p: PageModel, max = 8): string[] {
  const sentences = p.text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => PROOF_RE.test(s) && s.length <= 240).slice(0, max);
}

function pageWindow(p: PageModel): PageWindow {
  const ctas = [...new Set(p.links.filter((l) => l.internal && CTA_RE.test(l.text) && l.text.length <= 60).map((l) => l.text))].slice(0, 8);
  const alts = (p.html.match(/alt="([^"]{3,80})"/g) ?? []).map((m) => m.slice(5, -1)).slice(0, 6);
  return {
    path: pathOf(p.finalUrl),
    title: p.meta.title,
    description: p.meta.description,
    headings: p.headings.slice(0, 20).map((h) => `h${h.level}: ${h.text}`),
    opening: words(p.text, 400),
    ctaTexts: ctas,
    formFieldCounts: p.forms.map((f) => f.fieldCount),
    proofLines: proofLinesOf(p),
    imageAltSample: alts,
  };
}

export function buildWindows(crawl: CrawlResult, maxPages = 5): AssessmentWindows {
  const home = crawl.home!;
  const pages = [home, ...commercialPages(crawl).filter((p) => p !== home)].slice(0, maxPages).map(pageWindow);
  const schemaDescription = (home.jsonLd.map((b) => JSON.stringify(b.parsed ?? "")).join(" ").match(/"description":"([^"]{20,300})"/)?.[1]) ?? "";
  const w: AssessmentWindows = {
    host: crawl.host,
    hero: heroOf(home),
    opening: openingOf(home),
    homeTitle: home.meta.title,
    homeDescription: home.meta.description,
    schemaDescription,
    pages,
    corpus: "",
  };
  w.corpus = [w.hero, w.opening, w.homeTitle, w.homeDescription, w.schemaDescription, ...pages.flatMap((p) => [p.title, p.description, ...p.headings, p.opening, ...p.ctaTexts, ...p.proofLines, ...p.imageAltSample])].join("\n");
  return w;
}

export function renderWindows(w: AssessmentWindows): string {
  const lines: string[] = [];
  lines.push(`SITE: ${w.host}`);
  lines.push(`\nOPENING (the H1 plus the first 75 visible words, then the first CTA):\n${w.hero}`);
  lines.push(`\nPRIMARY PROPOSITION CONTINUES (the next ~150 words):\n${w.opening}`);
  lines.push(`\nHOME TITLE: ${w.homeTitle}\nHOME META DESCRIPTION: ${w.homeDescription}\nSCHEMA DESCRIPTION: ${w.schemaDescription || "(none)"}`);
  for (const p of w.pages) {
    lines.push(`\n--- PAGE ${p.path} ---\nTITLE: ${p.title}\nDESCRIPTION: ${p.description}\nHEADINGS:\n${p.headings.join("\n")}\nOPENING TEXT (first 400 words):\n${p.opening}\nCTA TEXTS: ${p.ctaTexts.join(" | ") || "(none)"}\nFORM FIELD COUNTS: ${p.formFieldCounts.join(", ") || "(no forms)"}\nLINES WITH NUMBERS OR QUOTES:\n${p.proofLines.join("\n") || "(none)"}\nIMAGE ALT TEXT SAMPLE: ${p.imageAltSample.join(" | ") || "(none)"}`);
  }
  return lines.join("\n");
}
