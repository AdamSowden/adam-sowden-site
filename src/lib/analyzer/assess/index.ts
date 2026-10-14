// Assessed layer entry point: dimensions 1–4 (Offer, Copy, Target market, Trust).

import type { CrawlResult, ExtractorResult } from "../types";
import { MESSAGE_RUBRICS } from "./rubrics";
import { buildWindows } from "./windows";
import { runMessageMeasured } from "./measured";
import { assessRubric, makeAnthropicCaller, toResult, type AssessCaller } from "./model";

export { buildWindows, renderWindows } from "./windows";
export { MESSAGE_RUBRICS } from "./rubrics";
export { makeAnthropicCaller, buildSystemPrompt, verifyEvidence, reconcile } from "./model";

export async function runAssessedLayer(crawl: CrawlResult, opts: { caller?: AssessCaller; runs?: number } = {}): Promise<ExtractorResult[]> {
  if (!crawl.home) return [];
  const windows = buildWindows(crawl);
  const measured = runMessageMeasured(crawl, windows);
  const caller = opts.caller ?? makeAnthropicCaller();
  const results = await Promise.all(MESSAGE_RUBRICS.map(async (r) => toResult(r, await assessRubric(r, windows, caller, opts.runs ?? 2), measured)));
  return results;
}
