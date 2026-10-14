// PageSpeed Insights client. One call per strategy. Parsed into the few
// numbers the extractors use. Requires PSI_API_KEY (site-analyser-spec.md §11).

export type PsiStrategy = "mobile" | "desktop";

export type PsiResult = {
  strategy: PsiStrategy;
  fetchedAt: number;
  scores: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null };
  lab: { lcpMs: number | null; clsScore: number | null; tbtMs: number | null; ttfbMs: number | null; fcpMs: number | null; speedIndexMs: number | null; domNodes: number | null };
  field: { lcpMs: number | null; inpMs: number | null; cls: number | null; ttfbMs: number | null; source: "page" | "origin" | null };
  thirdParty: { transferBytes: number; blockingMs: number } | null;
  renderBlockingMs: number | null;
  a11yFailures: string[];
};

export type PsiFailure = { reason: "no-key" | "http-error" | "network" | "parse"; detail: string };

function num(v: unknown): number | null {
  return typeof v === "number" && isFinite(v) ? v : null;
}

export function parsePsi(json: unknown, strategy: PsiStrategy): PsiResult {
  const j = json as Record<string, unknown>;
  const lr = (j.lighthouseResult ?? {}) as Record<string, unknown>;
  const cats = (lr.categories ?? {}) as Record<string, { score?: number }>;
  const audits = (lr.audits ?? {}) as Record<string, { numericValue?: number; score?: number; details?: { summary?: { wastedBytes?: number; wastedMs?: number }; items?: unknown[] }; title?: string }>;
  const score = (k: string) => (cats[k]?.score != null ? Math.round((cats[k].score as number) * 100) : null);

  const le = (j.loadingExperience ?? {}) as Record<string, unknown>;
  const ole = (j.originLoadingExperience ?? {}) as Record<string, unknown>;
  const pick = (src: Record<string, unknown>) => {
    const m = (src.metrics ?? {}) as Record<string, { percentile?: number }>;
    return {
      lcpMs: num(m.LARGEST_CONTENTFUL_PAINT_MS?.percentile),
      inpMs: num(m.INTERACTION_TO_NEXT_PAINT?.percentile),
      cls: m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null ? (m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile as number) / 100 : null,
      ttfbMs: num(m.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile),
    };
  };
  let field: PsiResult["field"] = { lcpMs: null, inpMs: null, cls: null, ttfbMs: null, source: null };
  const pageField = pick(le);
  const originField = pick(ole);
  if (pageField.lcpMs != null || pageField.inpMs != null) field = { ...pageField, source: "page" };
  else if (originField.lcpMs != null || originField.inpMs != null) field = { ...originField, source: "origin" };

  const tp = audits["third-party-summary"]?.details?.summary;
  const a11yFailures = Object.entries(audits)
    .filter(([k, a]) => a.score === 0 && /color-contrast|label|link-name|button-name|image-alt|html-has-lang|heading-order|aria-/.test(k))
    .map(([, a]) => a.title ?? "")
    .filter(Boolean)
    .slice(0, 8);

  return {
    strategy,
    fetchedAt: Date.now(),
    scores: { performance: score("performance"), seo: score("seo"), accessibility: score("accessibility"), bestPractices: score("best-practices") },
    lab: {
      lcpMs: num(audits["largest-contentful-paint"]?.numericValue),
      clsScore: num(audits["cumulative-layout-shift"]?.numericValue),
      tbtMs: num(audits["total-blocking-time"]?.numericValue),
      ttfbMs: num(audits["server-response-time"]?.numericValue),
      fcpMs: num(audits["first-contentful-paint"]?.numericValue),
      speedIndexMs: num(audits["speed-index"]?.numericValue),
      domNodes: num(audits["dom-size"]?.numericValue),
    },
    field,
    thirdParty: tp ? { transferBytes: tp.wastedBytes ?? 0, blockingMs: tp.wastedMs ?? 0 } : null,
    renderBlockingMs: num(audits["render-blocking-resources"]?.numericValue),
    a11yFailures,
  };
}

export async function fetchPsi(
  url: string,
  opts: { strategy?: PsiStrategy; apiKey?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<PsiResult | PsiFailure> {
  const strategy = opts.strategy ?? "mobile";
  const apiKey = opts.apiKey ?? process.env.PSI_API_KEY;
  if (!apiKey) return { reason: "no-key", detail: "PSI_API_KEY is not configured." };
  const fetchImpl = opts.fetchImpl ?? fetch;
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) endpoint.searchParams.append("category", c);
  endpoint.searchParams.set("key", apiKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const res = await fetchImpl(endpoint.toString(), { signal: controller.signal });
    if (!res.ok) return { reason: "http-error", detail: `PageSpeed returned HTTP ${res.status}.` };
    const json = await res.json();
    return parsePsi(json, strategy);
  } catch (e) {
    return { reason: "network", detail: (e as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

export function isPsiFailure(r: PsiResult | PsiFailure): r is PsiFailure {
  return (r as PsiFailure).reason !== undefined;
}
