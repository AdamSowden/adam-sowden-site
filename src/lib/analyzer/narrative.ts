// Connective prose for the full report, written by the model from findings
// that are already final (site-analyser-spec.md §11: "writing the narrative
// from fixed findings, and nowhere else"). Guarded: no number may appear in
// the narrative that is not in the findings; on any failure the report uses
// the deterministic fallback text.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { BRAND_VOICE_RULES } from "../brand-voice";
import type { ScoreCard } from "./scoring";
import { PILLAR_LABEL, PILLARS, type Band } from "./scoring";
import type { Finding } from "./types";
import { scanForSlop, type SlopFinding } from "./slop-scan";

export const NARRATIVE_MODEL = "claude-opus-5-5";

export const NarrativeSchema = z.object({
  opening: z.string().describe("Two or three sentences. What was found overall, said plainly to the owner about their site."),
  pillars: z.object({ message: z.string(), findability: z.string(), conversion: z.string(), foundation: z.string() }).describe("One short paragraph per pillar, each about the findings in that pillar only."),
  fixed: z.string().describe("Two or three sentences describing the site once the three fixes are done. Concrete, no fantasy."),
});
export type Narrative = z.infer<typeof NarrativeSchema>;

export type NarrativeCaller = (system: string, user: string) => Promise<Narrative>;

export type NarrativeOutcome = {
  narrative: Narrative;
  source: "model" | "fallback";
  slop: { firstPassErrors: SlopFinding[]; regenerated: boolean; finalErrors: SlopFinding[]; warnings: SlopFinding[] };
};

export function narrativeText(n: Narrative): string {
  return [n.opening, ...PILLARS.map((p) => n.pillars[p] ?? ""), n.fixed].join("\n");
}

const BAND_LINE: Record<Band, string> = {
  Leaking: "Enquiries arrive and are being lost between arriving and being answered.",
  Invisible: "The site works but is not being found, and answer engines cannot read it well.",
  Static: "The site functions and does nothing on its own.",
  Working: "The site is performing. What follows are refinements.",
};

export function fallbackNarrative(card: ScoreCard, host: string): Narrative {
  const pillarText = (p: keyof Narrative["pillars"]) => {
    const dims = card.dimensions.filter((d) => d.pillar === p);
    const measured = dims.filter((d) => d.score !== null);
    if (!measured.length) return `The ${PILLAR_LABEL[p].toLowerCase()} checks could not run on this site.`;
    const fails = measured.reduce((n, d) => n + d.counts.fail, 0);
    const passes = measured.reduce((n, d) => n + d.counts.pass, 0);
    return `${PILLAR_LABEL[p]}: ${passes} checks passed and ${fails} failed across ${measured.map((d) => d.label.toLowerCase()).join(", ")}. The evidence for each is listed below.`;
  };
  return {
    opening: `${host} came out as ${card.band}. ${BAND_LINE[card.band]} ${card.headline ? card.headline.consequence : ""}`.trim(),
    pillars: { message: pillarText("message"), findability: pillarText("findability"), conversion: pillarText("conversion"), foundation: pillarText("foundation") },
    fixed: card.fixes.length ? `With the three fixes done, the site answers the checks it currently fails: ${card.fixes.map((f) => f.fix.replace(/\.$/, "").toLowerCase()).join("; ")}.` : "Nothing failed on the checks that ran.",
  };
}

function numbersIn(s: string): string[] {
  return (s.match(/\d[\d,.]*%?/g) ?? []).map((n) => n.replace(/[,.]$/, ""));
}

/** Any number in the narrative must appear somewhere in the findings or the card. */
export function narrativeNumbersOk(n: Narrative, findings: Finding[], extra = ""): boolean {
  const allowed = new Set([...numbersIn(findings.map((f) => f.evidence + " " + (f.note ?? "")).join(" ")), ...numbersIn(extra)]);
  const text = [n.opening, n.fixed, ...Object.values(n.pillars)].join(" ");
  return numbersIn(text).every((x) => allowed.has(x) || /^[1-3]$/.test(x));
}

export function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ", ").replace(/ -- /g, ", ");
}

function buildPrompts(card: ScoreCard, host: string, findings: Finding[]): { system: string; user: string } {
  const system = [
    "You write the connective prose of a website report for the owner of the site. You are not scoring anything; the findings are final and listed below.",
    "Rules:",
    "- Findings are about the site, never about the owner. Never gleeful about a fault, never condescending.",
    "- State the problem once, then its cost, then move on. Do not repeat a threat.",
    "- Use only numbers that appear in the findings. Do not invent, estimate or round.",
    "- No jargon without its consequence attached. Nobody outside this industry knows what a canonical tag is.",
    "- Plain, direct, spoken. Short sentences mixed with longer ones. Contractions are fine.",
    "- Never use an em dash or a semicolon. Use a comma, a full stop or a colon.",
    "- Never name a client, a competitor, or a person.",
    "- House style, enforced by a scanner after you write: no em dashes or semicolons; no filler qualifiers (genuinely, honestly, actually, really, truly); no personified adverbs (quietly, seamlessly, effortlessly, silently); no AI-tell words (delve, tapestry, multifaceted, resonate, embark, foster, illuminate, paramount, pivotal, holistic, testament, meticulous, intricate, furthermore, moreover, leverage); no 'most people'; no 'here's the thing', 'the truth is', 'at the end of the day', 'let that sink in', 'sound familiar', 'it's worth noting', 'in today's world', 'more than ever', 'needless to say', 'in essence', 'in conclusion', 'in summary'. Avoid robust, comprehensive, nuanced, journey, navigate, unlock, empower, transform, elevate, cutting-edge.",
    BRAND_VOICE_RULES,
  ].join("\n");
  const lines = findings
    .filter((f) => f.status !== "na")
    .map((f) => `[${PILLAR_LABEL[card.dimensions.find((d) => d.dimension === f.dimension)!.pillar]}] ${f.criterionId} ${f.status.toUpperCase()}: ${f.evidence}${f.note ? ` (${f.note})` : ""}`);
  const user = [
    `Site: ${host}. Band: ${card.band}. ${BAND_LINE[card.band]}`,
    card.headline ? `Headline finding: ${card.headline.statement} Consequence: ${card.headline.consequence}` : "No headline finding: nothing failed.",
    `The three fixes, in order: ${card.fixes.map((f, i) => `${i + 1}. ${f.fix}`).join(" ")}`,
    "",
    "Findings:",
    ...lines,
  ].join("\n");
  return { system, user };
}

export function makeNarrativeCaller(client = new Anthropic()): NarrativeCaller {
  return async (system, user) => {
    const res = await client.messages.parse({
      model: NARRATIVE_MODEL,
      max_tokens: 2500,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: zodOutputFormat(NarrativeSchema as unknown as Parameters<typeof zodOutputFormat>[0]), effort: "low" },
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("Narrative not produced.");
    return res.parsed_output as Narrative;
  };
}

function clean(raw: Narrative): Narrative {
  return {
    opening: stripDashes(raw.opening ?? ""),
    fixed: stripDashes(raw.fixed ?? ""),
    pillars: Object.fromEntries(PILLARS.map((p) => [p, stripDashes(raw.pillars?.[p] ?? "")])) as Narrative["pillars"],
  };
}

function acceptable(n: Narrative, findings: Finding[], extra: string): boolean {
  return Boolean(n.opening) && PILLARS.every((p) => Boolean(n.pillars[p])) && narrativeNumbersOk(n, findings, extra);
}

/**
 * Model narrative, gated: numbers must come from the findings, and the prose
 * must pass the anti-slop scan. One regeneration with the violations fed back;
 * if it still fails, the deterministic fallback is used.
 */
export async function writeNarrative(card: ScoreCard, host: string, findings: Finding[], caller?: NarrativeCaller): Promise<NarrativeOutcome> {
  const fallback = fallbackNarrative(card, host);
  const extra = `${card.band} ${card.headline?.statement ?? ""}`;
  const call = caller ?? makeNarrativeCaller();
  const none = { firstPassErrors: [] as SlopFinding[], regenerated: false, finalErrors: [] as SlopFinding[], warnings: [] as SlopFinding[] };
  try {
    const { system, user } = buildPrompts(card, host, findings);
    let n = clean(await call(system, user));
    if (!acceptable(n, findings, extra)) return { narrative: fallback, source: "fallback", slop: none };
    let scan = scanForSlop(narrativeText(n));
    const firstPassErrors = scan.errors;
    let regenerated = false;
    if (scan.errors.length) {
      regenerated = true;
      const violations = scan.errors.map((e) => `"${e.match}": ${e.message}`).join("\n");
      const retryUser = `${user}\n\nYour previous draft was rejected by the house style check for these violations. Rewrite all sections without them. Do not substitute a synonym from the same family (no "quietly", "silently", "seamlessly", no em dashes or semicolons, no filler qualifiers).\n${violations}`;
      n = clean(await call(system, retryUser));
      if (!acceptable(n, findings, extra)) return { narrative: fallback, source: "fallback", slop: { ...none, firstPassErrors, regenerated } };
      scan = scanForSlop(narrativeText(n));
    }
    if (scan.errors.length) return { narrative: fallback, source: "fallback", slop: { firstPassErrors, regenerated, finalErrors: scan.errors, warnings: scan.warnings } };
    return { narrative: n, source: "model", slop: { firstPassErrors, regenerated, finalErrors: [], warnings: scan.warnings } };
  } catch {
    return { narrative: fallback, source: "fallback", slop: none };
  }
}
