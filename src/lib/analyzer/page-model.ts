// Parse fetched HTML into the PageModel every extractor reads from.

import * as cheerio from "cheerio";
import type { FetchResult, FormModel, Heading, JsonLdBlock, LinkRef, PageMeta, PageModel, ScriptRef } from "./types";
import { sameSite } from "./url-guard";

const INLINE_SCRIPT_CAP = 300 * 1024;
const TEXT_CAP = 200 * 1024;

function collapse(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function extractJsonLd($: cheerio.CheerioAPI): JsonLdBlock[] {
  const blocks: JsonLdBlock[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    let parsed: unknown | null = null;
    let valid = true;
    try {
      parsed = JSON.parse(raw);
    } catch {
      valid = false;
    }
    const types = new Set<string>();
    const walk = (v: unknown) => {
      if (!v || typeof v !== "object") return;
      if (Array.isArray(v)) return v.forEach(walk);
      const o = v as Record<string, unknown>;
      const t = o["@type"];
      if (typeof t === "string") types.add(t);
      else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
      Object.values(o).forEach(walk);
    };
    walk(parsed);
    blocks.push({ raw, parsed, types: [...types], valid });
  });
  return blocks;
}

function extractMeta($: cheerio.CheerioAPI, finalUrl: string): PageMeta {
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  $("meta").each((_, el) => {
    const prop = ($(el).attr("property") || "").toLowerCase();
    const name = ($(el).attr("name") || "").toLowerCase();
    const content = $(el).attr("content") || "";
    if (prop.startsWith("og:")) og[prop.slice(3)] = content;
    if (name.startsWith("twitter:")) twitter[name.slice(8)] = content;
  });
  const canonicalRaw = $('link[rel="canonical"]').first().attr("href") || "";
  let canonical = "";
  if (canonicalRaw) {
    try {
      canonical = new URL(canonicalRaw, finalUrl).toString();
    } catch {
      canonical = canonicalRaw;
    }
  }
  return {
    title: collapse($("head > title").first().text() || $("title").first().text()),
    description: $('meta[name="description"]').first().attr("content")?.trim() || "",
    robots: $('meta[name="robots"]').map((_, el) => $(el).attr("content") || "").get().join(", "),
    canonical,
    viewport: $('meta[name="viewport"]').first().attr("content") || "",
    generator: $('meta[name="generator"]').map((_, el) => $(el).attr("content") || "").get().join("; "),
    lang: $("html").attr("lang") || "",
    og,
    twitter,
  };
}

function extractForms($: cheerio.CheerioAPI, finalUrl: string): FormModel[] {
  const forms: FormModel[] = [];
  $("form").each((_, f) => {
    const fields = $(f)
      .find("input, select, textarea")
      .map((_, el) => {
        const tag = (el as unknown as { tagName: string }).tagName?.toLowerCase() || "input";
        const type = ($(el).attr("type") || (tag === "input" ? "text" : tag)).toLowerCase();
        return {
          tag,
          type,
          name: $(el).attr("name") || $(el).attr("id") || "",
          required: $(el).attr("required") !== undefined || $(el).attr("aria-required") === "true",
        };
      })
      .get()
      .filter((x) => !["hidden", "submit", "button", "reset", "image"].includes(x.type));
    let action = $(f).attr("action") || "";
    if (action) {
      try {
        action = new URL(action, finalUrl).toString();
      } catch {
        /* keep raw */
      }
    }
    forms.push({
      action,
      method: ($(f).attr("method") || "get").toLowerCase(),
      fields,
      fieldCount: fields.length,
      hasEmail: fields.some((x) => x.type === "email" || /e-?mail/i.test(x.name)),
      hasPhone: fields.some((x) => x.type === "tel" || /phone|mobile|tel/i.test(x.name)),
    });
  });
  return forms;
}

export function parsePage(fetched: FetchResult): PageModel {
  const $ = cheerio.load(fetched.body);
  const finalUrl = fetched.finalUrl;
  const host = new URL(finalUrl).hostname;

  // Inline script text (capped) before stripping for visible text.
  let inlineScriptText = "";
  let inlineScriptBytes = 0;
  const scripts: ScriptRef[] = [];
  $("script").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      let abs = src;
      try {
        abs = new URL(src, finalUrl).toString();
      } catch {
        /* keep */
      }
      scripts.push({
        src: abs,
        async: $(el).attr("async") !== undefined,
        defer: $(el).attr("defer") !== undefined,
        type: $(el).attr("type") || "",
      });
    } else {
      const t = $(el).text();
      inlineScriptBytes += Buffer.byteLength(t);
      if (inlineScriptText.length < INLINE_SCRIPT_CAP) inlineScriptText += t.slice(0, INLINE_SCRIPT_CAP - inlineScriptText.length) + "\n";
    }
  });

  let inlineStyleBytes = 0;
  $("style").each((_, el) => {
    inlineStyleBytes += Buffer.byteLength($(el).text());
  });
  const stylesheets = $('link[rel~="stylesheet"]')
    .map((_, el) => {
      const h = $(el).attr("href") || "";
      try {
        return new URL(h, finalUrl).toString();
      } catch {
        return h;
      }
    })
    .get();

  const jsonLd = extractJsonLd($);
  const meta = extractMeta($, finalUrl);
  const forms = extractForms($, finalUrl);

  const headings: Heading[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tag = (el as unknown as { tagName: string }).tagName.toLowerCase();
    const level = parseInt(tag[1], 10) as Heading["level"];
    headings.push({ level, text: collapse($(el).text()) });
  });

  const links: LinkRef[] = [];
  const telLinks: string[] = [];
  const mailtoLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    if (href.startsWith("tel:")) return void telLinks.push(href);
    if (href.startsWith("mailto:")) return void mailtoLinks.push(href);
    let abs: URL;
    try {
      abs = new URL(href, finalUrl);
    } catch {
      return;
    }
    if (abs.protocol !== "http:" && abs.protocol !== "https:") return;
    abs.hash = "";
    links.push({
      href: abs.toString(),
      text: collapse($(el).text()).slice(0, 200),
      internal: sameSite(abs.hostname, host),
      rel: $(el).attr("rel") || "",
    });
  });

  const iframes = $("iframe[src]").map((_, el) => $(el).attr("src") || "").get();
  const imgs = $("img");
  const images = {
    total: imgs.length,
    withAlt: imgs.filter((_, el) => ($(el).attr("alt") || "").trim().length > 0).length,
  };
  const mainCount = $("main, [role='main']").length;

  // Visible text: strip non-content elements, separate block boundaries so
  // adjacent blocks do not run together, then read body text.
  $("script, style, noscript, template, svg, head").remove();
  $("br").replaceWith(" ");
  $("p, h1, h2, h3, h4, h5, h6, li, div, section, article, header, footer, nav, aside, blockquote, figcaption, td, th, tr, dd, dt, button, a").each((_, el) => {
    $(el).append(" ");
  });
  const text = collapse($("body").text()).slice(0, TEXT_CAP);
  const wordCount = text ? text.split(/\s+/).length : 0;
  const scriptPayloadLarge = inlineScriptBytes > 50 * 1024 || scripts.length > 5;
  const renderedClientSide = wordCount < 200 && scriptPayloadLarge;

  return {
    url: fetched.requestedUrl,
    finalUrl,
    status: fetched.status,
    headers: fetched.headers,
    htmlBytes: fetched.bodyBytes,
    html: fetched.body,
    text,
    wordCount,
    headings,
    h1Count: headings.filter((h) => h.level === 1).length,
    links,
    internalLinks: links.filter((l) => l.internal),
    externalLinks: links.filter((l) => !l.internal),
    scripts,
    inlineScriptText,
    inlineScriptBytes,
    stylesheets,
    inlineStyleBytes,
    jsonLd,
    meta,
    forms,
    telLinks,
    mailtoLinks,
    iframes,
    images,
    mainCount,
    renderedClientSide,
    fetchedAt: Date.now(),
  };
}
