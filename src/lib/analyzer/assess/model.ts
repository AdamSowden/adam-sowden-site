// Model scoring for the assessed layer. Structured output against a fixed
// schema (no forced tool call; current models reject tool_choice any/tool and
// the temperature parameter). Two runs; disagreement -> "uncertain" and the
// lower status. Evidence must be a verbatim substring of the supplied windows
// or the criterion is downgraded to uncertain.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod/v4";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ExtractorResult, Finding, FindingStatus } from "../types";
import type { Rubric, RubricCriterion } from "./rubrics";
import { renderWindows, type AssessmentWindows } from "./windows";

export const ASSESS_MODEL = "claude-opus-5-5";

const StatusSchema = z.enum(["pass", "partial", "fail", "na"]);
export const AssessmentSchema = z.object({
  criteria: z.array(
    z.object({
      criterionId: z.string(),
      status: StatusSchema,
      evidence: z.string().describe("A verbatim quote from the supplied page text that supports the status. Empty only when status is na."),
      note: z.string().describe("One sentence explaining the judgement. No numbers that are not in the evidence."),
    }),
  ),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export type AssessCaller = (system: string, user: string) => Promise<Assessment>;

export function buildSystemPrompt(rubric: Rubric): string {
  const crit = rubric.criteria.filter((c) => c.kind === "assessed");
  return [
    "You score a website against a fixed rubric. You do not write copy, give advice, or infer anything that is not in the supplied text.",
    `Dimension: ${rubric.name}. Question it answers: ${rubric.purpose}`,
    rubric.notScored ? `Out of scope: ${rubric.notScored}` : "",
    "Rules:",
    "- Score every criterion listed below, and only those. Use the criterion ids exactly.",
    "- Status is pass, partial or fail as defined per criterion. Use na only where the criterion says it may not apply.",
    "- evidence must be a verbatim quote copied from the supplied text (20 to 240 characters). If you cannot quote supporting text, the status cannot be pass.",
    "- note is one plain sentence. Do not introduce numbers that are not in the evidence.",
    "- Findings are about the site, never about the owner. Be conservative: when torn between two statuses, choose the lower.",
    "",
    "Criteria:",
    ...crit.map((c) => `${c.id} (${c.title}). PASS: ${c.pass} PARTIAL: ${c.partial} FAIL: ${c.fail}${c.naAllowed ? " NA allowed when the criterion does not apply." : ""}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function makeAnthropicCaller(client = new Anthropic()): AssessCaller {
  return async (system, user) => {
    const res = await client.messages.parse({
      model: ASSESS_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
      // SDK 0.88's helper is typed against zod v3 but converts with zod v4 at
      // runtime, so a v4 schema is required and the type must be bridged.
      output_config: { format: zodOutputFormat(AssessmentSchema as unknown as Parameters<typeof zodOutputFormat>[0]), effort: "low" },
    });
    if (res.stop_reason === "refusal") throw new Error("Assessment refused by the model.");
    if (!res.parsed_output) throw new Error("Assessment output could not be parsed.");
    return res.parsed_output;
  };
}

function norm(s: string): string {
  return s.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();
}

export function verifyEvidence(evidence: string, corpus: string): boolean {
  const e = norm(evidence);
  if (e.length < 12) return false;
  return norm(corpus).includes(e);
}

const RANK: Record<FindingStatus, number> = { fail: 0, uncertain: 1, partial: 2, pass: 3, na: 4 };

export function reconcile(a: Assessment, b: Assessment, rubric: Rubric, corpus: string): Finding[] {
  const out: Finding[] = [];
  for (const c of rubric.criteria.filter((x) => x.kind === "assessed")) {
    const ra = a.criteria.find((x) => x.criterionId === c.id);
    const rb = b.criteria.find((x) => x.criterionId === c.id);
    out.push(reconcileOne(c, rubric.dimension, ra, rb, corpus));
  }
  return out;
}

function reconcileOne(c: RubricCriterion, dimension: Rubric["dimension"], ra: Assessment["criteria"][number] | undefined, rb: Assessment["criteria"][number] | undefined, corpus: string): Finding {
  const base = { dimension, criterionId: c.id, layer: "assessed" as const, weight: c.weight, fixId: c.id, pages: [] as string[] };
  if (!ra && !rb) return { ...base, status: "uncertain", evidence: "The model did not return this criterion." };
  const runs = [ra, rb].filter((x): x is NonNullable<typeof x> => Boolean(x));
  // na handling: both na and allowed -> na; otherwise treat na as uncertain.
  if (runs.every((r) => r.status === "na")) {
    if (c.naAllowed) return { ...base, status: "na", evidence: "", naReason: runs[0].note || "Not applicable." };
    return { ...base, status: "uncertain", evidence: runs[0].note || "Returned not applicable where it is not allowed." };
  }
  const graded = runs.map((r) => ({ ...r, status: r.status === "na" ? ("uncertain" as FindingStatus) : (r.status as FindingStatus) }));
  // Evidence verification: a pass or partial without verbatim evidence is downgraded.
  const verified = graded.map((r) => (r.status === "fail" || verifyEvidence(r.evidence, corpus) ? r : { ...r, status: "uncertain" as FindingStatus, note: `${r.note} (evidence could not be verified verbatim)` }));
  if (verified.length === 1) {
    const r = verified[0];
    return { ...base, status: r.status === "uncertain" ? "uncertain" : r.status, evidence: r.evidence || r.note, note: r.note };
  }
  const [x, y] = verified;
  const lower = RANK[x.status] <= RANK[y.status] ? x : y;
  if (x.status === y.status) return { ...base, status: x.status, evidence: (x.evidence || x.note).slice(0, 600), note: x.note };
  return { ...base, status: "uncertain", evidence: `${lower.evidence || lower.note} (runs disagreed: ${x.status} vs ${y.status}; lower taken)`.slice(0, 600), note: lower.note };
}

export async function assessRubric(rubric: Rubric, windows: AssessmentWindows, caller: AssessCaller, runs = 2): Promise<Finding[]> {
  const system = buildSystemPrompt(rubric);
  const user = `Score the site below against the criteria.\n\n${renderWindows(windows)}`;
  const results = await Promise.all(Array.from({ length: runs }, () => caller(system, user)));
  if (runs === 1) return reconcile(results[0], results[0], rubric, windows.corpus);
  return reconcile(results[0], results[1], rubric, windows.corpus);
}

export function toResult(rubric: Rubric, assessed: Finding[], measured: Finding[]): ExtractorResult {
  const mine = measured.filter((f) => f.dimension === rubric.dimension);
  return { dimension: rubric.dimension, findings: [...assessed, ...mine].sort((a, b) => a.criterionId.localeCompare(b.criterionId)), notes: ["Assessed against the standard: model-scored criteria carry verbatim evidence and were run twice."] };
}
