// Connective prose for the full report, written by the model from findings
// that are already final (site-analyser-spec.md §11: "writing the narrative
// from fixed findings, and nowhere else"). Framed by the five jobs (report
// decision, 15 Oct 2026): a diagnosis, one paragraph per job, and what the
// site looks like fixed. Guarded: no number may appear that is not in the
// findings; every section must pass the anti-slop scan; on any failure the
// report uses the deterministic fallback text.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { BRAND_VOICE_RULES } from "../brand-voice";
import type { ScoreCard } from "./scoring";
import { bandLabelFor, bandMeaningFor, bandSentence } from "./scoring";
import type { Finding } from "./types";
import { JOBS, JOB_LABEL, JOB_QUESTION, groupOf, type Job } from "./jobs";
import { scanForSlop, type SlopFinding } from "./slop-scan";

export const NARRATIVE_MODEL = "claude-opus-5-5";

const JobsSchema = z.object({
  attract: z.string(),
  explain: z.string(),
  engage: z.string(),
  qualify: z.string(),
  learn: z.string(),
});

export const NarrativeSchema = z.object({
  diagnosis: z.string().describe("Two or three sentences to the owner about what the site does and does not do for the business. Plain, no numbers unless they are in the findings."),
  jobs: JobsSchema.describe("One short paragraph per job, two to four sentences, about that job's findings only. One short verbatim quote from the site where it carries the point."),
  fixed: z.string().describe("Two or three sentences describing the site once the three moves are made. Concrete, no fantasy, no claims that the site learns or improves itself."),
});
export type Narrative = z.infer<typeof NarrativeSchema>;

export type NarrativeCaller = (system: string, user: string) => Promise<Narrative>;

export type NarrativeOutcome = {
  narrative: Narrative;
  source: "model" | "fallback";
  slop: { firstPassErrors: SlopFinding[]; regenerated: boolean; finalErrors: SlopFinding[]; warnings: SlopFinding[] };
};

export function narrativeText(n: Narrative): string {
  return [n.diagnosis, ...JOBS.map((j) => n.jobs[j] ?? ""), n.fixed].join("\n");
}

export function fallbackNarrative(card: ScoreCard, host: string): Narrative {
  const jobText = (j: Job) => {
    const js = card.jobs.find((x) => x.job === j);
    if (!js || !js.measured) return `The ${JOB_LABEL[j].toLowerCase()} checks could not run on this site.`;
    const c = js.counts;
    return `${c.pass} checks passed, ${c.partial + c.uncertain} were partial and ${c.fail} failed. Each one is listed with its evidence in the appendix.`;
  };
  return {
    diagnosis: `${bandSentence(host, card.band, card.fixes.length > 0)} ${bandMeaningFor(card.band, card.fixes.length > 0)} ${card.headline ? card.headline.consequence : ""}`.trim(),
    jobs: { attract: jobText("attract"), explain: jobText("explain"), engage: jobText("engage"), qualify: jobText("qualify"), learn: jobText("learn") },
    fixed: card.fixes.length ? `With the three moves made, the site answers the checks it currently fails: ${card.fixes.map((f) => f.fix.replace(/\.$/, "").toLowerCase()).join(". ")}.` : "Nothing failed on the checks that ran.",
  };
}

function numbersIn(s: string): string[] {
  return (s.match(/\d[\d,.]*%?/g) ?? []).map((n) => n.replace(/[,.]$/, ""));
}

/** Any number in the narrative must appear somewhere in the findings or the card. */
export function narrativeNumbersOk(n: Narrative, findings: Finding[], extra = ""): boolean {
  const allowed = new Set([...numbersIn(findings.map((f) => f.evidence + " " + (f.note ?? "")).join(" ")), ...numbersIn(extra)]);
  return numbersIn(narrativeText(n)).every((x) => allowed.has(x) || /^[1-3]$/.test(x));
}

export function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ", ").replace(/ -- /g, ", ");
}

function buildPrompts(card: ScoreCard, host: string, findings: Finding[]): { system: string; user: string } {
  const system = [
    "You are Adam, writing the connective prose of a report on a prospect's website, to its owner. You are not scoring anything; the findings are final and listed below, grouped under the five jobs a website can do: Attract, Explain, Engage, Qualify and respond, Learn.",
    "Rules:",
    "- Write in the first person as Adam, to the owner as 'you'. Findings are about the site, never about the owner. Never gleeful about a fault, never condescending.",
    "- The diagnosis says what the site does and does not do for the business, in two or three sentences. It names the biggest gap once. No lists.",
    "- Each job paragraph stays inside that job's findings. Two to four sentences. Say what was seen, then what it means for a visitor or for the owner. Where a verbatim quote from the site carries the point, use one, short, in double quotes.",
    "- 'Learn' is about what the owner can see: visits, enquiries, which pages produce them. Never claim the site learns, improves or optimises itself.",
    "- Foundation findings (platform, speed, technical health) are not a job. Mention them in the diagnosis in one sentence only if told the foundation is weak. Otherwise leave them out.",
    "- State a problem once, then its cost, then move on. Do not repeat a threat.",
    "- Use only numbers that appear in the findings. Do not invent, estimate or round.",
    "- No jargon without its consequence attached. Nobody outside this industry knows what a canonical tag is.",
    "- Plain, direct, spoken. Short sentences mixed with longer ones. Contractions are fine.",
    "- Never use an em dash or a semicolon. Use a comma, a full stop or a colon.",
    "- Never name a client, a competitor, or a person.",
    "- House style, enforced by a scanner after you write: no em dashes or semicolons; no filler qualifiers (genuinely, honestly, actually, really, truly); no personified adverbs (quietly, seamlessly, effortlessly, silently); no AI-tell words (delve, tapestry, multifaceted, resonate, embark, foster, illuminate, paramount, pivotal, holistic, testament, meticulous, intricate, furthermore, moreover, leverage); no 'most people'; no 'here's the thing', 'the truth is', 'at the end of the day', 'let that sink in', 'sound familiar', 'it's worth noting', 'in today's world', 'more than ever', 'needless to say', 'in essence', 'in conclusion', 'in summary'. Avoid robust, comprehensive, nuanced, journey, navigate, unlock, empower, transform, elevate, cutting-edge.",
    BRAND_VOICE_RULES,
  ].join("\n");
  const foundation = card.jobs.find((j) => j.job === "foundation");
  const foundationWeak = foundation?.score !== null && foundation !== undefined && (foundation.score as number) < 40;
  const line = (f: Finding) => `${f.criterionId} ${f.status.toUpperCase()}: ${f.evidence}${f.note ? ` (${f.note})` : ""}`;
  const sections = JOBS.map((j) => {
    const js = card.jobs.find((x) => x.job === j)!;
    const fs = findings.filter((f) => f.status !== "na" && groupOf(f) === j);
    return [`## ${JOB_LABEL[j]} (${js.verdict}). ${JOB_QUESTION[j]}`, ...(fs.length ? fs.map(line) : ["No checks could run for this job."])].join("\n");
  });
  const foundationLines = findings.filter((f) => f.status !== "na" && groupOf(f) === "foundation").map(line);
  const user = [
    `Site: ${host}. Verdict shown as the title: "${bandSentence(host, card.band, card.fixes.length > 0)}" ${bandMeaningFor(card.band, card.fixes.length > 0)}`,
    card.headline ? `Biggest gap: ${card.headline.statement} Consequence: ${card.headline.consequence}` : "No headline finding: nothing failed.",
    `The three moves, in order: ${card.fixes.map((f, i) => `${i + 1}. [${JOB_LABEL[f.job]}] ${f.fix}`).join(" ")}`,
    "",
    ...sections,
    "",
    `## Foundation (not a job; ${foundationWeak ? "WEAK, mention in one sentence of the diagnosis" : "do not mention"})`,
    ...(foundationLines.length ? foundationLines : ["No foundation checks ran."]),
  ].join("\n");
  return { system, user };
}

export function makeNarrativeCaller(client = new Anthropic()): NarrativeCaller {
  return async (system, user) => {
    const res = await client.messages.parse({
      model: NARRATIVE_MODEL,
      max_tokens: 3000,
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
    diagnosis: stripDashes(raw.diagnosis ?? ""),
    fixed: stripDashes(raw.fixed ?? ""),
    jobs: Object.fromEntries(JOBS.map((j) => [j, stripDashes(raw.jobs?.[j] ?? "")])) as Narrative["jobs"],
  };
}

const SELF_IMPROVING = /\b(site|website|system|it)\b[^.]{0,40}\b(learns|improves itself|optimi[sz]es itself|gets smarter)\b/i;

function acceptable(n: Narrative, findings: Finding[], extra: string): boolean {
  return Boolean(n.diagnosis) && Boolean(n.fixed) && JOBS.every((j) => Boolean(n.jobs[j])) && narrativeNumbersOk(n, findings, extra) && !SELF_IMPROVING.test(narrativeText(n));
}

/**
 * Model narrative, gated: numbers must come from the findings, and the prose
 * must pass the anti-slop scan. One regeneration with the violations fed back;
 * if it still fails, the deterministic fallback is used.
 */
export async function writeNarrative(card: ScoreCard, host: string, findings: Finding[], caller?: NarrativeCaller): Promise<NarrativeOutcome> {
  const fallback = fallbackNarrative(card, host);
  const extra = `${bandLabelFor(card.band, card.fixes.length > 0)} ${card.headline?.statement ?? ""}`;
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
