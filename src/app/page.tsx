import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import SubscribeForm from "@/components/SubscribeForm";

const DIAGNOSTIC_URL = "/diagnostic";
const DIAGNOSTIC_CTA_LABEL = "Find MY Marketing Bottleneck";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title:
    "Adam Sowden — Reclaim 36 Hours a Week by Replacing Yourself in Your Marketing",
  description:
    "AI marketing systems that write, publish, engage, and qualify while you do something else. Built for business owners trapped in their own marketing.",
};

const homeFaqItems = [
  {
    question: "What is the Marketing Bottleneck Diagnostic?",
    answer:
      "An 18-question AI-led conversation that identifies exactly where your marketing is owner-dependent and what it is costing you. Takes seven to ten minutes. At the end you get a personalised written report with a Strategy Gaps section, an AI Transformation assessment, an Effort vs Impact map, a Fix Sequence, and three things you can do this week without help. The report is emailed to you and shown on screen.",
  },
  {
    question: "What is a zero-dependency marketing system?",
    answer:
      "A marketing operation that runs without the owner. It produces, publishes, distributes, qualifies, and converts on autopilot. The standard is the Holiday Test: leave your marketing for a year, come back, and find it has continued at the same level. If it stops the moment you stop, it is a job, not a system.",
  },
  {
    question: "Why don't off-the-shelf AI tools fix this?",
    answer:
      "Off-the-shelf AI is not trained on your specific business. The output sounds like every other business using the same tool. The subscription is low. The positioning loss is high. The fix is AI trained on your voice, your methodology, and your proof points. A system built for you, not a tool sold to everyone.",
  },
  {
    question: "How is this different from hiring a marketing agency?",
    answer:
      "An agency works for you. A system works without you. Agencies require briefings, approvals, and ongoing direction from the owner. When the owner goes away, the agency slows down. A zero-dependency system does not. It is also a permanent asset, not a monthly expense that disappears when you stop paying.",
  },
  {
    question: "Do I need to buy all three products?",
    answer:
      "No. Each product solves a different part of the marketing system. The diagnostic will tell you which one removes the most owner time in your business first. Many owners start with Marketing Agents because the result is visible within the first week.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Marketing Agents produce visible output within the first week. The Content Ecosystem typically generates inbound conversations within 30 to 60 days. The Marketing Ecosystem takes 60 to 90 days to reach full operational independence. All timelines are documented before work begins.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqItems.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <ProofBar />
        <TheProblem />
        <TheMethodology />
        <TheProducts />
        <TrustCluster />
        <HomeFAQ />
        <FinalCTA />
        <SubscribeStrip />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16 items-center">
        <div>
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
            Zero-Dependency Marketing System
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[1.02] text-[#111111]">
            Reclaim <span className="text-[#188bf6]">36 Hours</span> a Week by
            Replacing Yourself in Your Marketing
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-2xl leading-relaxed">
            AI systems trained on your business that write, publish, engage, and
            qualify while you do something else. Built for business owners who
            are tired of being the bottleneck in their own growth.
          </p>
          <p className="mt-3 text-sm font-semibold text-[#0d9488]">
            Currently working with a limited number of new clients per quarter.
          </p>
          <div className="mt-10">
            <CTAButton size="lg" href={DIAGNOSTIC_URL}>
              {DIAGNOSTIC_CTA_LABEL}
            </CTAButton>
            <p className="mt-3 text-xs text-black/55 max-w-md">
              Free. Seven to ten minutes. AI-led diagnostic with a personalised
              written report at the end.
            </p>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border border-black/5 shadow-sm">
            <Image
              src="/adam-hero.jpg"
              alt="Adam Sowden"
              fill
              priority
              sizes="(min-width: 768px) 320px, 256px"
              className="object-cover object-[center_20%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofBar() {
  const stats = [
    { value: "$1B+", label: "in client pipelines generated" },
    { value: "36 hrs", label: "reclaimed from Adam's own week" },
    { value: "10x", label: "lead quality for advisor clients" },
  ];
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-6xl px-6 py-14 grid sm:grid-cols-3 gap-10">
        {stats.map((s) => (
          <div key={s.value} className="text-center sm:text-left">
            <div className="font-serif text-4xl md:text-5xl tracking-tight text-[#111111]">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-black/60">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Problem
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Owner dependency caps growth. Then AI made it worse.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Most business owners built a job, not a business. Every campaign,
          every piece of content, every client requires the owner. The ceiling
          is defined entirely by one person&apos;s available hours.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-xl font-semibold mb-4">The Owner Trap</h3>
            <p className="text-[#111111]/70 leading-relaxed">
              Most business owners didn&apos;t set out to build a job. They
              built one anyway. Every new client, every campaign, every piece
              of content requires the owner. Growth hits a ceiling defined
              entirely by one person&apos;s available hours. The trap tightens
              as the business grows. The cost is not just time. It is the
              growth that never happened.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Cheap Tools, Expensive Consequences
            </h3>
            <p className="text-[#111111]/70 leading-relaxed">
              AI marketing tools were supposed to fix this. They made it
              worse. Off-the-shelf AI is not trained on the business that
              uses it. The output sounds like every other business using
              the same tool. The subscription is cheap. The positioning
              loss is not. Generic AI does not remove the owner from the
              loop. It just gives the owner more content to approve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TheMethodology() {
  const filters = [
    {
      n: "01",
      title: "Improves the outcome",
      body:
        "Output is better than a skilled human could produce alone. Not faster. Better.",
    },
    {
      n: "02",
      title: "Standardises delivery",
      body:
        "Consistent, reliable result every time, regardless of context or volume.",
    },
    {
      n: "03",
      title: "Eliminates owner dependency",
      body:
        "Runs without the owner being present. No initiation, no supervision, no approval.",
    },
    {
      n: "04",
      title: "Stays current",
      body:
        "Documented update process that runs without daily owner involvement. A permanent asset, not a depreciating one.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Methodology
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          The Four-Filter Rule.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Every AI implementation must pass all four tests before it gets
          built. If it fails any one, it is not worth building.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {filters.map((f) => (
            <div
              key={f.n}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <div className="text-sm text-[#188bf6] font-mono font-medium">
                {f.n}
              </div>
              <div className="mt-2 text-xl font-semibold">{f.title}</div>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheProducts() {
  const products = [
    {
      tag: "Lead response",
      title: "The Speed-to-Lead Agent",
      benefit: "Be the first to reply. Every single time.",
      body:
        "Every lead that contacts you expects a reply in minutes, not hours. An AI agent watches your forms, email, and SMS around the clock and responds with a personalised, contextual message before your competitor even sees the notification.",
      quote:
        "We were losing roughly half our enquiries to slow response. Within a week of switching this on, every lead got a personal reply inside a minute. Our booking rate jumped from 18% to 47%.",
      name: "Sarah R.",
      role: "Business Coach, Melbourne",
      initials: "SR",
    },
    {
      tag: "Prospecting",
      title: "The Outreach Agent",
      benefit: "Reach prospects before your competitors do.",
      body:
        "Your prospects are out there. This agent finds them, starts a personalised conversation across email, SMS, LinkedIn, or direct mail, and books them into your calendar.",
      quote:
        "We stopped doing manual outreach in February. By April my calendar was fuller than it had been all of last year, and I hadn't sent a single message myself.",
      name: "Tom W.",
      role: "Accountant, Adelaide",
      initials: "TW",
    },
    {
      tag: "Self-serve",
      title: "Marketing Agents",
      benefit: "Stop writing your own ads, emails, and newsletters.",
      body:
        "Pre-built AI marketing workers trained on your business. The Ad Copywriter, the Email Sequence Writer, the Newsletter Writer. Each runs without the owner. Buy one agent at a time. No sales call required.",
      quote:
        "I was spending 6 hours every Sunday writing content. The Ad Copywriter agent now does it in 20 minutes and the quality is better than anything I was producing myself.",
      name: "James M.",
      role: "Financial Adviser, Sydney",
      initials: "JM",
    },
    {
      tag: "Inbound",
      title: "The Content Ecosystem",
      benefit: "Turn one idea a week into a full inbound marketing engine.",
      body:
        "The complete inbound infrastructure. A Living AI Website that updates itself. One core idea a week, written, published, and broadcast across every channel. Every reader becomes a conversation through the embedded Participation Layer.",
      quote:
        "We went from zero inbound leads to 14 qualified conversations in the first 60 days. The system runs every week without me touching it.",
      name: "Rachel B.",
      role: "Consultant, Auckland",
      initials: "RB",
    },
    {
      tag: "Outbound",
      title: "The Marketing Ecosystem",
      benefit: "Replace your agency and your own involvement at the same time.",
      body:
        "The in-house marketing agency function, run as a system. Paid acquisition across platforms, social distribution, and broader marketing operations. Takes the content to market without an agency or an owner in the loop.",
      quote:
        "We cut our agency retainer and got better results. The system is more consistent than any agency we've worked with because it never has a bad month.",
      name: "David K.",
      role: "Mortgage Broker, Brisbane",
      initials: "DK",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Five ways in
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Five modular products. Buy the ones that fit.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Not a ladder. Each product solves a different part of the
          marketing system. The methodology is shared. The standard is
          the same. The diagnostic tells you which one to start with.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {products.map((p) => (
            <div
              key={p.title}
              className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 flex flex-col"
            >
              <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
                {p.tag}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111]">
                {p.title}
              </h3>
              <p className="mt-3 text-[#188bf6] font-semibold leading-snug">
                {p.benefit}
              </p>
              <p className="mt-3 text-[#111111]/70 leading-relaxed flex-1">
                {p.body}
              </p>

              <figure className="mt-6 rounded-xl bg-[#0a0f1e] p-5">
                <blockquote className="text-sm italic text-white/85 leading-relaxed">
                  &ldquo;{p.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#188bf6] text-white text-xs font-bold">
                    {p.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-sm font-semibold text-white">
                      {p.name}
                    </span>
                    <span className="block text-xs text-white/55">
                      {p.role}
                    </span>
                  </span>
                </figcaption>
              </figure>

              <div className="mt-6">
                <CTAButton variant="ghost" href={DIAGNOSTIC_URL}>
                  {DIAGNOSTIC_CTA_LABEL}
                </CTAButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustCluster() {
  const signals = [
    {
      label: "SSL Secured",
      icon: (
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      ),
    },
    {
      label: "No lock-in contracts",
      icon: <polyline points="20 6 9 17 4 12" />,
    },
    {
      label: "5-10 min diagnostic, no pitch",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      ),
    },
    {
      label: "$1B+ in client pipelines",
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ),
    },
    {
      label: "Privacy protected",
      icon: (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      ),
    },
  ];

  return (
    <section className="bg-white border-y border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {signals.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 text-sm text-black/60 font-medium"
          >
            <svg
              className="w-[18px] h-[18px] text-[#0d9488] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {s.icon}
            </svg>
            {s.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeFAQ() {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Common questions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-4">
          Answers to what you&apos;re probably thinking right now.
        </h2>
        <p className="text-base md:text-lg text-[#111111]/70 leading-relaxed mb-10">
          These are the questions every business owner asks before starting.
          Read them before deciding.
        </p>
        <div className="space-y-4">
          {homeFaqItems.map((f, i) => (
            <details
              key={i}
              className="group bg-white border border-black/10 rounded-xl p-6 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg text-[#111111] leading-snug">
                  {f.question}
                </h3>
                <span className="mt-1 text-[#188bf6] text-xl select-none transition-transform group-open:rotate-45 leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 text-[#111111]/80 leading-relaxed whitespace-pre-line">
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
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Ready to remove yourself from your marketing?
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          We don&apos;t need another AI tool.
          <br />
          We need a business that runs without us.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          The Marketing Bottleneck Diagnostic is the fastest way to see exactly
          where your marketing is owner-dependent and what it is costing you.
          Seven to ten minutes. No pitch.
        </p>

        <figure className="mt-10 mx-auto max-w-2xl text-left rounded-xl bg-[#F9FAFB] border-l-4 border-[#188bf6] px-6 py-5">
          <blockquote className="text-base md:text-lg italic text-[#111111] leading-relaxed">
            &ldquo;I expected another generic quiz. I left with a clear picture
            of exactly where my marketing was leaking and a specific sequence
            to fix it. I hadn&apos;t had that clarity in three years of
            running the business.&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-sm font-semibold text-black/60">
            Michael T., Principal, Financial Planning Practice, Perth
          </figcaption>
        </figure>

        <div className="mt-10 flex flex-col items-center gap-3">
          <CTAButton size="lg" href={DIAGNOSTIC_URL}>
            {DIAGNOSTIC_CTA_LABEL}
          </CTAButton>
          <p className="text-xs text-black/55">
            Free. Seven to ten minutes. AI-led. Instant personalised report.
          </p>
        </div>
      </div>
    </section>
  );
}

function SubscribeStrip() {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24 text-center">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Weekly essay
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          One short email each Monday. One idea. No filler.
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          The Owner Trap, The Four Bad Options, The Methodology Is the
          Product. One essay a week on building marketing that runs without
          you.
        </p>
        <div className="mt-8 max-w-xl mx-auto text-left">
          <SubscribeForm buttonLabel="Send ME the Monday Essay" />
        </div>
      </div>
    </section>
  );
}
