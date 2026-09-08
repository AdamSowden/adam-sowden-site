/**
 * Related-post selection.
 *
 * Why this exists: as of September 2026, 15 of 23 posts had no internal link
 * pointing at them except the /blog index. Eleven URLs sat in Google Search
 * Console as "Discovered, currently not indexed", which is a crawl-priority
 * decision driven largely by internal link signals. Every internal link in a
 * post body was one someone had typed by hand, and most posts had none.
 *
 * Two design constraints came out of the data:
 *
 * 1. `articleSection` cannot cluster anything. It reads like a taxonomy but it
 *    is a per-post label: 19 of 21 distinct values have exactly one post. So
 *    grouping by section would produce a set of one almost every time. It is
 *    used here only as a small bonus for the two real pairs.
 *
 * 2. Similarity alone does not fix orphaning. Rank every post against every
 *    other and the outliers stay unlinked, which is the exact failure being
 *    fixed. So selection runs globally with a balance penalty, and a final
 *    sweep guarantees every post ends up with at least one inbound link.
 *
 * The assignment is deterministic: same posts in, same links out, on every
 * page and every render. Two pages never disagree about what links where.
 */

export type RelatedCandidate = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  metaDescription?: string;
  articleSection?: string;
  primaryKeyword?: string;
};

/** Words carrying no topical signal in this corpus. */
const STOPWORDS = new Set([
  "a", "about", "after", "ai", "all", "an", "and", "any", "are", "as",
  "at", "be", "because", "been", "before", "best", "business", "but", "by",
  "can", "cant", "do", "does", "dont", "for", "from", "get", "has", "have",
  "how", "i", "if", "in", "info", "is", "isnt", "it", "its", "just", "like",
  "make", "many", "me", "more", "most", "much", "my", "need", "new", "no",
  "not", "of", "off", "on", "one", "only", "or", "our", "out", "over", "own",
  "should", "so", "some", "than", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "to", "too", "up", "use", "using", "very",
  "want", "was", "we", "what", "when", "where", "which", "who", "why", "will",
  "with", "without", "would", "you", "your", "yours",
]);

function tokenize(input: string | undefined): Set<string> {
  if (!input) return new Set();
  return new Set(
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}

// Weights. Keyword overlap is the strongest real signal available, since
// articleSection is effectively unique per post and there are no tags.
const W_KEYWORD = 10;
const W_KEYWORD_CAP = 40;
const W_TITLE = 4;
const W_TITLE_CAP = 16;
const W_SAME_SECTION = 25;
const W_RECENCY_MAX = 4;

// Cost of picking a post that other posts have already picked. High enough to
// beat a moderate similarity edge, so inbound links spread rather than pooling
// on two or three "hub-like" posts.
const W_ALREADY_LINKED = 14;

type Prepared = {
  post: RelatedCandidate;
  slug: string;
  keywordTokens: Set<string>;
  titleTokens: Set<string>;
  publishedMs: number;
};

function prepare(posts: RelatedCandidate[]): Prepared[] {
  return posts
    .filter((p) => p?.slug?.current)
    .map((p) => ({
      post: p,
      slug: p.slug.current,
      keywordTokens: tokenize(p.primaryKeyword),
      titleTokens: tokenize(p.title),
      publishedMs: Date.parse(p.publishedAt) || 0,
    }));
}

function similarity(a: Prepared, b: Prepared, newestMs: number, oldestMs: number): number {
  let score = 0;

  score += Math.min(
    overlap(a.keywordTokens, b.keywordTokens) * W_KEYWORD,
    W_KEYWORD_CAP
  );
  score += Math.min(overlap(a.titleTokens, b.titleTokens) * W_TITLE, W_TITLE_CAP);

  // Keyword tokens against the other post's title, and vice versa. A post
  // targeting "marketing VA alternative" should find "Why Hiring a Marketing
  // VA Isn't the Answer" even when the stored keywords share nothing.
  score += Math.min(overlap(a.keywordTokens, b.titleTokens) * W_TITLE, W_TITLE_CAP);
  score += Math.min(overlap(a.titleTokens, b.keywordTokens) * W_TITLE, W_TITLE_CAP);

  if (
    a.post.articleSection &&
    b.post.articleSection &&
    a.post.articleSection === b.post.articleSection
  ) {
    score += W_SAME_SECTION;
  }

  // Mild recency preference, normalised so it never outweighs a real topical
  // match. Keeps the newest work circulating without burying older posts.
  const span = Math.max(newestMs - oldestMs, 1);
  score += ((b.publishedMs - oldestMs) / span) * W_RECENCY_MAX;

  return score;
}

/**
 * Build the whole site's related-post assignment in one pass.
 *
 * Runs over every post rather than answering one at a time, because the
 * balance penalty and the orphan sweep both need to see the full picture.
 * Cheap at this corpus size and deterministic, so calling it per page render
 * gives identical results everywhere.
 */
export function buildRelatedMap(
  posts: RelatedCandidate[],
  limit = 3
): Map<string, RelatedCandidate[]> {
  const prepared = prepare(posts);
  const result = new Map<string, RelatedCandidate[]>();
  if (prepared.length <= 1) {
    for (const p of prepared) result.set(p.slug, []);
    return result;
  }

  const times = prepared.map((p) => p.publishedMs);
  const newestMs = Math.max(...times);
  const oldestMs = Math.min(...times);

  // Stable processing order so the output never depends on fetch order.
  const order = [...prepared].sort((a, b) => a.slug.localeCompare(b.slug));

  const inboundCount = new Map<string, number>();
  for (const p of prepared) inboundCount.set(p.slug, 0);

  for (const source of order) {
    const scored = prepared
      .filter((c) => c.slug !== source.slug)
      .map((c) => ({
        candidate: c,
        base: similarity(source, c, newestMs, oldestMs),
      }))
      .map((s) => ({
        ...s,
        adjusted:
          s.base - (inboundCount.get(s.candidate.slug) ?? 0) * W_ALREADY_LINKED,
      }))
      // Ties break on slug so the result is fully deterministic.
      .sort(
        (x, y) =>
          y.adjusted - x.adjusted || x.candidate.slug.localeCompare(y.candidate.slug)
      );

    const picks = scored.slice(0, Math.min(limit, scored.length));
    for (const p of picks) {
      inboundCount.set(
        p.candidate.slug,
        (inboundCount.get(p.candidate.slug) ?? 0) + 1
      );
    }
    result.set(
      source.slug,
      picks.map((p) => p.candidate.post)
    );
  }

  // Orphan sweep. The balance penalty makes pooling unlikely but does not
  // prove coverage, and coverage is the entire point of this file. Any post
  // still at zero inbound links is placed on the post it is most similar to,
  // displacing that post's weakest pick.
  const orphans = [...inboundCount.entries()]
    .filter(([, n]) => n === 0)
    .map(([slug]) => slug)
    .sort();

  for (const orphanSlug of orphans) {
    const orphan = prepared.find((p) => p.slug === orphanSlug);
    if (!orphan) continue;

    const hosts = prepared
      .filter((p) => p.slug !== orphanSlug)
      .map((p) => ({ host: p, score: similarity(p, orphan, newestMs, oldestMs) }))
      .sort((a, b) => b.score - a.score || a.host.slug.localeCompare(b.host.slug));

    for (const { host } of hosts) {
      const current = result.get(host.slug) ?? [];
      if (current.some((c) => c.slug.current === orphanSlug)) break;

      // Displace the host's least valuable pick: the one whose own inbound
      // count is highest, so nothing is pushed back to zero.
      let dropIndex = -1;
      let dropInbound = -1;
      current.forEach((c, i) => {
        const n = inboundCount.get(c.slug.current) ?? 0;
        if (n > dropInbound && n > 1) {
          dropInbound = n;
          dropIndex = i;
        }
      });

      if (dropIndex === -1) continue; // dropping anything here would orphan it

      const dropped = current[dropIndex];
      inboundCount.set(
        dropped.slug.current,
        (inboundCount.get(dropped.slug.current) ?? 1) - 1
      );
      current[dropIndex] = orphan.post;
      inboundCount.set(orphanSlug, 1);
      result.set(host.slug, current);
      break;
    }
  }

  return result;
}

/** The related set for one post. */
export function selectRelated(
  posts: RelatedCandidate[],
  currentSlug: string,
  limit = 3
): RelatedCandidate[] {
  return buildRelatedMap(posts, limit).get(currentSlug) ?? [];
}

/** Every published post, with the fields selection needs. */
export const relatedPostsQuery = `*[_type == "blogPost" && complianceApproved == true && defined(slug.current)] {
  _id, title, slug, publishedAt, metaDescription, articleSection, primaryKeyword
}`;
