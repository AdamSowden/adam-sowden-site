// Plain titles for every measured criterion, for the full report. Assessed
// criteria take their titles from assess/rubrics.ts.

import { MESSAGE_RUBRICS } from "./assess/rubrics";

const MEASURED: Record<string, string> = {
  "seo-01": "Pages are indexable", "seo-02": "Sitemap present and referenced", "seo-03": "Self-referencing canonicals", "seo-04": "Unique, well-sized titles", "seo-05": "Unique, well-sized meta descriptions", "seo-06": "One H1 per page", "seo-07": "Image alt text", "seo-08": "Mobile viewport", "seo-09": "Linked pages resolve", "seo-10": "Homepage redirect hygiene", "seo-11": "robots.txt allows crawling",
  "aeo-01": "AI crawlers allowed", "aeo-02": "Structured data present and valid", "aeo-03": "Organization entity schema", "aeo-04": "FAQ schema matches the page", "aeo-05": "Pages open with a direct answer", "aeo-06": "Question-form headings", "aeo-07": "Heading hierarchy", "aeo-08": "Entity clarity", "aeo-09": "Content freshness", "aeo-10": "Article schema on posts",
  "cd-01": "Substantive page count", "cd-02": "Publishing cadence", "cd-03": "Thin pages", "cd-04": "Near-duplicate pages", "cd-05": "Specificity in the copy", "cd-06": "Buyer questions answered",
  "eng-01": "Conversation surface class", "eng-02": "Present on every page",
  "cp-01": "Contact form length", "cp-02": "Ways a ready buyer can act", "cp-03": "Chat that converses", "cp-04": "Booking link", "cp-05": "Tap-to-call phone", "cp-06": "Stated response time", "cp-07": "After-hours path", "cp-08": "Call to action on every page", "cp-09": "Confirmation page", "cp-10": "CTA copy in the visitor's voice",
  "m-01": "Web analytics present", "m-02": "Tags in one container", "m-03": "No duplicate tracking IDs", "m-04": "Conversion events wired", "m-05": "Ad pixels carry conversion events", "m-06": "Behaviour analytics", "m-07": "Consent where required", "m-08": "Phone, email and booking clicks tracked", "m-09": "No dead tags", "m-10": "Tracking weight",
  "ab-platform": "Platform and build", "ab-api": "Content API surface", "ab-fresh": "Sitemap freshness", "ab-schema": "Structured post content", "ab-og": "Per-post share images", "ab-feed": "Feed", "ab-agent": "Conversational agent", "ab-diagnostic": "Diagnostic or questionnaire surface", "ab-response": "Response-time promise", "ab-cadence": "Weekly cadence", "ab-email": "Email capture wired", "ab-jquery": "Legacy jQuery", "ab-plugins": "Plugin load", "ab-bloat": "Page weight", "ab-thirdparty": "Third-party script domains", "ab-csr": "Content in the initial HTML", "ab-template-defects": "Template heading defects",
  "perf-01": "Largest Contentful Paint", "perf-02": "Interaction delay", "perf-03": "Layout shift", "perf-04": "Server response time", "perf-05": "Lighthouse performance", "perf-06": "Third-party blocking", "perf-07": "DOM size",
  "tech-01": "HTTPS and http redirect", "tech-02": "www consolidation", "tech-03": "Security headers", "tech-04": "No mixed content", "tech-05": "Language attribute", "tech-06": "One main landmark", "tech-07": "Internal links resolve", "tech-08": "Accessibility", "tech-09": "Version strings hidden", "tech-10": "Real 404s",
};

const ASSESSED: Record<string, string> = Object.fromEntries(MESSAGE_RUBRICS.flatMap((r) => r.criteria.map((c) => [c.id, c.title])));

export function criterionTitle(id: string): string {
  return ASSESSED[id] ?? MEASURED[id] ?? id;
}
