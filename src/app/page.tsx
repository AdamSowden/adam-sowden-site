import Link from "next/link";

const BOOKING_URL =
  "https://api.leadconnectorhq.com/widget/booking/vvT3ua4em90YPymNy0Lf";

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
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}

function SiteNav() {
  return (
    <header className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          Adam Sowden
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/" className="hover:text-white/70 transition">Home</Link>
          <Link href="/about" className="hover:text-white/70 transition">About</Link>
          <Link href="/blog" className="hover:text-white/70 transition">Blog</Link>
          <Link href="/contact" className="hover:text-white/70 transition">Contact</Link>
          <a
            href={BOOKING_URL}
            className="ml-2 inline-flex items-center rounded-full bg-white text-[#0a0a0a] px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
          >
            Book a Quick Chat
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-[1.3fr_1fr] gap-12 md:gap-16 items-center">
        <div>
          <p className="text-white/60 text-sm uppercase tracking-widest mb-6">
            Zero-Dependency Business Systems
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Build a business that grows
            <br className="hidden md:block" /> without you.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl">
            World-class marketing automation for less than the cost of a VA.
            AI systems that write, publish, engage, and qualify — while
            you do something else.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={BOOKING_URL}
              className="inline-flex items-center rounded-full bg-white text-[#0a0a0a] px-6 py-3 font-medium hover:bg-white/90 transition"
            >
              Book a Quick Chat
            </a>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-white/30 text-white px-6 py-3 font-medium hover:border-white/70 transition"
            >
              Read the methodology
            </Link>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          {/* Photo placeholder — replace with Adam's headshot once uploaded */}
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center text-white/30 text-sm">
            [Adam&apos;s photo]
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
    <section className="border-y border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 grid sm:grid-cols-3 gap-8">
        {stats.map((s) => (
          <div key={s.value} className="text-center sm:text-left">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight">
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
        <p className="text-xs uppercase tracking-widest text-black/50 mb-4">
          The Problem
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
          Owner dependency caps growth. Then AI made it worse.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-xl font-semibold mb-4">The Operator Trap</h3>
            <p className="text-black/70 leading-relaxed">
              Most business owners didn&apos;t set out to build a job. They
              built one anyway. Every new client, every campaign, every piece
              of content requires the owner. Growth hits a ceiling defined
              entirely by one person&apos;s available hours. The trap
              tightens as the business grows.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">The AI Paradox</h3>
            <p className="text-black/70 leading-relaxed">
              AI was supposed to solve this. For most owners, it made it
              worse. They use AI to do more work faster, personally. They
              feel productive. They are more trapped than before. The
              problem is not the tool. It is the old mindset being applied
              to it.
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
    <section className="bg-[#f6f6f4]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-widest text-black/50 mb-4">
          The Methodology
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
          The Four-Filter Rule.
        </h2>
        <p className="mt-6 text-lg text-black/70 max-w-2xl">
          Every AI implementation must pass all four tests before it gets
          built. If it fails any one, it is not worth building.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {filters.map((f) => (
            <div
              key={f.n}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <div className="text-sm text-black/40 font-mono">{f.n}</div>
              <div className="mt-2 text-xl font-semibold">{f.title}</div>
              <p className="mt-3 text-black/70 leading-relaxed">{f.body}</p>
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
        <p className="text-xs uppercase tracking-widest text-black/50 mb-4">
          Two ways in
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl leading-tight">
          Pick the system that fits where you are.
        </h2>

        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-[#0a0a0a] text-white rounded-2xl p-10">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">
              The flagship
            </p>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              The Content Ecosystem
            </h3>
            <p className="mt-5 text-white/80 leading-relaxed">
              One core idea a week. The system writes it, publishes it,
              distributes it, and converts it. An AI trained on your voice,
              your proof, your methodology. Embedded Participation Layer
              turns every reader into a conversation, at any hour, without
              you.
            </p>
            <a
              href={BOOKING_URL}
              className="mt-8 inline-flex items-center rounded-full bg-white text-[#0a0a0a] px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition"
            >
              See if it fits
            </a>
          </div>

          <div className="bg-[#f6f6f4] rounded-2xl p-10 border border-black/10">
            <p className="text-black/40 text-xs uppercase tracking-widest mb-3">
              Entry point
            </p>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              The Agent Suite
            </h3>
            <p className="mt-5 text-black/70 leading-relaxed">
              Need a specific capability without the full system build?
              Trained AI agents that run autonomously — the Ad Copywriter,
              the Market Disruptor, the Email Writer, and more. Each
              trained on your business. Each runs without you.
            </p>
            <a
              href={BOOKING_URL}
              className="mt-8 inline-flex items-center rounded-full border border-black/20 text-[#0a0a0a] px-5 py-2.5 text-sm font-medium hover:border-black/50 transition"
            >
              Explore the agents
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
          You don&apos;t need another AI tool.
          <br />
          You need a business that runs without you.
        </h2>
        <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
          A 20-minute Quick Chat. No pitch. We look at where owner dependency
          is costing you growth and what becomes possible when it&apos;s removed.
        </p>
        <a
          href={BOOKING_URL}
          className="mt-10 inline-flex items-center rounded-full bg-white text-[#0a0a0a] px-7 py-3.5 font-medium hover:bg-white/90 transition"
        >
          Book a Quick Chat
        </a>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-white border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-black/60">
        <div>© {new Date().getFullYear()} Adam Sowden. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/about" className="hover:text-black transition">About</Link>
          <Link href="/blog" className="hover:text-black transition">Blog</Link>
          <Link href="/contact" className="hover:text-black transition">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
