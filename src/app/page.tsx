import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import SubscribeForm from "@/components/SubscribeForm";
import ChatWidget from "@/components/ChatWidget";
import JumpToChat from "@/components/JumpToChat";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const homeFaqItems = [
  {
    question: "What is a zero-dependency marketing system?",
    answer:
      "A marketing operation that runs without the owner. It produces, publishes, distributes, qualifies, and converts on autopilot. The standard is the Holiday Test: an owner should be able to leave their marketing for a year, come back, and find it has continued at the same level. If the marketing stops the moment the owner stops, it's not a system. It's a job.",
  },
  {
    question: "Why don't AI marketing tools fix the problem?",
    answer:
      "Off-the-shelf AI is not trained on the specific business that uses it. The output sounds like every other business using the same tool. Cheap tools, expensive consequences. The subscription is low. The positioning loss is high. The fix is AI trained on the owner's voice, methodology, and proof points. A system, not a tool.",
  },
  {
    question: "What are the three Adam Sowden products?",
    answer:
      "Three modular AI products that solve different parts of the marketing system. Marketing Agents are self-serve AI workers for specific marketing tasks (ad copywriter, email sequence writer, newsletter writer). The Content Ecosystem is the complete inbound infrastructure: Living AI Website, weekly content engine, Participation Layer. The Marketing Ecosystem is the outbound replacement: paid acquisition, social distribution, broader marketing operations run as a system. Buy one, two, or all three. Not a ladder.",
  },
  {
    question: "What is The Owner Trap?",
    answer:
      "The structural condition that the owner is both operator and brand at the same time. When the owner runs the marketing, the brand becomes whatever the owner has time to produce. Rarely enough. Never consistent. The owner cannot scale the marketing without scaling themselves, and they cannot scale themselves. The fix is removing the owner from delivery, structurally and permanently.",
  },
  {
    question: "How is this different from hiring a marketing agency?",
    answer:
      "An agency rents out the work. The strategy, templates, trained voice, and institutional knowledge live inside the agency, not inside the business. When the relationship ends, the asset leaves. The cost stays. The Marketing Ecosystem produces the same outbound work as an agency but the IP, voice, and methodology stay inside the business. You own the asset.",
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
        <SubscribeStrip />
        <HomeFAQ />
        <AskAdamsAI />
        <FinalCTA />
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
            Marketing Systems That Run Without You
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-2xl leading-relaxed">
            World-class marketing automation for less than the cost of a VA.
            AI systems that write, publish, engage, and qualify, while we
            do something else.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <JumpToChat />
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

        <div className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-xl font-semibold mb-4">The Owner Trap</h3>
            <p className="text-[#111111]/70 leading-relaxed">
              Most business owners didn&apos;t set out to build a job. They
              built one anyway. Every new client, every campaign, every piece
              of content requires the owner. Growth hits a ceiling defined
              entirely by one person&apos;s available hours. The trap tightens
              as the business grows.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Cheap Tools, Expensive Consequences</h3>
            <p className="text-[#111111]/70 leading-relaxed">
              AI marketing tools were supposed to fix this. They made it
              worse. Off-the-shelf AI is not trained on the business that
              uses it. The output sounds like every other business using
              the same tool. The subscription is cheap. The positioning
              loss is not.
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
        "Consistent, reliable result every time — regardless of context or volume.",
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
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Three ways in
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Three modular products. Buy one, two, or all three.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Not a ladder. Each product solves a different part of the
          marketing system. The methodology is shared. The standard is
          the same.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 flex flex-col">
            <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-medium mb-3">
              Self-serve
            </p>
            <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111]">
              Marketing Agents
            </h3>
            <p className="mt-4 text-[#111111]/70 leading-relaxed flex-1">
              Pre-built AI marketing workers. Buy one agent at a time.
              The Ad Copywriter, the Email Sequence Writer, the
              Newsletter Writer. Each trained on the business. Each runs
              without the owner. No sales call required.
            </p>
            <div className="mt-6">
              <CTAButton variant="ghost">Start with one agent</CTAButton>
            </div>
          </div>

          <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 flex flex-col">
            <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-medium mb-3">
              Inbound
            </p>
            <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111]">
              The Content Ecosystem
            </h3>
            <p className="mt-4 text-[#111111]/70 leading-relaxed flex-1">
              The complete inbound infrastructure. A Living AI Website.
              One core idea a week, written, published, broadcast.
              Embedded across every page sits the Participation Layer.
              Every reader becomes a conversation.
            </p>
            <div className="mt-6">
              <CTAButton variant="ghost">See if it fits</CTAButton>
            </div>
          </div>

          <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 flex flex-col">
            <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-medium mb-3">
              Outbound
            </p>
            <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111]">
              The Marketing Ecosystem
            </h3>
            <p className="mt-4 text-[#111111]/70 leading-relaxed flex-1">
              The in-house marketing agency function, run as a system.
              Paid acquisition across platforms, social distribution,
              and broader marketing operations. Takes the content to
              market without an agency or an owner in the loop.
            </p>
            <div className="mt-6">
              <CTAButton variant="ghost">Talk to Adam</CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscribeStrip() {
  return (
    <section className="bg-white border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Weekly essay
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          One short email each Monday. One idea. No filler.
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          The Owner Trap, The Four Bad Options, The Methodology Is the
          Product. We write one essay a week on building marketing that
          runs without us, then send it on Monday morning.
        </p>
        <div className="mt-8">
          <SubscribeForm buttonLabel="Subscribe" />
        </div>
      </div>
    </section>
  );
}

function HomeFAQ() {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Frequently asked
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10">
          Common questions about the system.
        </h2>
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

function AskAdamsAI() {
  // Receiving section for the JumpToChat anchor (`#ask-adam`). Hosts the
  // same Anthropic-backed ChatWidget that lives on every blog post, so a
  // reader can engage the AI without first clicking through to a post.
  // `scroll-mt-24` keeps the widget clear of the sticky SiteNav when
  // scrolled to via the in-page anchor.
  return (
    <section
      id="ask-adam"
      className="scroll-mt-24 bg-white border-t border-black/5"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <div className="text-center mb-10">
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-4">
            Ask the AI
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
            Got a marketing question? Ask Adam&apos;s AI.
          </h2>
          <p className="mt-5 text-base md:text-lg text-[#111111]/70 max-w-xl mx-auto leading-relaxed">
            Trained on Adam&apos;s methodology, voice, and proof points. Not a
            generic chatbot. Ask anything about marketing systems, the three
            products, or the Owner Trap.
          </p>
        </div>
        {/* No article context on home — the widget supplies the
            opening "What do you help with today?" prompt and the
            server-side chat-prompt.ts gracefully handles a missing
            article. */}
        <ChatWidget article={{}} />
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          We don&apos;t need another AI tool.
          <br />
          We need a business that runs without us.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          A 20-minute Quick Chat. No pitch. We look at where owner dependency
          is costing us growth and what becomes possible when it&apos;s
          removed.
        </p>
        <div className="mt-10 inline-flex">
          <CTAButton size="lg">Book a Quick Chat</CTAButton>
        </div>
      </div>
    </section>
  );
}
