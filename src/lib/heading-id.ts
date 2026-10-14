import type { PortableTextBlock } from "@portabletext/react";

/**
 * Stable anchor ids for body headings, derived from the heading text, so a
 * section can be linked or cited by fragment (`/blog/slug#what-it-costs`) and
 * a table of contents can be built without a CMS change.
 */
export function headingId(block?: PortableTextBlock): string | undefined {
  if (!block || !Array.isArray(block.children)) return undefined;
  const text = block.children
    .map((c) => (typeof c === "object" && c && "text" in c ? String(c.text) : ""))
    .join("")
    .trim();
  if (!text) return undefined;
  const id = text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return id || undefined;
}
