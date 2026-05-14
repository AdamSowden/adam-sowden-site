import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import SubscribeForm from "@/components/SubscribeForm";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
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
        <FinalCTA />
      </main>
      <SiteFooter />
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
          <div className="mt-10 flex flex-wrap gap-4">
            <CTAButton size="lg">Book a Quick Chat</CTAButton>
            <CTAButton href="/about" variant="ghost" size="lg">
              Read the methodology
            </CTAButton>
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
