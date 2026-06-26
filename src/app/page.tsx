import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import SubscribeForm from "@/components/SubscribeForm";

const DIAGNOSTIC_URL = "/diagnostic";
const DIAGNOSTIC_CTA_LABEL = "Get MY AI Marketing Implementation Plan";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title:
    "Adam Sowden — Autonomous AI Marketing Systems for Business Owners",
  description:
    "Win more sales with autonomous AI marketing systems you actually control. AI marketing automation that writes, publishes, follows up, and books prospects for service-business owners.",
};

const homeFaqItems = [
  {
    question: "What is the AI Marketing Diagnostic?",
    answer:
      "An 18-question AI-led conversation that identifies where AI marketing automation will have the biggest impact in your business right now. Takes seven to ten minutes. At the end you get a personalised written implementation plan covering where AI fits first, an Effort vs Impact map, a three-action Fix Sequence, and three micro-actions you can take this week without help. The report is shown on screen and emailed to you.",
  },
  {
    question: "What is an autonomous AI marketing system?",
    answer:
      "Software that handles your marketing for you, around the clock, trained specifically on your business. It writes content, publishes it, follows up with prospects, qualifies leads, and books meetings. You set the strategy and approve direction. The system handles every detail of implementation. You stay in control. You stop doing the work.",
  },
  {
    question: "Why don't off-the-shelf AI tools fix this?",
    answer:
      "Off-the-shelf AI is not trained on your specific business. The output sounds like every other business using the same tool. Your positioning gets lost in the noise. The subscription is low. The lost sales are not. The fix is AI trained on your voice, your offers, and your methodology. A system built for you, not a tool sold to everyone.",
  },
  {
    question: "How is this different from hiring a marketing agency?",
    answer:
      "An agency works for you. A system works without you. Agencies require briefings, approvals, and ongoing direction from the owner. When the owner goes away, the agency slows down. An autonomous AI marketing system does not. It is also a permanent asset that compounds, not a monthly expense that disappears the moment you stop paying.",
  },
  {
    question: "Do I need to buy all six automations?",
    answer:
      "No. Each automation handles a different part of the marketing job. Start with the one that will move your sales fastest. The AI Marketing Diagnostic tells you which one that is for your specific business.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "Your Own AI Marketing Department produces visible output within the first week. The Site Conversation Agent starts qualifying visitors within hours of going live. The Content Ecosystem typically generates inbound conversations within 30 to 60 days. The Marketing Ecosystem takes 60 to 90 days to reach full operational independence. All timelines are documented before work begins.",
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
            AI marketing that works while you sleep
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[1.02] text-[#111111]">
            Win <span className="text-[#188bf6]">More Sales</span> with
            Autonomous AI Marketing Systems You Actually Control
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-2xl leading-relaxed">
            AI marketing automation trained on your specific business. It
            writes, publishes, follows up, and books prospects, automatically.
            You direct the strategy. The system handles every detail. Built for
            business owners who want results without becoming a marketing
            department.
          </p>
          <p className="mt-3 text-sm font-semibold text-[#0d9488]">
            Currently working with a limited number of new clients per quarter.
          </p>
          <div className="mt-10">
            <CTAButton size="lg" href={DIAGNOSTIC_URL}>
              {DIAGNOSTIC_CTA_LABEL}
            </CTAButton>
            <p className="mt-3 text-xs text-black/55 max-w-md">
              Free. Seven to ten minutes. AI Marketing Diagnostic with a
              personalised implementation plan at the end.
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
          Most AI marketing tools make the problem worse, not better.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          You bought AI tools to get more sales without more work. They
          delivered more work to approve, not more sales. The real fix is not
          a tool. It is a system that runs your marketing for you, with you
          directing the strategy.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-xl font-semibold mb-4">The Time Trap</h3>
            <p className="text-[#111111]/70 leading-relaxed">
              You bought AI tools to save time. They generated more content
              for you to approve, more copy for you to brand, more outputs
              for you to sign off. Every piece still needs your attention.
              You are still the bottleneck, now with extra steps. The sales
              you wanted have not materialised. The hours you wanted back are
              gone.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Cheap Tools, Expensive Consequences
            </h3>
            <p className="text-[#111111]/70 leading-relaxed">
              Off-the-shelf AI is not trained on your specific business. The
              output sounds like every other business using the same tool.
              Your positioning gets lost in the noise. The subscription is
              cheap. The lost positioning, the missed sales, and the wasted
              hours are not. Generic AI is a tool. You need a system that
              actually delivers results.
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
      title: "Runs without the owner",
      body:
        "The system executes without you needing to be present. You direct the strategy, you do not run the implementation. No initiation, no supervision, no approval loops.",
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
  // Testimonials removed pending real, attributable client quotes.
  // When they arrive, re-add a `quote`/`name`/`role`/`initials` field per
  // product and restore the testimonial <figure> in the card render below.
  const products = [
    {
      tag: "Lead response",
      title: "The Speed-to-Lead Agent",
      benefit: "Be the first to reply. Every single time.",
      body:
        "Every lead that contacts you expects a reply in minutes, not hours. An AI agent watches your forms, email, and SMS around the clock and responds with a personalised, contextual message before your competitor even sees the notification.",
    },
    {
      tag: "Engagement",
      title: "The Outreach Agent",
      benefit: "Turn audience engagement into real conversations.",
      body:
        "People comment on your posts, reply to your emails, react on social. Most of those signals go nowhere because you don't have time. This agent picks them up and continues the conversation in the right channel, building relationships with people who already raised their hand.",
    },
    {
      tag: "Site conversion",
      title: "The Site Conversation Agent",
      benefit: "Turn every visitor into a real conversation. No more contact forms.",
      body:
        "An AI chat embedded on every page that engages every visitor in a real conversation about their situation, qualifies them, educates them on the offer, and books appointments directly into your calendar. Replaces static contact forms, low-quality chatbots, manual FAQs, and sales pages that don't convert. Embeds into any platform.",
    },
    {
      tag: "Self-serve",
      title: "Your Own AI Marketing Department",
      benefit: "AI writes your ads, emails, newsletters, LinkedIn posts, scripts. You approve. It ships.",
      body:
        "Pre-built AI marketing workers trained on your business voice, methodology, and ideal customer. Ad copywriter, email sequence writer, newsletter writer, LinkedIn post writer, script writers, and more. Each runs without the owner. Buy one worker at a time. No sales call required.",
    },
    {
      tag: "Inbound",
      title: "The Content Ecosystem",
      benefit: "Turn one idea a week into a full inbound marketing engine.",
      body:
        "The complete inbound infrastructure. Three pieces: a Living AI Website that updates itself, the Weekly Content Engine that produces one core idea a week, and the Diagnostic Tool that captures intent and qualifies before the first human conversation. Composes with the Site Conversation Agent: the ecosystem produces the content, the agent turns every reader into a conversation.",
    },
    {
      tag: "Outbound",
      title: "The Marketing Ecosystem",
      benefit: "AI replaces your agency. Better results, lower cost, more consistency.",
      body:
        "The in-house marketing agency function, run as a system. Paid acquisition across platforms, social distribution, and broader marketing operations. Takes the content to market without an agency or an owner in the loop.",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          AI marketing automations
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Six AI marketing automations. Buy the ones that fit.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Not a ladder. Each automation handles a different part of the
          marketing job. The architecture is shared. The standard is the
          same. The AI Marketing Diagnostic tells you which one will move
          your sales fastest.
        </p>

        <div className="mt-14 flex flex-wrap justify-center gap-6 md:gap-8">
          {products.map((p) => (
            <div
              key={p.title}
              className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 flex flex-col w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
            >
              <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
                {p.tag}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] leading-tight md:min-h-[3.25rem] lg:min-h-[4rem]">
                {p.title}
              </h3>
              <p className="mt-3 text-[#188bf6] font-semibold leading-snug md:min-h-[3rem]">
                {p.benefit}
              </p>
              <p className="mt-3 text-[#111111]/70 leading-relaxed flex-1">
                {p.body}
              </p>

              <div className="mt-8">
                <CTAButton variant="ghost" href={DIAGNOSTIC_URL} fullWidth>
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
      label: "7-10 min AI Marketing Diagnostic, no pitch",
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
          Ready to put your marketing on autopilot?
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Stop building marketing.
          <br />
          Start running it.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          The AI Marketing Diagnostic is the fastest way to see where AI could
          be running your marketing right now, where it would deliver the
          biggest lift in sales, and where to start. Seven to ten minutes. No
          pitch.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <CTAButton size="lg" href={DIAGNOSTIC_URL}>
            {DIAGNOSTIC_CTA_LABEL}
          </CTAButton>
          <p className="text-xs text-black/55">
            Free. Seven to ten minutes. AI Marketing Diagnostic. Instant
            personalised implementation plan.
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
          How autonomous AI marketing systems work, where off-the-shelf
          tools fail, and the architecture behind marketing that runs without
          you. One essay a week.
        </p>
        <div className="mt-8 max-w-xl mx-auto text-left">
          <SubscribeForm buttonLabel="Send ME the Monday Essay" />
        </div>
      </div>
    </section>
  );
}
