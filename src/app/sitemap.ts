import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity";
import { SITE_URL } from "@/lib/site";

// Without this the sitemap is cached at build time, so posts published in
// Sanity never reach it until someone redeploys. Matches the ISR cadence
// used by the blog routes (src/app/blog/page.tsx).
export const revalidate = 60;

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

const staticRoutes: Array<{
  path: string;
  changeFrequency: ChangeFreq;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/products", changeFrequency: "monthly", priority: 0.9 },
  {
    path: "/products/speed-to-lead-agent",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/products/outreach-agent",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/products/ai-marketing-team",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/products/site-conversation-agent",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/products/marketing-ecosystem",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/products/content-ecosystem",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/diagnostic", changeFrequency: "monthly", priority: 0.8 },
  { path: "/book", changeFrequency: "monthly", priority: 0.7 },
  { path: "/waitlist", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
];

type SitemapPost = {
  slug?: { current?: string };
  publishedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    // Root emits the bare origin (no trailing slash) to match the homepage's
    // self-referencing canonical (<link rel="canonical" href={SITE_URL}>).
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await client.fetch<SitemapPost[]>(
      `*[_type == "blogPost" && complianceApproved == true && defined(slug.current)]{
        "slug": slug,
        publishedAt
      } | order(publishedAt desc)`
    );
    postEntries = (posts || [])
      .filter((p) => p?.slug?.current)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug!.current}`,
        lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.warn("[sitemap] Sanity fetch failed:", err);
  }

  return [...staticEntries, ...postEntries];
}
