import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import QuestionnaireForm from "@/components/QuestionnaireForm";

export const metadata: Metadata = {
  title: "Quick Chat confirmed — Adam Sowden",
  description:
    "Your Quick Chat is booked. A short questionnaire helps Adam prepare.",
  alternates: { canonical: "/call-confirmed" },
  // Private conversion flow — keep out of search results. GTM still
  // fires on noindex pages, so GA4 tracking is unaffected.
  robots: { index: false, follow: false },
};

// Iframe-breakout script. If GHL's calendar widget redirects to this URL
// from inside the iframe on /book, this synchronous script forces the
// top-level browser to navigate here, so GTM/GA4 fires on the canonical
// /call-confirmed URL (not on a hidden iframe load).
const breakoutScript =
  "if(window.top!==window.self){window.top.location.href=window.location.href;}";

export default function CallConfirmedPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: breakoutScript }} />
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <QuestionnaireSection />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 md:pt-24 md:pb-10">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">
          You&apos;re booked
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.08] text-[#111111]">
          Quick Chat confirmed.
        </h1>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          Adam will see you at the time you chose. While you&apos;re
          here, a few short questions help him prepare so the
          conversation lands faster. Six questions, takes about three
          minutes.
        </p>
      </div>
    </section>
  );
}

function QuestionnaireSection() {
  return (
    <section className="bg-[#F9FAFB] border-t border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Before the call
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10">
          A few questions so Adam can prepare.
        </h2>
        <QuestionnaireForm />
      </div>
    </section>
  );
}
