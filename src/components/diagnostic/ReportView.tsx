// Marketing Bottleneck Report — rendered view.
//
// Section order:
//   1. Header (title + "Prepared for ...")
//   2. Bottleneck Profile  (dark navy card)
//   3. Effort vs Impact chart
//   4. Strategy Gaps
//   5. AI Transformation Status
//   6. Education Position
//   7. Your Fix Sequence (left blue border)
//   8. This Week Quick Win Plan (warm-grey card)
//   9. Closing paragraph
//  10. CTA block (personalised CTA line + booking button)

import type { ReactNode } from "react";
import { BOOKING_URL } from "@/lib/site";
import type { DiagnosticReport } from "@/lib/diagnostic-prompts";
import EffortImpactMatrix from "./EffortImpactMatrix";

type Props = {
  report: DiagnosticReport;
  firstName: string;
};

export default function ReportView({ report, firstName }: Props) {
  return (
    <section className="bg-[#F9FAFB] border-t border-black/10">
      <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-[#111111] leading-tight">
            Your Marketing Bottleneck Report
          </h1>
          <p className="text-sm md:text-base text-black/55 mt-2">
            Prepared for {firstName}
          </p>
        </header>

        <Section1 dependencyProfile={report.dependencyProfile} />

        <EffortImpactMatrix items={report.effortImpactMatrix} />

        <Section
          title="Strategy Gaps"
          body={report.strategyGaps}
        />

        <Section
          title="AI Transformation Status"
          body={report.aiTransformationStatus}
        />

        <Section
          title="Education Position"
          body={report.educationPosition}
        />

        <FixSequenceSection body={report.fixSequence} />

        <QuickWinPlanSection body={report.quickWinPlan} />

        <ClosingParagraph body={report.closingParagraph} />

        <CtaBlock personalisedCtaLine={report.personalisedCtaLine} />
      </div>
    </section>
  );
}

function Section1({ dependencyProfile }: { dependencyProfile: string }) {
  return (
    <section className="mb-12 rounded-2xl bg-[#0a0f1e] text-white p-7 md:p-9">
      <h2 className="font-serif text-lg md:text-xl font-semibold mb-3">
        Your Bottleneck Profile
      </h2>
      <p className="text-[15px] leading-[1.8] text-white/85">
        {dependencyProfile}
      </p>
    </section>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] mb-5">
        {title}
      </h2>
      <Paragraphs text={body} />
    </section>
  );
}

function FixSequenceSection({ body }: { body: string }) {
  return (
    <section className="mb-12 border-l-[3px] border-[#188bf6] pl-5 md:pl-6">
      <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] mb-5">
        Your Fix Sequence
      </h2>
      <Paragraphs text={body} />
    </section>
  );
}

function QuickWinPlanSection({ body }: { body: string }) {
  const items = body
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return (
    <section className="mb-12 rounded-2xl bg-white border border-black/10 p-6 md:p-8">
      <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] mb-5">
        This Week Quick Win Plan
      </h2>
      <ul className="space-y-4 list-none p-0">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#188bf6]/15 text-[#188bf6] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="text-[15px] leading-[1.7] text-[#111111]">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClosingParagraph({ body }: { body: string }) {
  return (
    <section className="mb-10 pt-6 border-t border-black/10">
      <p className="text-[17px] leading-[1.8] text-[#111111] whitespace-pre-line">
        {body}
      </p>
    </section>
  );
}

function CtaBlock({
  personalisedCtaLine,
}: {
  personalisedCtaLine: string;
}) {
  return (
    <section className="rounded-2xl bg-white border border-black/10 p-8 md:p-10 text-center">
      <p className="text-[15px] italic text-[#111111]/65 mb-5 max-w-md mx-auto leading-relaxed">
        {personalisedCtaLine}
      </p>
      <a
        href={BOOKING_URL}
        className="inline-flex items-center justify-center rounded-full bg-[#188bf6] text-white text-base font-semibold px-8 py-4 hover:bg-[#0d78dc] transition whitespace-nowrap"
      >
        Book MY Free 20-Minute Chat
      </a>
      <p className="text-xs text-black/45 mt-4">
        No pitch. No obligation. 20 minutes. Instant calendar booking.
      </p>
    </section>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-5">
      {text
        .split("\n\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p, i) => (
          <p
            key={i}
            className="text-[16px] md:text-[17px] leading-[1.8] text-[#111111]/85"
          >
            {renderInlineBold(p)}
          </p>
        ))}
    </div>
  );
}

// Tiny **bold** parser. Splits on the bold delimiter and wraps matched
// segments in <strong>. Anything outside the delimiters renders as plain
// text. Safe against React XSS because we never call dangerouslySetInnerHTML.
function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((segment, i) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#111111]">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{segment}</span>;
  });
}
