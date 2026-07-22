import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, OG_DEFAULTS } from "@/lib/site";

const DIAGNOSTIC_URL = "/diagnostic";
const DIAGNOSTIC_CTA_LABEL = "Get MY AI Marketing Implementation Plan";

export const metadata: Metadata = {
  title: "About Adam Sowden: Billion-Dollar Marketing, Built Into AI",
  description:
    "Adam Sowden builds AI marketing agents for specialist, high-end offers. One campaign booked appointments totalling over $1 billion in advisor assets.",
  alternates: { canonical: "/about" },
  openGraph: { ...OG_DEFAULTS, url: "/about" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#adam-sowden`,
  name: "Adam Sowden",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/adam-about.jpg`,
  jobTitle: "Founder, Autonomous AI Marketing Systems",
  description:
    "Marketer and founder behind over $1 billion in client pipelines for financial advisors. Builds autonomous AI marketing systems that encode direct-response and lead-generation expertise into AI that outperforms in-house teams, agencies, and off-the-shelf tools.",
  worksFor: { "@id": `${SITE_URL}/#organization` },
  knowsAbout: [
    "Direct response marketing",
    "Lead generation",
    "Marketing funnels",
    "Financial advisor marketing",
    "AI marketing automation",
    "Autonomous AI marketing systems",
    "AI agent architecture",
  ],
  sameAs: [
    "https://www.linkedin.com/in/adam-sowden-5604148/",
    "https://x.com/AdamPSowden",
  ],
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <TrackRecord />
        <TheShift />
        <TheDemo />
        <FinalCTA />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-20 grid md:grid-cols-[1.15fr_1fr] gap-12 md:gap-16 items-center">
        <div>
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
            About Adam Sowden
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[#111111]">
            I&apos;ve built billion-dollar funnels. Now I build the AI that
            runs them.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#111111]/75 leading-relaxed">
            For more than 26 years I have run marketing for specialist,
            high-end offers. A recent campaign generated appointments for a
            financial advisor client totalling over $1 billion in asset
            value. Today I build that same expertise into AI agents and
            systems that produce those results without the team, the agency,
            or the owner doing the work.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative w-72 h-[22rem] md:w-[22rem] md:h-[28rem] rounded-2xl overflow-hidden border border-black/5 shadow-sm">
            <Image
              src="/adam-about.jpg"
              alt="Adam Sowden"
              fill
              priority
              sizes="(min-width: 768px) 352px, 288px"
              className="object-cover object-[center_25%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrackRecord() {
  const proofs = [
    {
      metric: "$1 billion+",
      detail:
        "in prospect assets placed into one client's pipeline through a single campaign.",
    },
    {
      metric: "10x",
      detail:
        "lift in average lead value for a financial advisor client, from around $1M to around $10M.",
    },
    {
      metric: "$100M+",
      detail:
        "in assets held by multiple prospects the system booked appointments with. The prior record was a single $42M lead.",
    },
    {
      metric: "30 to 50%",
      detail:
        "lower cost per lead, at the same time lead quality rose.",
    },
    {
      metric: "8 sales",
      detail:
        "in a single month for one client, each worth at least $50,000.",
    },
    {
      metric: "Every client",
      detail:
        "who has put this to work has improved the quality of the leads they attract.",
    },
    {
      metric: "Agencies replaced",
      detail:
        "clients now run marketing that used to sit with an outside agency, and keep the IP inside the business.",
    },
    {
      metric: "36 hrs / week",
      detail:
        "of marketing work removed from my own business while revenue grew.",
    },
    {
      metric: "Days to instant",
      detail:
        "website changes that once took days now happen on command, and contracted developer costs all but disappeared.",
    },
    {
      metric: "Every week",
      detail:
        "clients publish across blog, email, and social without writing a word of it themselves.",
    },
    {
      metric: "The 10x engine",
      detail:
        "an embedded model of each business's ideal customer, rewriting its marketing in the language that customer actually uses.",
    },
    {
      metric: "Owner-free",
      detail:
        "my own marketing now runs end to end on the system, without me.",
    },
  ];

  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          The track record, in results.
        </h2>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-9">
          {proofs.map((p) => (
            <div
              key={p.metric}
              className="border-t border-black/10 pt-5"
            >
              <div className="font-serif text-2xl md:text-3xl tracking-tight text-[#188bf6] leading-tight">
                {p.metric}
              </div>
              <p className="mt-2.5 text-[#111111]/75 leading-relaxed">
                {p.detail}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-3xl mx-auto text-center font-serif text-2xl md:text-3xl tracking-tight text-[#111111] leading-snug">
          When top marketers have a campaign that has to land, they call me.
          This is the work behind that.
        </p>
      </div>
    </section>
  );
}

function TheShift() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Shift
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          The best marketing was never about the tool. It was about the
          method.
        </h2>

        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            I have spent my career on one thing: marketing that actually
            produces. Not activity. Results. The channels change and the
            tactics change, but the discipline underneath does not.
          </p>
          <p>
            When AI arrived, most people used it to do the same generic work
            faster. Faster sameness. Output that sounds like every other
            business using the same tool. I saw something different. AI had
            finally become good enough to carry a real marketing methodology
            at the point of execution.
          </p>
          <p>
            So I stopped treating AI as a tool and started treating it as the
            workforce, with the methodology encoded into it. The AI handles
            the execution. The method is what makes the output world-class.
            The AI is what makes the methodology scale. The methodology is
            what makes the AI worth anything at all.
          </p>
          <p>
            The result is systems that outperform an in-house team, an agency,
            and every off-the-shelf tool. Those produce generic work. These
            produce marketing that could only have come from the specific
            business it was built for.
          </p>
        </div>
      </div>
    </section>
  );
}

function TheDemo() {
  return (
    <section className="bg-[#0a0f1e]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Proof you are standing in
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          You are looking at the product.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            Everything on this site was produced by the system I build. The
            essays. The images. The AI you can talk to on any post. This is
            not a description of what the system can do. It is the system,
            running.
          </p>
          <p className="text-white font-medium">
            If the question is whether AI can produce marketing at a standard
            you would put your own name on, you are reading the answer.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 md:p-10 flex flex-col text-center items-center">
          <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111]">
            See where AI fits in your marketing.
          </h3>
          <p className="mt-4 text-[#111111]/70 leading-relaxed">
            The AI Marketing Diagnostic. Seven to ten minutes, no call. You
            get a written plan showing where AI would move your sales
            fastest, and where to start.
          </p>
          <div className="mt-6">
            <CTAButton size="lg" href={DIAGNOSTIC_URL}>
              {DIAGNOSTIC_CTA_LABEL}
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
