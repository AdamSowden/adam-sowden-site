import Link from "next/link";
import { client } from "@/lib/sanity";
import {
  buildRelatedMap,
  relatedPostsQuery,
  type RelatedCandidate,
} from "@/lib/related-posts";

/**
 * Three generated internal links at the foot of every post.
 *
 * Server-rendered on purpose: these links exist to be crawled, so they have to
 * be in the HTML the crawler receives, not added by client JavaScript.
 *
 * Selection is deterministic and global (see lib/related-posts.ts), which is
 * what guarantees no post is left with the /blog index as its only inbound
 * link. Nothing here is hand-curated, so a new post is linked the moment it
 * publishes without anyone editing an older post.
 */
export default async function RelatedPosts({
  currentSlug,
  limit = 3,
}: {
  currentSlug: string;
  limit?: number;
}) {
  let posts: RelatedCandidate[] = [];
  try {
    posts = await client.fetch<RelatedCandidate[]>(relatedPostsQuery);
  } catch {
    return null;
  }

  const related = buildRelatedMap(posts, limit).get(currentSlug) ?? [];
  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="bg-white border-t border-black/10"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          Keep reading
        </p>
        <h2
          id="related-posts-heading"
          className="font-serif text-3xl md:text-4xl tracking-tight text-[#111111] max-w-2xl"
        >
          Related essays
        </h2>

        <ul className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8 list-none p-0">
          {related.map((p) => (
            <li key={p._id} className="flex">
              <Link
                href={`/blog/${p.slug.current}`}
                className="flex flex-col bg-[#F9FAFB] border border-black/10 rounded-2xl p-6 md:p-7 hover:border-black/30 transition w-full"
              >
                {p.articleSection && (
                  <span className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-3">
                    {p.articleSection}
                  </span>
                )}
                <span className="font-serif text-xl md:text-2xl tracking-tight text-[#111111] leading-[1.2]">
                  {p.title}
                </span>
                {p.metaDescription && (
                  <span className="mt-3 text-sm text-[#111111]/70 leading-relaxed line-clamp-3">
                    {p.metaDescription}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <Link
            href="/blog"
            className="text-[#188bf6] font-medium hover:underline"
          >
            All essays
          </Link>
        </p>
      </div>
    </section>
  );
}
