// Dimension 11, Agentic build. Rubric 11: fingerprints, base tier, modifiers.
// Scores operability, not framework. External signals only; the report says
// "signals consistent with", never "run by agents".

import type { CrawlResult, ExtractorResult, Finding } from "../types";
import { classifyChat } from "./engagement";
import { contentMonthsActive } from "./content-depth";
import { ARTICLE_PATH, allHtml, allScriptSrcs, daysAgo, finding, hasType, hostOf, jsonLdObjects, parseDate, type ExtractorContext } from "./common";

type Sig = { name: string; re: RegExp };

const BUILDERS: Sig[] = [
  { name: "Elementor", re: /elementor-frontend|data-elementor-type|\/plugins\/elementor\//i },
  { name: "Divi", re: /\bet_pb_|et-core|\/themes\/Divi\//i },
  { name: "WPBakery", re: /\bvc_row\b|js_composer/i },
  { name: "Beaver Builder", re: /\bfl-builder/i },
  { name: "Oxygen", re: /\boxy-[a-z]/i },
  { name: "Bricks", re: /\/themes\/bricks\/|\bbrx-body\b/i },
  { name: "Avada", re: /\bfusion-[a-z]|\/themes\/Avada\//i },
  { name: "JetElements", re: /\/plugins\/jet-[a-z]+\//i },
];
const HOSTED_BUILDERS: Sig[] = [
  { name: "Wix", re: /static\.parastorage\.com|wixstatic\.com/i },
  { name: "Squarespace", re: /static1\.squarespace\.com|Static\.SQUARESPACE_CONTEXT/i },
  { name: "GoDaddy Website Builder", re: /img1\.wsimg\.com\/isteam\/|wsimg\.com\/blobby|godaddy.{0,20}website.?builder/i },
  { name: "Duda", re: /irp\.cdn-website\.com|\bdmRoot\b/i },
  { name: "GoHighLevel site builder", re: /stcdn\.leadconnectorhq\.com|funnels\.msgsndr|hl_[a-z]+-|leadconnectorhq\.com\/funnel/i },
  { name: "ClickFunnels", re: /clickfunnels\.com|\bcf-[a-z]+-section/i },
  { name: "Kajabi", re: /kajabi-cdn|kajabi\.com/i },
  { name: "Weebly", re: /weebly\.com|editmysite\.com/i },
  { name: "Jimdo", re: /jimdo\.com|jimcdn\.com/i },
];
const LEGACY_CMS: Sig[] = [
  { name: "Joomla", re: /\/media\/jui\/|generator["']?\s*content=["']Joomla|\/components\/com_/i },
  { name: "Drupal", re: /Drupal\.settings|\/sites\/default\/files\//i },
];
const FRAMEWORKS: Sig[] = [
  { name: "Next.js", re: /\/_next\/static\/|__NEXT_DATA__|self\.__next_f/i },
  { name: "Nuxt", re: /\/_nuxt\/|__NUXT__/i },
  { name: "Astro", re: /astro-island|data-astro-cid-/i },
  { name: "Remix", re: /__remixContext/i },
  { name: "SvelteKit", re: /\/_app\/immutable\/|data-sveltekit/i },
  { name: "Gatsby", re: /___gatsby|\/page-data\//i },
];
const MODERN_HOSTED: Sig[] = [
  { name: "Webflow", re: /webflow\.js|data-wf-site|assets\.website-files\.com/i },
  { name: "Framer", re: /framerusercontent\.com|data-framer-/i },
  { name: "Shopify", re: /cdn\.shopify\.com|Shopify\.theme/i },
  { name: "HubSpot CMS", re: /hs-sites\.com|hubspotusercontent|hs_cos_wrapper/i },
];
const HEADLESS: Sig[] = [
  { name: "Sanity", re: /cdn\.sanity\.io|apicdn\.sanity\.io/i },
  { name: "Contentful", re: /images\.ctfassets\.net|cdn\.contentful\.com/i },
  { name: "Storyblok", re: /a\.storyblok\.com/i },
  { name: "Prismic", re: /images\.prismic\.io/i },
  { name: "Hygraph", re: /media\.graphassets\.com/i },
  { name: "DatoCMS", re: /datocms-assets\.com/i },
  { name: "Builder.io", re: /cdn\.builder\.io/i },
  { name: "Payload", re: /\/api\/media\/file\//i },
];
const EDGE_HOSTS: { name: string; test: (h: Record<string, string>) => boolean }[] = [
  { name: "Vercel", test: (h) => /vercel/i.test(h.server ?? "") || "x-vercel-id" in h },
  { name: "Netlify", test: (h) => /netlify/i.test(h.server ?? "") || "x-nf-request-id" in h },
  { name: "Cloudflare Pages/Workers", test: (h) => "cf-ray" in h && !h["x-powered-by"] && !/litespeed|apache|nginx/i.test(h.server ?? "") && "cf-cache-status" in h },
  { name: "AWS CloudFront", test: (h) => "x-amz-cf-id" in h },
  { name: "Fastly", test: (h) => /cache-/.test(h["x-served-by"] ?? "") },
  { name: "Fly.io", test: (h) => "fly-request-id" in h },
];

export type StackFingerprint = {
  wordpress: boolean;
  builders: string[];
  hostedBuilders: string[];
  legacyCms: string[];
  frameworks: string[];
  modernHosted: string[];
  headless: string[];
  edgeHost: string | null;
  phpHost: boolean;
  jqueryVersion: string | null;
  pluginCount: number;
  thirdPartyDomains: number;
  inlineCssBytes: number;
  htmlBytes: number;
};

export function fingerprint(crawl: CrawlResult): StackFingerprint {
  const home = crawl.home!;
  const html = allHtml(crawl);
  const srcs = allScriptSrcs(crawl);
  const hay = `${html}\n${srcs.join("\n")}\n${crawl.pages.flatMap((p) => p.stylesheets).join("\n")}`;
  const hit = (list: Sig[]) => list.filter((s) => s.re.test(hay)).map((s) => s.name);
  const wordpress = /\/wp-content\/|\/wp-includes\/|api\.w\.org|wp-emoji/i.test(hay) || /WordPress/i.test(home.meta.generator);
  const plugins = new Set((hay.match(/\/wp-content\/plugins\/([a-z0-9_-]+)\//gi) ?? []).map((m) => m.toLowerCase()));
  const jq = hay.match(/jquery(?:[.-]min)?\.js\?ver=([\d.]+)|jquery-([\d.]+)(?:\.min)?\.js|jQuery v([\d.]+)/i);
  const thirdPartyDomains = new Set(srcs.map(hostOf).filter((h) => h && h.replace(/^www\./, "") !== crawl.host.replace(/^www\./, ""))).size;
  const h = home.headers;
  const edge = EDGE_HOSTS.find((e) => e.test(h))?.name ?? null;
  const phpHost = /php/i.test(h["x-powered-by"] ?? "") || /litespeed|apache/i.test(h.server ?? "") || "x-kinsta-cache" in h || /wpengine/i.test(JSON.stringify(h));
  return {
    wordpress,
    builders: hit(BUILDERS),
    hostedBuilders: hit(HOSTED_BUILDERS),
    legacyCms: hit(LEGACY_CMS),
    frameworks: hit(FRAMEWORKS),
    modernHosted: hit(MODERN_HOSTED),
    headless: hit(HEADLESS),
    edgeHost: edge,
    phpHost,
    jqueryVersion: jq ? (jq[1] || jq[2] || jq[3]) : null,
    pluginCount: plugins.size,
    thirdPartyDomains,
    inlineCssBytes: home.inlineStyleBytes,
    htmlBytes: home.htmlBytes,
  };
}

export async function runAgenticBuild(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl } = ctx;
  const fp = fingerprint(crawl);
  const f: Finding[] = [];
  const home = crawl.home!;

  // Base tier
  let base: 15 | 40 | 65;
  let baseLabel: string;
  const builderLike = fp.builders.length || fp.hostedBuilders.length || fp.legacyCms.length;
  if (builderLike) {
    base = 15;
    baseLabel = `${[...fp.builders, ...fp.hostedBuilders, ...fp.legacyCms].join(", ")}${fp.wordpress && fp.builders.length ? " on WordPress" : ""}`;
  } else if (fp.frameworks.length && fp.headless.length && fp.edgeHost) {
    base = 65;
    baseLabel = `${fp.frameworks.join("/")} with ${fp.headless.join("/")} on ${fp.edgeHost}`;
  } else if (fp.frameworks.length && (fp.headless.length || fp.edgeHost)) {
    base = 65;
    baseLabel = `${fp.frameworks.join("/")}${fp.headless.length ? ` with ${fp.headless.join("/")}` : ""}${fp.edgeHost ? ` on ${fp.edgeHost}` : ""}`;
  } else if (fp.frameworks.length || fp.modernHosted.length || fp.wordpress) {
    base = 40;
    baseLabel = fp.wordpress ? "WordPress without a page builder" : [...fp.frameworks, ...fp.modernHosted].join("/") + (fp.frameworks.length && !fp.headless.length ? " (no content model detected)" : "");
  } else {
    base = 40;
    baseLabel = "Unrecognised stack (scored as a maintainable site)";
  }
  f.push(finding(11, "ab-platform", base === 65 ? "pass" : base === 40 ? "partial" : "fail", base, `Stack: ${baseLabel}. Generator: ${home.meta.generator || "none"}. Server: ${home.headers.server || "unknown"}.`));

  let score: number = base;
  const add = (id: string, pts: number, ok: boolean, evOk: string, evBad: string) => {
    f.push(finding(11, id, ok ? "pass" : "fail", Math.abs(pts), ok ? evOk : evBad));
    if (ok) score += pts;
  };
  const penal = (id: string, pts: number, bad: boolean, evBad: string, evOk: string) => {
    f.push(finding(11, id, bad ? "fail" : "pass", Math.abs(pts), bad ? evBad : evOk));
    if (bad) score -= pts;
  };

  // Operability modifiers
  const api = /\/wp-json\/|\/graphql\b|\/api\//i.test(allHtml(crawl)) || crawl.pages.some((p) => p.links.some((l) => /\/wp-json\/|\/graphql/i.test(l.href)));
  add("ab-api", 8, api, "A content API surface is referenced (wp-json, /api or GraphQL).", "No content API surface detected.");

  const lastmods = crawl.sitemap.urls.map((u) => parseDate(u.lastmod)).filter((d): d is Date => Boolean(d));
  const latest = lastmods.length ? lastmods.reduce((a, b) => (a > b ? a : b)) : null;
  add("ab-fresh", 5, Boolean(latest && daysAgo(latest) <= 30), latest ? `Sitemap last modified ${latest.toISOString().slice(0, 10)}.` : "", latest ? `Sitemap last modified ${latest.toISOString().slice(0, 10)}, more than 30 days ago.` : "No sitemap dates.");

  const articleSchema = crawl.pages.some((p) => jsonLdObjects(p).some((o) => hasType(o, /Article|BlogPosting/) && o.author && (o.datePublished || o.dateModified)));
  add("ab-schema", 5, articleSchema, "Posts carry Article schema with author and dates.", "No structured Article schema with author and dates found on crawled pages.");

  const ogImages = new Set(crawl.pages.map((p) => p.meta.og.image).filter(Boolean));
  add("ab-og", 3, ogImages.size >= 2 && crawl.pages.length >= 3, `${ogImages.size} distinct share images across crawled pages.`, `${ogImages.size} distinct share image(s) across ${crawl.pages.length} pages.`);

  const feed = /rel=["']alternate["'][^>]+type=["']application\/(rss|atom)\+xml/i.test(home.html) || crawl.sitemap.urls.some((u) => /\/feed\/?$/.test(u.loc));
  add("ab-feed", 2, feed, "RSS or Atom feed advertised.", "No feed advertised.");

  const chat = classifyChat(crawl);
  add("ab-agent", 10, chat.cls === 4, `Conversational agent detected (${chat.vendors.find((v) => v.cls === 4)?.name}).`, chat.cls ? `Chat surface is a ${["none", "capture widget", "scripted bot", "live chat"][chat.cls]}, not an agent.` : "No conversational agent.");

  const diag = crawl.pages.some((p) => p.links.some((l) => l.internal && /diagnostic|questionnaire|scorecard|assessment|quiz|calculator|analy[sz]er/i.test(l.href)));
  add("ab-diagnostic", 6, diag, "A diagnostic, questionnaire or assessment surface is linked.", "No diagnostic or questionnaire surface.");

  const promise = /(respond|reply|replies|get back)[^.]{0,40}\b(within|in under|in)\s+(\d+|one|two|a few)\s*(seconds|minutes|hours)|\b24\/7\b|around the clock/i.test(crawl.pages.map((p) => p.text).join(" "));
  add("ab-response", 4, promise, "A response-time promise is stated.", "No response-time promise.");

  const months = contentMonthsActive(crawl.sitemap.urls.filter((u) => ARTICLE_PATH.test(u.loc)).map((u) => u.lastmod));
  const weekly = crawl.sitemap.urls.filter((u) => ARTICLE_PATH.test(u.loc) && parseDate(u.lastmod) && daysAgo(parseDate(u.lastmod)!) <= 365).length >= 40;
  add("ab-cadence", 8, weekly || months >= 11, `Article URLs dated in ${months} of the last 12 months${weekly ? ", 40+ in the year" : ""}.`, `Article URLs dated in ${months} of the last 12 months.`);

  const emailApi = crawl.pages.some((p) => p.forms.some((fm) => fm.hasEmail && fm.method === "post" && !/^mailto:/i.test(fm.action)));
  add("ab-email", 2, emailApi, "Email capture posts to an endpoint.", "No email capture form posting to an endpoint.");

  // Penalties
  const jqMajor = fp.jqueryVersion ? parseInt(fp.jqueryVersion.split(".")[0], 10) : null;
  penal("ab-jquery", 5, jqMajor != null && jqMajor < 3, `jQuery ${fp.jqueryVersion} (legacy).`, fp.jqueryVersion ? `jQuery ${fp.jqueryVersion}.` : "No legacy jQuery detected.");
  if (fp.wordpress) {
    const pts = fp.pluginCount > 20 ? 12 : fp.pluginCount >= 10 ? 5 : 0;
    penal("ab-plugins", pts, pts > 0, `${fp.pluginCount} WordPress plugins referenced in page source.`, `${fp.pluginCount} WordPress plugins referenced.`);
  }
  penal("ab-bloat", 8, fp.inlineCssBytes > 200 * 1024 || fp.htmlBytes > 500 * 1024, `Homepage HTML ${Math.round(fp.htmlBytes / 1024)} KB with ${Math.round(fp.inlineCssBytes / 1024)} KB inline CSS.`, `Homepage HTML ${Math.round(fp.htmlBytes / 1024)} KB, inline CSS ${Math.round(fp.inlineCssBytes / 1024)} KB.`);
  penal("ab-thirdparty", 5, fp.thirdPartyDomains > 15, `${fp.thirdPartyDomains} third-party script domains.`, `${fp.thirdPartyDomains} third-party script domains.`);
  penal("ab-csr", 10, home.renderedClientSide, "Critical content is rendered client-side; the initial HTML carries almost no text.", "Content is present in the initial HTML.");
  const templateDefect = crawl.pages.filter((p) => p.h1Count > 2 || p.headings.some((h) => h.level === 1 && !h.text)).length >= Math.max(2, Math.floor(crawl.pages.length / 2));
  penal("ab-template-defects", 5, templateDefect, "Most crawled pages emit multiple or empty H1 tags, a builder template defect.", "No builder template heading defects.");

  score = Math.max(0, Math.min(100, score));
  return { dimension: 11, findings: f, score, notes: ["External fingerprints only. Signals consistent with the tier, not proof of how the site is operated."] };
}
