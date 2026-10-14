// Run every measured extractor against a crawl (and optional PSI result).

import type { ExtractorResult } from "../types";
import type { ExtractorContext } from "./common";
import { runSeo } from "./seo";
import { runAeo } from "./aeo";
import { runContentDepth } from "./content-depth";
import { runEngagement } from "./engagement";
import { runConversionPath } from "./conversion-path";
import { runMeasurement } from "./measurement";
import { runAgenticBuild } from "./agentic-build";
import { runPerformance } from "./performance";
import { runTechnical } from "./technical";

export type { ExtractorContext } from "./common";

export const MEASURED_EXTRACTORS = [runSeo, runAeo, runContentDepth, runEngagement, runConversionPath, runMeasurement, runAgenticBuild, runPerformance, runTechnical];

export async function runMeasuredExtractors(ctx: ExtractorContext): Promise<ExtractorResult[]> {
  if (!ctx.crawl.home) return [];
  // Technical makes extra fetches; run it alongside the pure ones.
  return Promise.all(MEASURED_EXTRACTORS.map((run) => run(ctx)));
}
