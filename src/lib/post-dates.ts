/**
 * Freshness dates for a post.
 *
 * Sanity stamps `_updatedAt` on every write, including the go-live flip and
 * one-line fixes, so it is a reliable "last changed" signal but a noisy
 * "meaningfully revised" one. Schema, Open Graph and the sitemap want the
 * former: engines compare it against their last crawl. The visible "Updated"
 * line wants the latter, so it only appears once an edit lands more than a day
 * after publication. A scheduled post is created before its publishedAt, so
 * the later of the two dates is always the modified date.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** ISO date of the last change: `_updatedAt` if later than `publishedAt`. */
export function modifiedAt(publishedAt: string, updatedAt?: string): string {
  const p = Date.parse(publishedAt);
  const u = updatedAt ? Date.parse(updatedAt) : NaN;
  return Number.isFinite(u) && u > p ? (updatedAt as string) : publishedAt;
}

/** True once a post has been edited more than a day after it was published. */
export function isRevised(publishedAt: string, updatedAt?: string): boolean {
  const p = Date.parse(publishedAt);
  const u = updatedAt ? Date.parse(updatedAt) : NaN;
  return Number.isFinite(u) && u - p > ONE_DAY_MS;
}
