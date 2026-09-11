// Fixed header for the diagnostic page. Adam Sowden script logo on the
// left (visual brand), the page H1 ("AI Marketing Diagnostic") so the user
// and crawlers know where they are, progress indicator on the right. The
// progress block hides once the report is complete (questionIndex >= 20)
// so the report can breathe.
//
// The logo is NOT a link. The diagnostic is intentionally standalone:
// no nav, no escape hatch back to the main site. Adding a clickable
// logo would break the focused-tool funnel.

import Image from "next/image";

type Props = {
  questionIndex: number;
  showProgress: boolean;
};

export default function DiagnosticHeader({
  questionIndex,
  showProgress,
}: Props) {
  const displayIndex = Math.min(Math.max(questionIndex, 1), 18);
  const pct = (displayIndex / 18) * 100;
  return (
    <header className="bg-white text-[#111111] border-b border-black/5">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Image
            src="/adam-sowden-logo.png"
            alt="Adam Sowden"
            width={1200}
            height={805}
            priority
            className="h-14 sm:h-16 w-auto flex-shrink-0"
          />
          {/* The page's H1. It was previously two <p> tags hidden below the
              sm breakpoint, so /diagnostic rendered no heading at all. Google
              indexes the mobile rendering, so a desktop-only heading would not
              have counted either.

              One text node, not one per breakpoint: duplicating the string
              across a `hidden sm:block` / `sm:hidden` pair puts both copies in
              the DOM, and anything reading the heading as text gets them
              concatenated. Size responds, wording does not. */}
          <h1 className="leading-tight border-l border-black/10 pl-3 sm:pl-4 min-w-0 font-serif text-[13px] sm:text-[15px] font-semibold tracking-tight text-[#0a0f1e]">
            AI Marketing Diagnostic
          </h1>
        </div>
        {showProgress && (
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-black/55 mb-1 hidden sm:block">
              Question {displayIndex} of 18
            </p>
            <div className="w-24 sm:w-32 h-1 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full bg-[#188bf6] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
