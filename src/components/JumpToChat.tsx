"use client";

/**
 * JumpToChat
 *
 * A small CTA button that opens the floating site agent (SiteAgent, mounted
 * in the root layout). It used to scroll to an inline ChatWidget under the
 * `#ask-adam` anchor; that inline widget was removed from blog posts once
 * the agent went site-wide. The `#ask-adam` hash still opens the panel for
 * old email links (SiteAgent listens for it).
 *
 * Brand notes: blue `#188bf6` with `#0d78dc` hover, rounded-full pill,
 * font-medium, matching CTAButton so the two feel like the same family.
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
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("site-agent:open"))}
        className="inline-flex items-center justify-center rounded-full font-medium transition whitespace-nowrap px-6 py-3 text-sm bg-[#188bf6] text-white hover:bg-[#0d78dc]"
      >
        {children}
      </button>
    </div>
  );
}
