// Shared types for the Smart Site Analyzer.
//
// Design rules (site-analyser-spec.md §2, §11, §12; Smart-Site-Diagnostic-Framework.md §0):
// - Every Finding carries evidence or it is dropped.
// - Measured findings are deterministic. Assessed findings come from a fixed
//   rubric scored by a model and are labelled as such.
// - A failed fetch is never a finding against the site: it becomes `na` with a reason.
// - Raw HTML lives in memory for the duration of a run and is never persisted.

export type FindingStatus = "pass" | "partial" | "fail" | "na" | "uncertain";
export type FindingLayer = "measured" | "assessed";

/** 1 Offer, 2 Copy, 3 Target market, 4 Trust, 5 SEO, 6 AEO, 7 Content depth,
 *  8 Engagement agent, 9 Conversion path, 10 Measurement, 11 Agentic build,
 *  12 Performance, 13 Technical health. */
export type Dimension = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type Pillar = "message" | "findability" | "conversion" | "foundation";

export const DIMENSION_PILLAR: Record<Dimension, Pillar> = {
  1: "message", 2: "message", 3: "message", 4: "message",
  5: "findability", 6: "findability", 7: "findability",
  8: "conversion", 9: "conversion", 10: "conversion",
  11: "foundation", 12: "foundation", 13: "foundation",
};

export type Finding = {
  dimension: Dimension;
  criterionId: string;
  layer: FindingLayer;
  status: FindingStatus;
  weight: number;
  /** Verbatim from the page or the check output. Required unless status is na. */
  evidence: string;
  /** Key into the standard-fix sentences. */
  fixId: string;
  pages: string[];
  naReason?: string;
};

export type HttpHeaders = Record<string, string>;

export type FetchResult = {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  headers: HttpHeaders;
  contentType: string;
  body: string;
  bodyBytes: number;
  truncated: boolean;
  redirects: string[];
  elapsedMs: number;
};

export type FetchFailure = {
  requestedUrl: string;
  reason:
    | "invalid-url"
    | "blocked-scheme"
    | "blocked-host"
    | "dns-failed"
    | "private-address"
    | "too-many-redirects"
    | "redirect-to-blocked"
    | "timeout"
    | "network"
    | "non-html"
    | "http-error";
  detail: string;
  status?: number;
};

export type Heading = { level: 1 | 2 | 3 | 4 | 5 | 6; text: string };

export type LinkRef = { href: string; text: string; internal: boolean; rel: string };

export type ScriptRef = { src: string; async: boolean; defer: boolean; type: string };

export type FormField = { tag: string; type: string; name: string; required: boolean };

export type FormModel = {
  action: string;
  method: string;
  fields: FormField[];
  fieldCount: number;
  hasEmail: boolean;
  hasPhone: boolean;
};

export type JsonLdBlock = { raw: string; parsed: unknown | null; types: string[]; valid: boolean };

export type PageMeta = {
  title: string;
  description: string;
  robots: string;
  canonical: string;
  viewport: string;
  generator: string;
  lang: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
};

export type PageModel = {
  url: string;
  finalUrl: string;
  status: number;
  headers: HttpHeaders;
  htmlBytes: number;
  /** Raw HTML. In memory only. Never persisted. */
  html: string;
  text: string;
  wordCount: number;
  headings: Heading[];
  h1Count: number;
  links: LinkRef[];
  internalLinks: LinkRef[];
  externalLinks: LinkRef[];
  scripts: ScriptRef[];
  inlineScriptText: string;
  inlineScriptBytes: number;
  stylesheets: string[];
  inlineStyleBytes: number;
  jsonLd: JsonLdBlock[];
  meta: PageMeta;
  forms: FormModel[];
  telLinks: string[];
  mailtoLinks: string[];
  iframes: string[];
  images: { total: number; withAlt: number };
  mainCount: number;
  /** True when the visible text is tiny relative to the script payload. */
  renderedClientSide: boolean;
  fetchedAt: number;
};

/** What the job record keeps about a page. No raw HTML. */
export type PageSummary = Pick<
  PageModel,
  "url" | "finalUrl" | "status" | "wordCount" | "h1Count" | "renderedClientSide"
> & { title: string };

export type RobotsGroup = { agents: string[]; allow: string[]; disallow: string[] };

export type RobotsModel = {
  fetched: boolean;
  status: number | null;
  raw: string;
  groups: RobotsGroup[];
  sitemaps: string[];
};

export type SitemapEntry = { loc: string; lastmod: string | null };

export type SitemapModel = {
  fetched: boolean;
  urls: SitemapEntry[];
  indexes: string[];
  errors: string[];
  truncated: boolean;
};

export type CouldNotCheck = { scope: string; reason: string };

export type CrawlResult = {
  host: string;
  home: PageModel | null;
  homeFailure: FetchFailure | null;
  pages: PageModel[];
  failures: FetchFailure[];
  robots: RobotsModel;
  sitemap: SitemapModel;
  couldNotCheck: CouldNotCheck[];
  elapsedMs: number;
};

export function summarisePage(p: PageModel): PageSummary {
  return {
    url: p.url,
    finalUrl: p.finalUrl,
    status: p.status,
    wordCount: p.wordCount,
    h1Count: p.h1Count,
    renderedClientSide: p.renderedClientSide,
    title: p.meta.title,
  };
}
