import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, WAITLIST_URL } from "@/lib/site";

const PAGE_PATH = "/products/marketing-ecosystem";
const CTA_LABEL = "Join the Waiting List";
const CTA_HREF = WAITLIST_URL;

export const metadata: Metadata = {
  title: "The Marketing Ecosystem | A High-End Marketing Team, Owned as a System",
  description:
    "Run your paid acquisition and distribution as a system built on your methodology and owned by your business. One campaign placed over $1B in a client's pipeline.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { url: PAGE_PATH, title: "The Marketing Ecosystem" },
};

// AEO: self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "The Marketing Ecosystem runs a business's paid acquisition and distribution as a system built on the owner's methodology and owned by the business. It handles campaign architecture, copy, targeting, social distribution, and day-to-day campaign operations. The campaign intelligence and trained voice stay inside the business permanently rather than inside an agency. It is built per client and is not yet publicly available.";

const faqItems = [
  {
    question: "How is this different from the agency I already have?",
    answer:
      "Two ways, and the second matters more than the first. The work is comparable to a strong agency's output, built on your methodology rather than a template. The difference is that everything the work generates stays inside your business: the campaign architecture, the trained voice, the record of what converted and why. And every decision is visible. You are shown which audience, which angle, and why the spend moved, rather than being told a campaign is performing and left to take it on trust.",
  },
  {
    question: "What happens if we stop working together?",
    answer:
      "You keep the system. The campaign architecture, the trained voice, and everything it has learned about your market were built inside your business and stay there. Ad spend and running costs continue the way they would for any infrastructure you own, but the capability itself no longer depends on a relationship continuing.",
  },
  {
    question: "We are a licensed firm. How is compliance handled?",
    answer:
      "Compliance rules are configured into the system before a single campaign runs: what can and cannot be claimed, required disclaimers, restricted framing for your licence. Nothing goes live without your approval, and every piece that runs is logged. For advisory firms, that means the campaigns move fast without ever moving outside your obligations.",
  },
  {
    question: "How much of my involvement does it need?",
    answer:
      "Strategy and approvals. You agree the campaign direction, review what is queued, and read a report that tells you plainly what happened and why. The operating work, the daily decisions, and the optimisation run inside the system. If you are currently in the middle of campaign decisions you never wanted to be part of, that is the specific involvement this removes.",
  },
  {
    question: "What does it cost?",
    answer:
      "The system is priced per build, scoped to your campaigns. Ad spend is separate and stays in your control: you set the budget, it goes directly to the platforms, and the system runs at any spend level. The system cost replaces what you would pay the people running your campaigns. The ad budget was always going to be yours either way.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Marketing Ecosystem",
  description: ANSWER_FIRST,
  category: "AI marketing software",
  brand: { "@type": "Brand", name: "Adam Sowden" },
  url: `${SITE_URL}${PAGE_PATH}`,
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${SITE_URL}/products`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "The Marketing Ecosystem",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function MarketingEcosystemPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <TheProblem />
        <WhatItIs />
        <WhatItDoes />
        <Proof />
        <HowItFits />
        <TheStandard />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          The Marketing Ecosystem
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          The results of a high-end marketing team, for less than the cost of a
          VA.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          The Marketing Ecosystem runs your paid acquisition and distribution as
          a system built on your methodology and owned by your business. No
          retainer that rents you a capability, no team to manage, no agency
          holding the knowledge of what works. One campaign built on it placed
          over $1 billion in prospect assets into a single client&apos;s
          pipeline.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg" href={CTA_HREF}>
            {CTA_LABEL}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Problem
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          You are renting your marketing.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Agency marketing has a structural problem. The strategy, the
            templates, the campaign architecture, and the accumulated knowledge
            of what works for your audience all live inside the agency&apos;s
            business. When the relationship ends, that capability leaves with
            it, and you pay again to rebuild it somewhere else. Most owners have
            done this rebuild more than once without naming what it is: rent.
          </p>
          <p>
            Building in-house solves the ownership problem and creates a larger
            one. Good marketing people are hard to find at any price most
            businesses can afford, and even when the hire works, someone still
            has to direct, review, and correct them. That someone is you.
          </p>
          <p className="text-[#111111] font-medium">
            Both options leave the same thing broken. The asset never belongs to
            the business, and the marketing never runs without your attention on
            it.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItIs() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What It Is
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Like a small in-house agency running your paid ads and campaigns,
          except it is a system, not a team.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The Marketing Ecosystem takes whatever content your business
            produces, whether that comes from the Content Ecosystem, from your
            AI marketing team, or from your own work, and runs the campaigns
            that put it in front of the right audience at the right cost.
          </p>
          <p>
            The difference from every arrangement you have tried is where the
            capability lives. The campaign architecture, the targeting logic,
            and everything the system learns about your market are built inside
            your business from day one. They stay there permanently, whether or
            not a retainer is in place.
          </p>
          <p>
            It is built from three sources: your methodology, voice, and proof
            points, so the campaigns could only belong to your business. The
            principles of the greatest marketers in history, so the execution
            meets a standard most agencies never reach. And your industry&apos;s
            best practices, so it runs on what already works in your market
            rather than a generic playbook.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItDoes() {
  const items = [
    {
      title: "Paid acquisition",
      body: "Campaign architecture, copy, targeting, and ongoing performance management across ad platforms. Built on your specific offer, your audience, and your voice. What the system learns about your market compounds inside your business, campaign after campaign.",
    },
    {
      title: "Social distribution",
      body: "Systematic distribution of your content to the people most likely to act on it. The system takes what your business has already produced and puts it in front of the right audience, consistently, on the platforms they use.",
    },
    {
      title: "Campaign operations",
      body: "The day-to-day work that would otherwise need a small agency or an in-house team: tracking, reporting, and optimisation, run to a consistent standard every week. You see what is working, what changed, and why.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Does
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Your acquisition, run as a system.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-[#111111]">
                {it.title}
              </h3>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">
                {it.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="bg-[#0a0f1e]">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          $1 billion in one client&apos;s pipeline.
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-white/10 py-10">
          <Stat value="10x" label="average lead asset value ($1M to $10M)" />
          <Stat value="$100M+" label="single leads (previous record $42M)" />
          <Stat value="30 to 50%" label="lower cost per lead" />
        </div>
        <div className="mt-12 max-w-3xl mx-auto space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            A financial advisory client moved their acquisition onto this
            system. Average lead asset value went from $1 million to $10 million
            within months, on the same platforms and the same budget. Before the
            rebuild, the largest single lead in the firm&apos;s history held $42
            million in assets. The system has since produced leads at $36
            million, $63 million, $87 million, and above $100 million, and the
            campaigns behind them placed over $1 billion in total prospect
            assets into the pipeline. Cost per lead fell 30 to 50 percent while
            the quality rose. Another client closed 8 sales in a single month at
            a minimum client value of $50,000.
          </p>
          <p className="text-white font-medium">
            The mechanism was not a new ad platform or a bigger budget. We
            simulated the firm&apos;s ideal client, critiqued every piece of
            campaign language from that perspective, and rebuilt it in the words
            the prospect uses to describe their own situation. The campaigns
            started landing with a different calibre of prospect, and the
            numbers above followed.
          </p>
        </div>
        {/* TODO: testimonial from the advisory client, speaking to lead QUALITY
            and to knowing WHY the campaigns work. Both points matter for this
            buyer. Awaiting an approved testimonial. */}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-4xl md:text-5xl tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-sm text-white/60 leading-snug">{label}</div>
    </div>
  );
}

function HowItFits() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          How It Fits With The Other Products
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          The paid side amplifies everything the organic side builds.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The Marketing Ecosystem runs from any content source, and it
            connects directly with the{" "}
            <Link
              href="/products/content-ecosystem"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#0d78dc] transition"
            >
              Content Ecosystem
            </Link>
            . The Content Ecosystem produces one core idea each week: a
            long-form piece, a companion email, and the social layer. The
            Marketing Ecosystem takes that material and runs the campaigns that
            put it in front of the right people, so the paid side amplifies
            everything the organic side builds.
          </p>
          <p>
            The{" "}
            <Link
              href="/diagnostic"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#0d78dc] transition"
            >
              Diagnostic Tool
            </Link>{" "}
            qualifies every prospect who responds. The{" "}
            <Link
              href="/products/speed-to-lead-agent"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#0d78dc] transition"
            >
              Speed-to-Lead Agent
            </Link>{" "}
            follows up within seconds, using the prospect&apos;s own intake to
            personalise the reply. A business running all three moves a prospect
            from first awareness to a qualified conversation without you in the
            middle of any step.
          </p>
        </div>
      </div>
    </section>
  );
}

function TheStandard() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Standard It Runs To
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111]">
          You should be able to leave your marketing for a year, come back, and
          find it produced, distributed, qualified, and converted at the level
          it ran the day you left.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 leading-relaxed">
          Every component of the Marketing Ecosystem is built to that standard.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="bg-white border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4 text-center">
          Common questions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10 text-center">
          What high-ticket owners ask before they commit.
        </h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details
              key={i}
              className="group bg-[#F9FAFB] border border-black/10 rounded-xl p-6 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg text-[#111111] leading-snug">
                  {f.question}
                </h3>
                <span className="mt-1 text-[#188bf6] text-xl select-none transition-transform group-open:rotate-45 leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 text-[#111111]/80 leading-relaxed">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Built per client, one build at a time.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          The Marketing Ecosystem is not yet publicly available. Join the
          waiting list and you will be first in line when a build slot opens,
          with the case studies as they are released along the way.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg" href={CTA_HREF}>
            {CTA_LABEL}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
