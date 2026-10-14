// Dimension 8, Engagement agent. Rubric 08 Part A: detection and classification.

import type { CrawlResult, ExtractorResult, Finding } from "../types";
import { isFetchFailure, safeFetch, type FetchOptions } from "../fetch";
import { finding, na, pct, type ExtractorContext } from "./common";

export type ChatClass = 0 | 1 | 2 | 3 | 4;

type Vendor = { name: string; re: RegExp; cls: ChatClass };

export const CHAT_VENDORS: Vendor[] = [
  { name: "GoHighLevel chat widget", re: /widgets\.leadconnectorhq\.com\/loader\.js|data-chat-widget-id|leadconnectorhq\.com\/chat-widget|chat-widget\.js.*msgsndr/i, cls: 1 },
  { name: "Podium webchat", re: /connect\.podium\.com|podium\.com\/widget/i, cls: 1 },
  { name: "Birdeye webchat", re: /birdeye\.com\/embed|webchat\.birdeye/i, cls: 1 },
  { name: "ManyChat", re: /widget\.manychat\.com/i, cls: 1 },
  { name: "Facebook customer chat", re: /fb-customerchat|customerchat\/sdk/i, cls: 1 },
  { name: "WhatsApp link", re: /wa\.me\/\d|api\.whatsapp\.com\/send/i, cls: 1 },
  { name: "Landbot", re: /landbot\.io/i, cls: 2 },
  { name: "Typebot", re: /typebot\.io/i, cls: 2 },
  { name: "Botpress", re: /cdn\.botpress\.cloud|botpress\.cloud/i, cls: 2 },
  { name: "Voiceflow", re: /cdn\.voiceflow\.com|voiceflow\.com\/widget/i, cls: 2 },
  { name: "HubSpot Conversations", re: /js\.usemessages\.com|HubSpotConversations/i, cls: 2 },
  { name: "Tidio", re: /code\.tidio\.co/i, cls: 3 },
  { name: "Crisp", re: /client\.crisp\.chat/i, cls: 3 },
  { name: "Tawk.to", re: /embed\.tawk\.to/i, cls: 3 },
  { name: "LiveChat", re: /cdn\.livechatinc\.com|livechat\.com\/tracking/i, cls: 3 },
  { name: "Olark", re: /static\.olark\.com/i, cls: 3 },
  { name: "Smartsupp", re: /smartsupp\.com\/loader/i, cls: 3 },
  { name: "Chatra", re: /call\.chatra\.io|chatra\.io/i, cls: 3 },
  { name: "Userlike", re: /userlike-cdn|userlike\.com/i, cls: 3 },
  { name: "Freshchat", re: /wchat\.freshchat\.com|freshchat\.com\/js/i, cls: 3 },
  { name: "Zendesk messaging", re: /static\.zdassets\.com|zopim\.com/i, cls: 3 },
  { name: "Intercom", re: /widget\.intercom\.io|js\.intercomcdn\.com|window\.Intercom/i, cls: 3 },
  { name: "Drift", re: /js\.driftt\.com|drift\.com\/widget/i, cls: 3 },
  { name: "Chatbase", re: /chatbase\.co\/embed/i, cls: 4 },
  { name: "SiteGPT", re: /sitegpt\.ai/i, cls: 4 },
  { name: "CustomGPT", re: /customgpt\.ai/i, cls: 4 },
  { name: "Botsonic", re: /botsonic|writesonic\.com\/.*widget/i, cls: 4 },
  { name: "Dante AI", re: /dante-ai\.com/i, cls: 4 },
  { name: "Ada", re: /static\.ada\.support/i, cls: 4 },
  { name: "Custom first-party agent", re: /\/api\/chat\b|useChat\(|@ai-sdk\/|ai\/react|data-conversation-agent|data-site-agent|chat-widget-root/i, cls: 4 },
];

/** Code-level signals of a custom LLM agent inside first-party script bundles. */
const BUNDLE_AGENT_RE = /\/api\/chat\b|useChat\(|@ai-sdk\/|ai\/react|anthropic|openai\.com\/v1|role:\s*["']assistant["']/i;

export type ChatClassification = {
  cls: ChatClass;
  vendors: { name: string; cls: ChatClass; evidence: string; pagesWith: number }[];
  pagesTotal: number;
  pagesWithAny: number;
};

export function classifyChat(crawl: CrawlResult): ChatClassification {
  const pagesTotal = crawl.pages.length;
  const vendors: ChatClassification["vendors"] = [];
  let pagesWithAny = 0;
  const perVendorPages = new Map<string, number>();
  const perVendorEvidence = new Map<string, string>();
  for (const p of crawl.pages) {
    // Code and attribute signals only. Prose that mentions "chat" or "agent" is not evidence.
    const attrs = (p.html.match(/<[^>]+(data-[a-z-]*(chat|agent)[a-z-]*|id=["'][^"']*chat[^"']*["']|class=["'][^"']*chat-?widget[^"']*["'])[^>]*>/gi) ?? []).join("\n");
    const hay = [p.scripts.map((s) => s.src).join("\n"), p.iframes.join("\n"), p.inlineScriptText, p.links.map((l) => l.href).join("\n"), attrs].join("\n");
    let any = false;
    for (const v of CHAT_VENDORS) {
      const m = hay.match(v.re);
      if (m) {
        any = true;
        perVendorPages.set(v.name, (perVendorPages.get(v.name) ?? 0) + 1);
        if (!perVendorEvidence.has(v.name)) {
          const idx = m.index ?? 0;
          perVendorEvidence.set(v.name, hay.slice(Math.max(0, idx - 40), idx + m[0].length + 40).replace(/\s+/g, " ").trim());
        }
      }
    }
    if (any) pagesWithAny++;
  }
  for (const v of CHAT_VENDORS) {
    const n = perVendorPages.get(v.name);
    if (n) vendors.push({ name: v.name, cls: v.cls, evidence: perVendorEvidence.get(v.name) ?? "", pagesWith: n });
  }
  const cls = vendors.reduce<ChatClass>((m, v) => (v.cls > m ? v.cls : m), 0);
  return { cls, vendors, pagesTotal, pagesWithAny };
}

/**
 * When no vendor widget is found, look inside the homepage's first-party
 * script bundles for a custom agent. Capped: 12 scripts, 400 KB each.
 */
export async function probeFirstPartyBundles(crawl: CrawlResult, fetchOpts?: FetchOptions): Promise<{ hit: string | null; scanned: number }> {
  const home = crawl.home;
  if (!home) return { hit: null, scanned: 0 };
  const host = crawl.host.replace(/^www\./, "");
  const origin = new URL(home.finalUrl).origin;
  // Script tags plus chunk URLs referenced in the page payload (lazy-loaded
  // components, e.g. Next.js RSC flight data), capped.
  const referenced = (home.html.match(/["'](\/_next\/static\/chunks\/[^"']+\.js(?:\?[^"']*)?|\/_nuxt\/[^"']+\.js|\/_app\/immutable\/[^"']+\.js|\/assets\/[^"']+\.js)["']/g) ?? []).map((m) => origin + m.slice(1, -1));
  const own = [...new Set([...home.scripts.map((s) => s.src), ...referenced])]
    .filter((u) => { try { return new URL(u).hostname.replace(/^www\./, "") === host; } catch { return false; } })
    .slice(0, 20);
  let scanned = 0;
  const results = await Promise.all(own.map(async (u) => {
    const r = await safeFetch(u, { ...fetchOpts, allowNonHtml: true, maxBytes: 400 * 1024, timeoutMs: 8000 });
    if (isFetchFailure(r)) return null;
    scanned++;
    const m = r.body.match(BUNDLE_AGENT_RE);
    return m ? `${new URL(u).pathname}: …${r.body.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + m[0].length + 30).replace(/\s+/g, " ")}…` : null;
  }));
  return { hit: results.find(Boolean) ?? null, scanned };
}

const CLASS_NAME: Record<ChatClass, string> = { 0: "none (form only)", 1: "capture widget", 2: "scripted bot", 3: "live chat", 4: "conversational agent" };
const CLASS_MID: Record<ChatClass, number> = { 0: 5, 1: 20, 2: 35, 3: 55, 4: 85 };

export async function runEngagement(ctx: ExtractorContext): Promise<ExtractorResult> {
  const c = classifyChat(ctx.crawl);
  const findings: Finding[] = [];
  let bundleHit: string | null = null;
  if (c.cls === 0) {
    const probe = await probeFirstPartyBundles(ctx.crawl, ctx.fetchOpts);
    if (probe.hit) {
      bundleHit = probe.hit;
      c.cls = 4;
      c.vendors.push({ name: "Custom first-party agent (code signals in site bundle)", cls: 4, evidence: probe.hit, pagesWith: 0 });
    }
  }
  const top = c.vendors.filter((v) => v.cls === c.cls)[0];
  const status = c.cls === 4 ? "pass" : c.cls === 3 ? "partial" : "fail";
  const ev = top
    ? `${top.name} detected, class: ${CLASS_NAME[c.cls]}. Signal: ${top.evidence}`
    : "No chat or conversation surface detected on any crawled page.";
  findings.push(finding(8, "eng-01", status, 70, ev));

  if (c.cls === 0) {
    findings.push(na(8, "eng-02", 30, "No chat surface to measure presence for."));
  } else if (bundleHit) {
    findings.push(na(8, "eng-02", 30, "Agent detected in the site's script bundle; per-page presence cannot be measured from outside without rendering."));
  } else {
    const share = pct(c.pagesWithAny, c.pagesTotal);
    findings.push(finding(8, "eng-02", share === 100 ? "pass" : share >= 50 ? "partial" : "fail", 30, `Chat surface present on ${c.pagesWithAny} of ${c.pagesTotal} crawled pages.`));
  }

  let score = CLASS_MID[c.cls];
  if (c.cls > 0 && !bundleHit) {
    const share = c.pagesWithAny / Math.max(1, c.pagesTotal);
    if (share === 1) score += 5;
    else if (share < 0.5) score -= 5;
  }
  return { dimension: 8, findings, score: Math.max(0, Math.min(100, score)), notes: ["Not tested live. Class from detection only (Rubric 08 Part A)."] };
}
