// Cost of loss, only with the user's own numbers (site-analyser-spec.md §5, §7).
// Every step is shown, the result is a range, rounded down, for the period
// actually modelled (one month), never annualised for shock. Benchmarks are
// mostly B2B research and the report says so.

import type { Finding } from "./types";

export type CostInputs = { enquiries: number; value: number; closeRate: number };

export type CostOfLoss = {
  applies: boolean;
  reason: string;
  period: "per month";
  lowMonthly: number;
  highMonthly: number;
  steps: string[];
  assumptions: string[];
  sources: string[];
};

export const RESPONSE_BENCHMARKS = {
  avgCallbackHours: 42,
  neverCalledBackShare: 0.25,
  sources: [
    "Oldroyd, J. (MIT) and InsideSales.com, Lead Response Management study: contacting a lead within 5 minutes versus 30 minutes raised contact rates roughly 100x and qualification odds roughly 21x versus waiting a day.",
    "Harvard Business Review, The Short Life of Online Sales Leads (2011): across 2,241 US companies the average first response to a web enquiry took 42 hours and about a quarter never responded.",
  ],
};

function roundDown2sf(n: number): number {
  if (n <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.floor(n / p) * p;
}

/**
 * The response gap on the site decides whether the benchmarks apply at all.
 * cp-06 (stated response time), cp-07 (after-hours path), cp-03 (chat that
 * converses). Each failing check widens the share of enquiries modelled as
 * answered late or never.
 */
export function costOfLoss(inputs: CostInputs | null, findings: Finding[]): CostOfLoss | null {
  if (!inputs) return null;
  const f = (id: string) => findings.find((x) => x.criterionId === id)?.status;
  const gaps = [
    f("cp-06") === "fail" ? "no stated response time" : "",
    f("cp-07") === "fail" ? "no after-hours path" : "",
    f("cp-03") === "fail" ? "no chat that answers" : "",
  ].filter(Boolean);
  const base: Pick<CostOfLoss, "period" | "sources" | "assumptions"> = {
    period: "per month",
    sources: RESPONSE_BENCHMARKS.sources,
    assumptions: [
      "The research behind the benchmarks is mostly B2B and US-based. Treat the range as an order of magnitude, not a forecast.",
      "Only your own three numbers are used. No industry averages are substituted.",
      "Figures are rounded down to two significant figures and shown for one month only.",
    ],
  };
  if (!gaps.length) {
    return { ...base, applies: false, reason: "The site states a response time, has an after-hours path and a chat that answers, so the late-response benchmarks were not applied to your numbers.", lowMonthly: 0, highMonthly: 0, steps: [] };
  }
  // Share of enquiries modelled as answered late or never: 10% with one gap,
  // up to the 25% never-called-back benchmark with all three.
  const lowShare = 0.05 * gaps.length;
  const highShare = Math.min(RESPONSE_BENCHMARKS.neverCalledBackShare, 0.1 * gaps.length);
  const c = inputs.closeRate / 100;
  const expectedPerEnquiry = c * inputs.value;
  // Of the late-or-never enquiries, assume between half (low) and all (high)
  // would have closed at the normal rate had they been answered promptly.
  const low = roundDown2sf(inputs.enquiries * lowShare * expectedPerEnquiry * 0.5);
  const high = roundDown2sf(inputs.enquiries * highShare * expectedPerEnquiry * 1.0);
  const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const steps = [
    `Gaps found on the site: ${gaps.join(", ")} (${gaps.length} of 3).`,
    `Enquiries per month, your figure: ${inputs.enquiries}.`,
    `Share modelled as answered late or never: ${Math.round(lowShare * 100)}% to ${Math.round(highShare * 100)}% (one gap starts at 5% to 10%; all three reach the 25% never-called-back benchmark).`,
    `Late-or-never enquiries per month: ${(inputs.enquiries * lowShare).toFixed(1)} to ${(inputs.enquiries * highShare).toFixed(1)}.`,
    `Expected value of a promptly answered enquiry: ${inputs.closeRate}% close rate × $${money(inputs.value)} = $${money(expectedPerEnquiry)}.`,
    `Share of those that would have closed if answered promptly: 50% (low) to 100% (high).`,
    `Range: $${money(low)} to $${money(high)} per month, rounded down.`,
  ];
  return { ...base, applies: true, reason: `Based on ${gaps.length} response gap${gaps.length === 1 ? "" : "s"} found on the site.`, lowMonthly: low, highMonthly: high, steps };
}
