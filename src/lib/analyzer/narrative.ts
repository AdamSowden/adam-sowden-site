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

export const NARRATIVE_MODEL = "claude-opus-5-5";

export const NarrativeSchema = z.object({
  opening: z.string().describe("Two or three sentences. What was found overall, said plainly to the owner about their site."),
  pillars: z.object({ message: z.string(), findability: z.string(), conversion: z.string(), foundation: z.string() }).describe("One short paragraph per pillar, each about the findings in that pillar only."),
  fixed: z.string().describe("Two or three sentences describing the site once the three fixes are done. Concrete, no fantasy."),
});
export type Narrative = z.infer<typeof NarrativeSchema>;

export type NarrativeCaller = (system: string, user: string) => Promise<Narrative>;

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

export async function writeNarrative(card: ScoreCard, host: string, findings: Finding[], caller?: NarrativeCaller): Promise<{ narrative: Narrative; source: "model" | "fallback" }> {
  const fallback = fallbackNarrative(card, host);
  try {
    const { system, user } = buildPrompts(card, host, findings);
    const raw = await (caller ?? makeNarrativeCaller())(system, user);
    const cleaned: Narrative = {
      opening: stripDashes(raw.opening),
      fixed: stripDashes(raw.fixed),
      pillars: Object.fromEntries(PILLARS.map((p) => [p, stripDashes(raw.pillars[p] ?? "")])) as Narrative["pillars"],
    };
    if (!narrativeNumbersOk(cleaned, findings, `${card.band} ${card.headline?.statement ?? ""}`)) return { narrative: fallback, source: "fallback" };
    if (!cleaned.opening || PILLARS.some((p) => !cleaned.pillars[p])) return { narrative: fallback, source: "fallback" };
    return { narrative: cleaned, source: "model" };
  } catch {
    return { narrative: fallback, source: "fallback" };
  }
}
