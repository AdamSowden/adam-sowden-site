import type { PortableTextBlock } from "@portabletext/react";

// Minimal conversion of Sanity portable text to plain text, suitable for
// passing an article body as context to the chat widget API. Headings and
// paragraphs become separate lines. Lists and embedded images are flattened.

type Child = { _type?: string; text?: string };

export function portableTextToPlain(
  blocks: PortableTextBlock[] | undefined
): string {
  if (!blocks || blocks.length === 0) return "";
  const lines: string[] = [];
  for (const block of blocks) {
    if (!block) continue;
    const type = (block as { _type?: string })._type;
    if (type === "block") {
      const children = (block as { children?: Child[] }).children ?? [];
      const text = children
        .map((c) => (c && typeof c.text === "string" ? c.text : ""))
        .join("");
      if (text.trim()) lines.push(text);
    }
    // Other types (images, etc.) are skipped — the chat doesn't need them.
  }
  return lines.join("\n\n");
}
