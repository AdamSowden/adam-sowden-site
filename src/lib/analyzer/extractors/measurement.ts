// Dimension 10, Measurement and tracking. Rubric 10.

import type { ExtractorResult, Finding } from "../types";
import { allInline, allScriptSrcs, finding, hostOf, na, type ExtractorContext } from "./common";

type Sig = { key: string; label: string; re: RegExp; group: "analytics" | "legacy" | "tagmgr" | "ads" | "behaviour" | "product" | "crm" | "consent" | "dead" };

const SIGNALS: Sig[] = [
  { key: "ga4", label: "GA4", re: /gtag\/js\?id=G-[A-Z0-9]+|gtag\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+/i, group: "analytics" },
  { key: "plausible", label: "Plausible", re: /plausible\.io\/js/i, group: "analytics" },
  { key: "fathom", label: "Fathom", re: /cdn\.usefathom\.com/i, group: "analytics" },
  { key: "umami", label: "Umami", re: /umami(\.is)?\/script\.js|data-website-id/i, group: "analytics" },
  { key: "matomo", label: "Matomo", re: /matomo\.js|piwik\.js/i, group: "analytics" },
  { key: "vercel", label: "Vercel Analytics", re: /\/_vercel\/insights/i, group: "analytics" },
  { key: "cfanalytics", label: "Cloudflare Web Analytics", re: /cloudflareinsights\.com\/beacon/i, group: "analytics" },
  { key: "ua", label: "Universal Analytics (retired)", re: /\bUA-\d{4,10}-\d{1,3}\b|google-analytics\.com\/analytics\.js|ga\(\s*['"]create['"]/i, group: "legacy" },
  { key: "gtm", label: "Google Tag Manager", re: /googletagmanager\.com\/gtm\.js\?id=GTM-|GTM-[A-Z0-9]{4,10}/i, group: "tagmgr" },
  { key: "segment", label: "Segment", re: /cdn\.segment\.com\/analytics\.js/i, group: "tagmgr" },
  { key: "tealium", label: "Tealium", re: /tags\.tiqcdn\.com/i, group: "tagmgr" },
  { key: "meta", label: "Meta pixel", re: /connect\.facebook\.net\/[a-z_]+\/fbevents\.js|fbq\(\s*['"]init['"]/i, group: "ads" },
  { key: "gads", label: "Google Ads", re: /\bAW-\d{6,12}\b|conversion_async\.js/i, group: "ads" },
  { key: "linkedin", label: "LinkedIn Insight", re: /_linkedin_partner_id|snap\.licdn\.com/i, group: "ads" },
  { key: "x", label: "X pixel", re: /static\.ads-twitter\.com\/uwt\.js|\btwq\(/i, group: "ads" },
  { key: "tiktok", label: "TikTok pixel", re: /analytics\.tiktok\.com|\bttq\./i, group: "ads" },
  { key: "pinterest", label: "Pinterest tag", re: /s\.pinimg\.com\/ct\/core\.js|\bpintrk\(/i, group: "ads" },
  { key: "bing", label: "Microsoft Ads UET", re: /bat\.bing\.com\/bat\.js|\buetq\b/i, group: "ads" },
  { key: "clarity", label: "Microsoft Clarity", re: /clarity\.ms\/tag|\bclarity\(\s*['"]set/i, group: "behaviour" },
  { key: "hotjar", label: "Hotjar", re: /static\.hotjar\.com|\bhj\(/i, group: "behaviour" },
  { key: "mouseflow", label: "Mouseflow", re: /cdn\.mouseflow\.com/i, group: "behaviour" },
  { key: "fullstory", label: "FullStory", re: /fullstory\.com\/s\/fs\.js/i, group: "behaviour" },
  { key: "logrocket", label: "LogRocket", re: /cdn\.logrocket\.io/i, group: "behaviour" },
  { key: "posthog", label: "PostHog", re: /posthog\.com\/static|posthog\.init/i, group: "product" },
  { key: "mixpanel", label: "Mixpanel", re: /cdn\.mxpnl\.com|mixpanel\.init/i, group: "product" },
  { key: "amplitude", label: "Amplitude", re: /cdn\.amplitude\.com/i, group: "product" },
  { key: "heap", label: "Heap", re: /heapanalytics\.com/i, group: "product" },
  { key: "hubspot", label: "HubSpot tracking", re: /js\.hs-scripts\.com|js\.hs-analytics\.net/i, group: "crm" },
  { key: "ghl", label: "GoHighLevel tracking", re: /leadconnectorhq\.com\/.*(tracking|pixel)|msgsndr\.com\/js\/(tracking|pixel)/i, group: "crm" },
  { key: "activecampaign", label: "ActiveCampaign", re: /trackcmp\.net/i, group: "crm" },
  { key: "klaviyo", label: "Klaviyo", re: /static\.klaviyo\.com/i, group: "crm" },
  { key: "mailchimp", label: "Mailchimp", re: /chimpstatic\.com/i, group: "crm" },
  { key: "cookiebot", label: "Cookiebot", re: /consent\.cookiebot\.com/i, group: "consent" },
  { key: "onetrust", label: "OneTrust", re: /cdn\.cookielaw\.org|otSDKStub/i, group: "consent" },
  { key: "termly", label: "Termly", re: /app\.termly\.io/i, group: "consent" },
  { key: "cookieyes", label: "CookieYes", re: /cdn-cookieyes\.com/i, group: "consent" },
  { key: "osano", label: "Osano", re: /cmp\.osano\.com/i, group: "consent" },
  { key: "iubenda", label: "Iubenda", re: /cdn\.iubenda\.com/i, group: "consent" },
  { key: "usercentrics", label: "Usercentrics", re: /app\.usercentrics\.eu|usercentrics/i, group: "consent" },
  { key: "complianz", label: "Complianz", re: /complianz/i, group: "consent" },
  { key: "consentmode", label: "Google consent mode", re: /gtag\(\s*['"]consent['"]/i, group: "consent" },
  { key: "optimize", label: "Google Optimize (retired)", re: /optimize\.js\?id=|googleoptimize\.com/i, group: "dead" },
];

const EVENT_RES: { label: string; re: RegExp }[] = [
  { label: "dataLayer event push", re: /dataLayer\.push\(\s*\{[^}]{0,200}['"]?event['"]?\s*:/i },
  { label: "gtag event", re: /gtag\(\s*['"]event['"]\s*,\s*['"](?!page_view)[a-z_]+/i },
  { label: "Meta conversion event", re: /fbq\(\s*['"]track(?:Custom)?['"]\s*,\s*['"](Lead|Schedule|Contact|CompleteRegistration|Purchase|SubmitApplication|StartTrial|InitiateCheckout)/i },
  { label: "LinkedIn conversion", re: /lintrk\(\s*['"]track['"]/i },
  { label: "X conversion", re: /twq\(\s*['"]event['"]/i },
  { label: "TikTok conversion", re: /ttq\.track\(/i },
];

const EU_TLD = /\.(co\.uk|uk|ie|de|fr|nl|es|it|eu|be|at|se|dk|fi|pl|pt|no|ch)$/i;

export function detectSignals(hay: string): Sig[] {
  return SIGNALS.filter((s) => s.re.test(hay));
}

export async function runMeasurement(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl, psi } = ctx;
  const f: Finding[] = [];
  const srcs = allScriptSrcs(crawl).join("\n");
  const inline = allInline(crawl);
  const iframes = crawl.pages.flatMap((p) => p.iframes).join("\n");
  const hay = `${srcs}\n${inline}\n${iframes}`;
  const found = detectSignals(hay);
  const has = (k: string) => found.some((s) => s.key === k);
  const labels = (g: Sig["group"]) => found.filter((s) => s.group === g).map((s) => s.label);

  // m-01 analytics
  const analytics = labels("analytics");
  if (analytics.length) f.push(finding(10, "m-01", "pass", 15, `Web analytics detected: ${analytics.join(", ")}.`));
  else if (has("gtm")) f.push(finding(10, "m-01", "pass", 15, "Google Tag Manager present. Tags inside the container are not visible from outside; GA4 is assumed to be managed there."));
  else if (has("ua") || labels("behaviour").length) f.push(finding(10, "m-01", "partial", 15, `Only ${[...(has("ua") ? ["a retired Universal Analytics tag"] : []), ...labels("behaviour")].join(", ")} found; no current web analytics.`));
  else f.push(finding(10, "m-02".replace("02", "01"), "fail", 15, "No web analytics tag detected on any crawled page."));

  // m-02 one container
  const hardcoded = found.filter((s) => ["analytics", "ads", "behaviour", "product", "crm"].includes(s.group) && s.key !== "vercel" && s.key !== "cfanalytics");
  if (has("gtm") || has("segment") || has("tealium")) {
    const dup = hardcoded.filter((s) => /gtag\/js\?id=G-|fbevents\.js|snap\.licdn|static\.hotjar|clarity\.ms/i.test(srcs) && ["ga4", "meta", "linkedin", "hotjar", "clarity"].includes(s.key));
    if (dup.length) f.push(finding(10, "m-02", "partial", 10, `Tag manager present but these vendors are also loaded directly: ${dup.map((d) => d.label).join(", ")}. Risk of double firing.`));
    else f.push(finding(10, "m-02", "pass", 10, "Tags are routed through a tag manager with no direct duplicates observed."));
  } else if (hardcoded.length === 0) {
    f.push(finding(10, "m-02", "fail", 10, "No tag manager and no vendor tags found."));
  } else if (hardcoded.length <= 4) {
    f.push(finding(10, "m-02", "partial", 10, `No tag manager; ${hardcoded.length} vendor tag(s) hardcoded: ${hardcoded.map((h) => h.label).join(", ")}.`));
  } else {
    f.push(finding(10, "m-02", "fail", 10, `No tag manager and ${hardcoded.length} vendor tags hardcoded: ${hardcoded.map((h) => h.label).join(", ")}.`));
  }

  // m-03 duplicate IDs (per page)
  const dups: string[] = [];
  for (const p of crawl.pages) {
    const ph = `${p.scripts.map((s) => s.src).join("\n")}\n${p.inlineScriptText}`;
    const ga = new Set((ph.match(/\bG-[A-Z0-9]{6,12}\b/g) ?? []));
    const gtm = new Set((ph.match(/\bGTM-[A-Z0-9]{4,10}\b/g) ?? []));
    const fb = (ph.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{8,20})['"]/g) ?? []);
    const fbIds = fb.map((x) => x.match(/(\d{8,20})/)?.[1] ?? "");
    const path = new URL(p.finalUrl).pathname;
    if (ga.size > 1) dups.push(`${path}: ${ga.size} GA4 properties (${[...ga].join(", ")})`);
    if (gtm.size > 1) dups.push(`${path}: ${gtm.size} GTM containers (${[...gtm].join(", ")})`);
    if (fbIds.length > new Set(fbIds).size) dups.push(`${path}: Meta pixel initialised more than once`);
    if (new Set(fbIds).size > 1) dups.push(`${path}: ${new Set(fbIds).size} Meta pixel IDs`);
  }
  if (!dups.length) f.push(finding(10, "m-03", "pass", 15, "One ID per vendor on every crawled page."));
  else f.push(finding(10, "m-03", dups.length === 1 ? "partial" : "fail", 15, dups.join("; ")));

  // m-04 conversion events
  const events = EVENT_RES.filter((e) => e.re.test(inline));
  const thankYou = [...crawl.sitemap.urls.map((u) => u.loc), ...crawl.pages.flatMap((p) => p.links.map((l) => l.href))].find((u) => /thank|confirm|booked|success/i.test(hostOf(u) ? new URL(u).pathname : u));
  if (events.length && thankYou) f.push(finding(10, "m-04", "pass", 25, `Conversion events observed (${events.map((e) => e.label).join(", ")}) and a confirmation page exists (${new URL(thankYou).pathname}).`));
  else if (events.length) f.push(finding(10, "m-04", "partial", 25, `Conversion events observed (${events.map((e) => e.label).join(", ")}) but no confirmation page found.`));
  else if (has("gtm") || has("segment")) f.push({ ...finding(10, "m-04", "uncertain", 25, "No conversion events visible in page code. Events may be configured inside the tag manager, which cannot be observed from outside."), status: "uncertain" });
  else if (thankYou) f.push(finding(10, "m-04", "partial", 25, `A confirmation page exists (${new URL(thankYou).pathname}) but no conversion events were observed.`));
  else f.push(finding(10, "m-04", "fail", 25, "No conversion events and no confirmation page observed."));

  // m-05 ad pixels carry events
  const ads = labels("ads");
  if (!ads.length) f.push(na(10, "m-05", 10, "No ad pixels detected."));
  else {
    const adEvents = EVENT_RES.filter((e) => /Meta|LinkedIn|X |TikTok/.test(e.label) && e.re.test(inline));
    if (adEvents.length) f.push(finding(10, "m-05", "pass", 10, `${ads.join(", ")} present with conversion events (${adEvents.map((e) => e.label).join(", ")}).`));
    else if (has("gtm")) f.push({ ...finding(10, "m-05", "uncertain", 10, `${ads.join(", ")} present; events may be fired via the tag manager and cannot be observed.`), status: "uncertain" });
    else f.push(finding(10, "m-05", "partial", 10, `${ads.join(", ")} present but only PageView observed.`));
  }

  // m-06 behaviour analytics
  const beh = [...labels("behaviour"), ...labels("product")];
  if (beh.length) f.push(finding(10, "m-06", "pass", 5, `Behaviour analytics: ${beh.join(", ")}.`));
  else f.push(finding(10, "m-06", analytics.length || has("gtm") ? "partial" : "fail", 5, "No session-recording or heatmap tool detected."));

  // m-07 consent
  const home = crawl.home;
  const euSignals = Boolean(home && (/^en-gb$/i.test(home.meta.lang) || EU_TLD.test(crawl.host) || /[£€]\s?\d/.test(home.text)));
  const consent = labels("consent");
  if (!euSignals) f.push(na(10, "m-07", 5, "No EU or UK audience signals; prior consent for analytics is not required for AU or US only sites."));
  else if (consent.length) f.push(finding(10, "m-07", "pass", 5, `Consent tooling present: ${consent.join(", ")}.`));
  else f.push(finding(10, "m-07", "fail", 5, "EU/UK audience signals present and no consent platform detected."));

  // m-08 click tracking: not measurable statically in v1
  f.push(na(10, "m-08", 5, "Phone, email and booking click tracking is not measurable from page code in this version."));

  // m-09 dead or legacy tags
  const dead = [...(has("ua") ? ["Universal Analytics property"] : []), ...labels("dead")];
  if (!dead.length) f.push(finding(10, "m-09", "pass", 5, "No retired or dead tags detected."));
  else f.push(finding(10, "m-09", dead.length === 1 ? "partial" : "fail", 5, `Retired tags still loading: ${dead.join(", ")}.`));

  // m-10 tracking weight (from PSI third-party summary)
  if (!psi || psi.thirdParty == null) f.push(na(10, "m-10", 5, "Third-party weight requires the PageSpeed run."));
  else {
    const kb = Math.round(psi.thirdParty.transferBytes / 1024);
    const ms = Math.round(psi.thirdParty.blockingMs);
    const status = kb <= 150 && ms <= 300 ? "pass" : kb <= 400 && ms <= 1000 ? "partial" : "fail";
    f.push(finding(10, "m-10", status, 5, `Third-party scripts: ${kb} KB transferred, ${ms} ms main-thread blocking (PageSpeed).`));
  }

  return { dimension: 10, findings: f };
}
