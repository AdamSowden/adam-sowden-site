// Measured criteria that live inside the message rubrics (Rubrics 01–04).

import type { CrawlResult, Finding } from "../types";
import { commercialPages, finding, na, pathOf, pct } from "../extractors/common";
import type { AssessmentWindows } from "./windows";

const SLOP_WORDS = /\b(delve|delves|delving|tapestry|multifaceted|nuanced|resonate|resonates|embark|journey|foster|illuminate|paramount|pivotal|robust|seamless|seamlessly|holistic|testament|meticulous|intricate|comprehensive|leverage|leveraging|unlock|unlocks|elevate|elevates|empower|empowers|empowering|game[- ]changer|game[- ]changing|cutting[- ]edge|tailored|bespoke solutions|synergy|streamline|next level|revolutioni[sz]e|transformative|furthermore|moreover|additionally|in essence|in conclusion|in summary|here's the thing|at the end of the day|let that sink in|sound familiar|more than ever|it's safe to say|it's worth noting|in today's world|in an era of|genuinely|honestly|actually|truly)\b/gi;

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const m = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

export function fleschKincaid(text: string): { grade: number; sentences: number; words: number } {
  const sents = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().split(/\s+/).length >= 3);
  const ws = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (!sents.length || ws.length < 30) return { grade: NaN, sentences: sents.length, words: ws.length };
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  const grade = 0.39 * (ws.length / sents.length) + 11.8 * (syl / ws.length) - 15.59;
  return { grade: Math.round(grade * 10) / 10, sentences: sents.length, words: ws.length };
}

export function sentenceVariation(text: string): number {
  const lens = text.split(/(?<=[.!?])\s+/).map((s) => s.trim().split(/\s+/).filter(Boolean).length).filter((n) => n >= 2);
  if (lens.length < 5) return NaN;
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  return Math.round((sd / mean) * 100) / 100;
}

export function slopDensity(text: string): { per1k: number; hits: string[] } {
  const ws = text.split(/\s+/).filter(Boolean).length || 1;
  const hits = (text.match(SLOP_WORDS) ?? []).map((h) => h.toLowerCase());
  // Punctuation is a style choice on a third-party site, not a copy defect, so em dashes are not counted here.
  return { per1k: Math.round((hits.length / ws) * 1000 * 10) / 10, hits: [...new Set(hits)].slice(0, 10) };
}

const BOOKING_OR_CTA = /\b(book|get|start|schedule|talk|call|contact|apply|download|try|request|claim|join|see|show me|send me)\b/i;
const THIRD_PARTY = /linkedin\.com\/(in|company)\/|g\.page\/|google\.com\/maps|goo\.gl\/maps|search\.google\.com\/local\/reviews|trustpilot\.com|clutch\.co|g2\.com|capterra\.com|productreview\.com\.au|yelp\.com|facebook\.com\/[^/]+\/reviews|birdeye\.com|reviews\.io|feefo\.com/i;

export function runMessageMeasured(crawl: CrawlResult, w: AssessmentWindows): Finding[] {
  const f: Finding[] = [];
  const home = crawl.home!;
  const heroOpening = `${w.hero}\n${w.opening}`;

  // tm-04 you/we ratio
  const you = (heroOpening.match(/\b(you|your|you're|yourself|you've|you'll)\b/gi) ?? []).length;
  // Company voice: we/our/us plus the business name. "I" and "my" are excluded:
  // "my" is usually the visitor's voice in CTAs, and "I" is a founder speaking.
  const brand = home.meta.title.split(/[—|:-]/)[0].trim();
  const we = (heroOpening.match(/\b(we|our|ours|us|we're|we've)\b/gi) ?? []).length + (brand && brand.length > 2 && heroOpening.includes(brand) ? 1 : 0);
  const ratio = we === 0 ? (you > 0 ? 9 : 0) : Math.round((you / we) * 100) / 100;
  f.push(finding(3, "tm-04", ratio >= 1.5 ? "pass" : ratio >= 0.75 ? "partial" : "fail", 10, `Hero and opening: ${you} second-person vs ${we} first-person references (ratio ${ratio}).`));

  // tm-06 buying-stage questions
  const text = crawl.pages.map((p) => p.text).join("\n");
  const qs = [
    { k: "price", re: /\b(pric(e|ing)|cost|fee|investment|from \$|per month|scoped|quote)\b/i },
    { k: "time or effort", re: /\b(takes?|minutes|hours|weeks|no (call|onboarding|setup)|hands[- ]off|we handle|done for you|your time)\b/i },
    { k: "fit", re: /\b(for (business|service|owners|advisers|advisors|firms|practices)|who (this|it) is (for|not for)|if you|works? for|right for)\b/i },
    { k: "next step", re: /\b(what happens next|next step|how it works|get started|the process|step 1|first,? (we|you))\b/i },
  ];
  const answered = qs.filter((q) => q.re.test(text)).map((q) => q.k);
  f.push(finding(3, "tm-06", answered.length >= 3 ? "pass" : answered.length >= 1 ? "partial" : "fail", 10, `Buying-stage questions addressed somewhere on crawled pages: ${answered.join(", ") || "none"}.`));

  // tm-07 audience pages or sections
  const audiencePaths = [...crawl.sitemap.urls.map((u) => u.loc), ...crawl.pages.flatMap((p) => p.links.filter((l) => l.internal).map((l) => l.href))].filter((u) => /\/(for-|industries|industry|who-we-help|sectors|clients|solutions-for|audiences?)\b/i.test(u));
  const audienceHeadings = crawl.pages.flatMap((p) => p.headings.filter((h) => /who (this|it) is for|built for|designed for|who we (help|work with)|is this for you/i.test(h.text)));
  if (audiencePaths.length) f.push(finding(3, "tm-07", "pass", 10, `Audience-specific paths: ${[...new Set(audiencePaths.map(pathOf))].slice(0, 3).join(", ")}.`));
  else if (audienceHeadings.length) f.push(finding(3, "tm-07", "pass", 10, `Audience section heading: "${audienceHeadings[0].text}".`));
  else f.push(finding(3, "tm-07", crawl.pages.some((p) => /\b(for|built for) [a-z]+ (owners|advisers|advisors|firms|practices|businesses)/i.test(p.text)) ? "partial" : "fail", 10, "No audience-specific page or section found; audience mentioned inside general copy at most."));

  // of-05 one primary next step
  // Navigation labels are not CTA wordings; a "Contact" menu item next to "Book a call" is not a second offer.
  const NAV_LABEL = /^(contact( us)?|about( us| me)?|home|menu|log ?in|sign ?in|blog|products?|services?)$/i;
  const heroCtas = [...new Set(home.links.filter((l) => l.internal && BOOKING_OR_CTA.test(l.text) && l.text.length <= 60 && !NAV_LABEL.test(l.text.trim())).slice(0, 6).map((l) => l.text.toLowerCase().trim()))];
  f.push(finding(1, "of-05", heroCtas.length === 0 ? "fail" : heroCtas.length <= 2 ? "pass" : heroCtas.length === 3 ? "partial" : "fail", 10, heroCtas.length ? `${heroCtas.length} distinct CTA wording(s) in the first six CTA links: ${heroCtas.map((c) => `"${c}"`).join(", ")}.` : "No call-to-action link text found on the homepage."));

  // cq-06 reading grade, cq-07 variety, cq-08 slop, over opening + first 400 words of home
  const sample = `${w.opening}\n${w.pages[0]?.opening ?? ""}`;
  const fk = fleschKincaid(sample);
  if (isNaN(fk.grade)) f.push(na(2, "cq-06", 8, "Not enough prose on the homepage to measure readability."));
  else f.push(finding(2, "cq-06", fk.grade >= 5 && fk.grade <= 9 ? "pass" : (fk.grade > 9 && fk.grade <= 12) || (fk.grade >= 4 && fk.grade < 5) ? "partial" : "fail", 8, `Flesch-Kincaid grade ${fk.grade} over ${fk.words} words.`));
  const cv = sentenceVariation(sample);
  if (isNaN(cv)) f.push(na(2, "cq-07", 5, "Not enough sentences to measure variety."));
  else f.push(finding(2, "cq-07", cv >= 0.45 ? "pass" : cv >= 0.3 ? "partial" : "fail", 5, `Sentence-length variation ${cv} (coefficient of variation).`));
  const slop = slopDensity(sample);
  f.push(finding(2, "cq-08", slop.per1k < 2 ? "pass" : slop.per1k <= 5 ? "partial" : "fail", 5, slop.hits.length ? `${slop.per1k} filler or AI-tell terms per 1,000 words: ${slop.hits.join(", ")}.` : "No filler or AI-tell vocabulary in the sample."));

  // tr-06 contactable business
  const allText = crawl.pages.map((p) => p.text).join("\n");
  const signals = [
    /\b\d{1,5} [A-Z][a-z]+ (Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Place|Pl|Court|Ct)\b|\b(Suite|Level|Unit) \d+/i.test(allText) || crawl.pages.some((p) => p.jsonLd.some((b) => /PostalAddress/.test(b.raw))) ? "address" : "",
    crawl.pages.some((p) => p.telLinks.length) || /\(\d{3}\) \d{3}-\d{4}|\+\d{1,3} ?\d/.test(allText) ? "phone" : "",
    crawl.pages.some((p) => p.links.some((l) => /privacy/i.test(l.href) || /privacy/i.test(l.text))) ? "privacy policy" : "",
    crawl.pages.some((p) => p.links.some((l) => /terms/i.test(l.href) || /terms/i.test(l.text))) ? "terms" : "",
    /\b(ABN|ACN)\s*:?\s*\d{2}|company (number|no\.?)\s*:?\s*\d{5,}|\bEIN\b|\bLLC\b|\bPty Ltd\b|\bLtd\b|\bInc\.?\b/i.test(allText) ? "business identifier" : "",
  ].filter(Boolean);
  f.push(finding(4, "tr-06", signals.length >= 3 ? "pass" : signals.length >= 1 ? "partial" : "fail", 10, signals.length ? `Business signals present: ${signals.join(", ")}.` : "No address, phone, policy pages or business identifier found."));

  // tr-07 third-party proof
  const ext = [...new Set(crawl.pages.flatMap((p) => p.externalLinks.map((l) => l.href)).filter((u) => THIRD_PARTY.test(u)).map((u) => new URL(u).hostname.replace(/^www\./, "")))];
  const sameAs = crawl.pages.flatMap((p) => (p.jsonLd.map((b) => b.raw).join(" ").match(/"sameAs":\s*\[([^\]]*)\]/)?.[1] ?? "").split(",")).filter((s) => THIRD_PARTY.test(s)).length;
  const total = ext.length + (sameAs && !ext.length ? 1 : 0);
  f.push(finding(4, "tr-07", total >= 2 ? "pass" : total === 1 ? "partial" : "fail", 10, ext.length ? `Third-party profiles linked: ${ext.join(", ")}.` : sameAs ? "Third-party profile in schema sameAs only; not linked visibly." : "No links to reviews or profiles hosted elsewhere."));

  void commercialPages; void pct;
  return f;
}
