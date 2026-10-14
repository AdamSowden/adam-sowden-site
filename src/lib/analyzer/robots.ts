// robots.txt fetch and parse. Used for two things: honouring the site's
// crawl rules for pages beyond the homepage, and the AEO check on whether AI
// crawlers are blocked (site-analyser-spec.md Group B).

import { safeFetch, isFetchFailure, type FetchOptions } from "./fetch";
import type { RobotsGroup, RobotsModel } from "./types";

export const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot", "anthropic-ai", "OAI-SearchBot", "Applebot-Extended", "Bytespider"];

export function parseRobots(raw: string): Pick<RobotsModel, "groups" | "sitemaps"> {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === "sitemap") {
      sitemaps.push(value);
      continue;
    }
    if (!current) continue;
    if (key === "allow") current.allow.push(value);
    else if (key === "disallow") current.disallow.push(value);
  }
  return { groups, sitemaps };
}

function matchRule(rule: string, path: string): boolean {
  if (rule === "") return false;
  // Convert robots wildcard syntax to a regex.
  const esc = rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const anchored = esc.endsWith("$") ? `^${esc.slice(0, -1)}$` : `^${esc}`;
  return new RegExp(anchored).test(path);
}

function groupFor(groups: RobotsGroup[], ua: string): RobotsGroup | null {
  const lower = ua.toLowerCase();
  let star: RobotsGroup | null = null;
  for (const g of groups) {
    for (const a of g.agents) {
      const al = a.toLowerCase();
      if (al === "*") star = star ?? g;
      else if (lower.includes(al) || al.includes(lower)) return g;
    }
  }
  return star;
}

/** Longest-match rule, as Google does. Allowed when no group or no matching rule. */
export function isAllowed(model: Pick<RobotsModel, "groups">, ua: string, path: string): boolean {
  const g = groupFor(model.groups, ua);
  if (!g) return true;
  let best: { allow: boolean; len: number } | null = null;
  for (const r of g.allow) if (matchRule(r, path) && (!best || r.length > best.len)) best = { allow: true, len: r.length };
  for (const r of g.disallow) if (matchRule(r, path) && (!best || r.length > best.len)) best = { allow: false, len: r.length };
  return best ? best.allow : true;
}

/** Fully blocked = Disallow: / for that agent with no longer Allow. */
export function isAgentBlocked(model: Pick<RobotsModel, "groups">, ua: string): boolean {
  return !isAllowed(model, ua, "/");
}

export function aiCrawlerStatus(model: Pick<RobotsModel, "groups">): { blocked: string[]; allowed: string[]; unaddressed: string[] } {
  const blocked: string[] = [];
  const allowed: string[] = [];
  const unaddressed: string[] = [];
  for (const bot of AI_CRAWLERS) {
    const explicit = model.groups.some((g) => g.agents.some((a) => a.toLowerCase() === bot.toLowerCase()));
    if (isAgentBlocked(model, bot)) blocked.push(bot);
    else if (explicit) allowed.push(bot);
    else unaddressed.push(bot);
  }
  return { blocked, allowed, unaddressed };
}

export async function fetchRobots(origin: string, opts: FetchOptions = {}): Promise<RobotsModel> {
  const url = new URL("/robots.txt", origin).toString();
  const res = await safeFetch(url, { ...opts, allowNonHtml: true, maxBytes: 256 * 1024 });
  if (isFetchFailure(res) || res.status >= 400) {
    return { fetched: false, status: isFetchFailure(res) ? null : res.status, raw: "", groups: [], sitemaps: [] };
  }
  // Some hosts serve an HTML 404 page with 200. Treat as no robots.
  if (/<html/i.test(res.body.slice(0, 500))) {
    return { fetched: false, status: res.status, raw: "", groups: [], sitemaps: [] };
  }
  const parsed = parseRobots(res.body);
  return { fetched: true, status: res.status, raw: res.body, ...parsed };
}
