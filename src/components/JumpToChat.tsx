/**
 * JumpToChat
 *
 * A small CTA button that scrolls the reader down to the AI ChatWidget
 * (which mounts further down the page under the `id="ask-adam"` anchor).
 *
 * Why this exists: readers landing on a long blog post or the home page
 * may want to engage the AI without scrolling through the entire piece.
 * This is the same "Ask Sam's AI a question" pattern from the Miser
 * site (see clients/miser/site-style-conventions.md "ChatWidget rollout
 * pattern"), ported to Adam's brand palette.
 *
 * Brand notes:
 * - Adam's primary accent is blue `#188bf6` (matches CTAButton primary)
 * - Hover is `#0d78dc` (darker blue, matches CTAButton hover)
 * - Rounded-full pill shape, font-medium, matches CTAButton geometry so
 *   the two CTAs feel like the same family
 * - Centered horizontally by default, can be overridden via className
 *
 * The receiving ChatWidget MUST be wrapped with `id="ask-adam"` and
 * `scroll-mt-24` so the sticky header doesn't clip the top of the
 * widget when the smooth-scroll arrives. See src/app/blog/[slug]/page.tsx
 * and src/app/page.tsx for the expected pattern.
 *
 * Global smooth-scroll is enabled in src/app/globals.css with a
 * `prefers-reduced-motion` fallback, so this is a plain anchor link
 * rather than a JS scrollIntoView call.
 */
export default function JumpToChat({
  className = "",
  children = "Ask Adam's AI a question",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`flex justify-center ${className}`}>
      <a
        href="#ask-adam"
        className="inline-flex items-center justify-center rounded-full font-medium transition whitespace-nowrap px-6 py-3 text-sm bg-[#188bf6] text-white hover:bg-[#0d78dc]"
      >
        {children}
      </a>
    </div>
  );
}
