// Dimension 12, Performance. PSI lab + CrUX field data, mobile first.

import type { ExtractorResult, Finding } from "../types";
import { finding, gradeLow, na, type ExtractorContext } from "./common";

export async function runPerformance(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { psi } = ctx;
  const f: Finding[] = [];
  if (!psi) {
    for (const [id, w] of [["perf-01", 25], ["perf-02", 20], ["perf-03", 15], ["perf-05", 15], ["perf-06", 10], ["perf-07", 5]] as [string, number][]) f.push(na(12, id, w, "PageSpeed Insights did not run (no API key or the call failed)."));
    f.push(na(12, "perf-04", 10, "Server response time requires the PageSpeed run."));
    return { dimension: 12, findings: f, notes: ["Performance could not be measured."] };
  }
  const src = psi.field.source ? `CrUX field data (${psi.field.source})` : "Lighthouse lab (no field data available)";

  const lcp = psi.field.lcpMs ?? psi.lab.lcpMs;
  if (lcp == null) f.push(na(12, "perf-01", 25, "LCP not reported."));
  else f.push(finding(12, "perf-01", gradeLow(lcp, 2500, 4000), 25, `Largest Contentful Paint ${(lcp / 1000).toFixed(1)} s on ${psi.strategy}, ${src}.`));

  if (psi.field.inpMs != null) f.push(finding(12, "perf-02", gradeLow(psi.field.inpMs, 200, 500), 20, `Interaction to Next Paint ${Math.round(psi.field.inpMs)} ms, ${src}.`));
  else if (psi.lab.tbtMs != null) f.push(finding(12, "perf-02", gradeLow(psi.lab.tbtMs, 200, 600), 20, `Total Blocking Time ${Math.round(psi.lab.tbtMs)} ms (lab proxy for interaction delay).`));
  else f.push(na(12, "perf-02", 20, "Interaction metrics not reported."));

  const cls = psi.field.cls ?? psi.lab.clsScore;
  if (cls == null) f.push(na(12, "perf-03", 15, "CLS not reported."));
  else f.push(finding(12, "perf-03", gradeLow(cls, 0.1, 0.25), 15, `Cumulative Layout Shift ${cls.toFixed(2)}, ${src}.`));

  const ttfb = psi.field.ttfbMs ?? psi.lab.ttfbMs;
  if (ttfb == null) f.push(na(12, "perf-04", 10, "TTFB not reported."));
  else f.push(finding(12, "perf-04", gradeLow(ttfb, 800, 1800), 10, `Time to first byte ${Math.round(ttfb)} ms.`));

  if (psi.scores.performance == null) f.push(na(12, "perf-05", 15, "Performance score not reported."));
  else f.push(finding(12, "perf-05", psi.scores.performance >= 90 ? "pass" : psi.scores.performance >= 50 ? "partial" : "fail", 15, `Lighthouse performance score ${psi.scores.performance} on ${psi.strategy}.`));

  if (!psi.thirdParty) f.push(na(12, "perf-06", 10, "Third-party summary not reported."));
  else f.push(finding(12, "perf-06", gradeLow(psi.thirdParty.blockingMs, 250, 1000), 10, `Third-party scripts block the main thread for ${Math.round(psi.thirdParty.blockingMs)} ms (${Math.round(psi.thirdParty.transferBytes / 1024)} KB).`));

  if (psi.lab.domNodes == null) f.push(na(12, "perf-07", 5, "DOM size not reported."));
  else f.push(finding(12, "perf-07", gradeLow(psi.lab.domNodes, 1500, 3000), 5, `${Math.round(psi.lab.domNodes)} DOM nodes.`));

  return { dimension: 12, findings: f };
}
