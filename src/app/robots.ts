import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /try-sms is the unlisted beta door for the Speed-to-Lead Agent. It carries
// noindex metadata too; this is belt and braces so it never surfaces in
// search while in beta.
const DISALLOW = ["/api/", "/studio/", "/studio", "/try-sms"];

// AI answer-engine crawlers, named explicitly. The wildcard already allowed
// them; naming them records that the site chose to be read and cited by
// answer engines, and keeps that choice separate from any future wildcard
// change. Google-Extended is Google's switch for Gemini and AI Overview
// grounding; OAI-SearchBot is ChatGPT search (GPTBot is OpenAI training).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
