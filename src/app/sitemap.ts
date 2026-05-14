import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity";
import { SITE_URL } from "@/lib/site";

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
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
];

type SitemapPost = {
  slug?: { current?: string };
  publishedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
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
