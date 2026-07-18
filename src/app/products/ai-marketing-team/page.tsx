import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, OG_DEFAULTS } from "@/lib/site";

const PAGE_PATH = "/products/ai-marketing-team";
const CTA_LABEL = "Book the Setup Session";

export const metadata: Metadata = {
  title: "Your Own AI Marketing Team | Trained On You, Runs Without You",
  description:
    "An AI marketing team trained on your methodology, voice, and proof points. It plans the week and drafts the content while you are away. You approve, it ships.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...OG_DEFAULTS, url: PAGE_PATH, title: "Your Own AI Marketing Team" },
};

// AEO: this is the self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "Your Own AI Marketing Team is a single AI, trained on your methodology, voice, and proof points, that owns an agreed weekly marketing plan and keeps it moving without you managing it. It researches the market, drafts the week's content ahead of time, queues it for your approval, and tracks what is outstanding. You set the strategy and approve the work. It handles the execution.";

const faqItems = [
  {
    question: "Will the content sound like me?",
    answer:
      "Yes. Generic AI tools sound robotic because they are trained on everything. Yours is trained exclusively on your methodology, your voice, and your past content. It learns how you speak, what phrases you use, and what angles you prefer.",
  },
  {
    question: "What does it cost?",
    answer:
      "$497 per month. You can point the weekly plan at a single task to start and expand it as each one proves out, so you are not paying for capacity you are not using yet.",
  },
  {
    question: "Can I start with just one task?",
    answer:
      "Yes, and most people should. If the newsletter is the task eating your week, the weekly plan can be the newsletter and nothing else. Once that runs without you, add the next thing. The team takes on as much or as little of the plan as you hand it.",
  },
  {
    question: "What if I want to change a draft?",
    answer:
      "You talk to it exactly like you would a human staff member. If a draft needs adjusting, you tell it what to change. It rewrites immediately based on your feedback, learning your preferences for next time.",
  },
  {
    question: "What happens to my materials?",
    answer:
      "Everything you give it during setup, and everything it produces, belongs to your business. Your methodology is the asset the whole system is built on, and it stays yours.",
  },
  {
    question: "How is this different from the ChatGPT subscription I already have?",
    answer:
      "ChatGPT starts from zero every time you open it: a blank page, generic training, and output that sounds like everyone else paying for the same subscription. This starts from your methodology and an agreed weekly plan, produces on schedule without being prompted, and improves from your approvals and edits. Your role shifts from operator to editor.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "It will produce visible, high-quality output within the first week of setup. The compound effect of consistent, methodology-driven content typically generates inbound conversations within 30 to 60 days.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Your Own AI Marketing Team",
  description: ANSWER_FIRST,
  category: "AI marketing software",
  brand: { "@type": "Brand", name: "Adam Sowden" },
  offers: {
    "@type": "Offer",
    price: "497",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "497",
      priceCurrency: "USD",
      unitText: "MONTH",
    },
  },
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
      name: "Your Own AI Marketing Team",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function AiMarketingTeamPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <TheProblem />
        <WhatItIs />
        <WhatItProduces />
        <TheHolidayTest />
        <Proof />
        <HowItWorks />
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
          Your Own AI Marketing Team
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          Your marketing runs while you are with a client, at dinner, or asleep.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          Your Own AI Marketing Team is trained on your methodology, your voice,
          and your proof points. It plans the week, drafts the content, and
          queues everything for your approval while you get on with the work.
          You set it up yourself in a single conversation with the AI itself.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function TheProblem() {
  const options = [
    {
      title: "Write the content yourself",
      body: "It competes with client work for the same hours, and your clients will always win. Marketing is the first thing to stop when things get busy and the last thing to restart when they slow down.",
    },
    {
      title: "Use off-the-shelf AI",
      body: "The tools were trained on everything, so the output defaults to average. It sounds like every other business using the same subscription, and fixing it takes nearly as long as writing it.",
    },
    {
      title: "Hire an agency",
      body: "They can produce quality work, but the strategy and the trained voice sit inside the agency, not the business. When the relationship ends, everything leaves with them.",
    },
    {
      title: "Hire in-house",
      body: "The most expensive option. Even when the hire works, someone still has to direct, review, and correct them. That someone is the owner.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          The Problem
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Most owners are stuck with the same four options.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {options.map((o) => (
            <div
              key={o.title}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-[#111111]">
                {o.title}
              </h3>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">{o.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 max-w-3xl mx-auto text-lg text-[#111111] font-medium leading-relaxed text-center">
          The real problem with all four: the owner is still the bottleneck.
          The marketing stops the moment the owner stops paying attention to
          it.
        </p>
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
          A single AI that owns the marketing plan and keeps it moving.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            This is not a tool you operate or a template you fill in. It is a
            single AI that runs an agreed weekly plan, drafts the content ahead
            of time, tells you what is ready for approval, and tracks what is
            still outstanding.
          </p>
          <p>
            The personalisation is half of it. The other half is what sits
            underneath: the principles of the greatest marketers in history and
            your industry&apos;s best practices, trained in before it produces a
            word. Your methodology gives the output its voice, and that
            foundation sets its standard. The combination is what generic AI
            tools cannot replicate, and it is the reason the drafts arrive
            usable rather than needing a rewrite.
          </p>
          <p>
            You talk to it the same way you would brief a member of staff. It
            asks what it needs, updates you on progress, and tells you plainly
            when it is waiting on you. Ours is called Piper, and yours gets its
            own name.
          </p>
          <p className="text-[#111111] font-medium">
            You are already looking at it in action. The AI on this site runs on
            the same underlying intelligence, with this business encoded into it
            the way yours would be. Ask it about this product right now.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItProduces() {
  const items = [
    {
      title: "Social posts",
      body: "Built on your angle bank and your proof points. Structured to generate engagement from the right people, not just impressions.",
    },
    {
      title: "Newsletters",
      body: "A complete issue each week, written in your voice, built on your methodology and the week's market research. Something people actually read.",
    },
    {
      title: "Emails",
      body: "Promotional, nurture, onboarding. Each email is written to move the right reader one step closer to a conversation.",
    },
    {
      title: "YouTube scripts",
      body: "Long-form, 5 to 20 minutes. The hook, the structure, the close. Packaged with a full SEO suite: titles, thumbnail brief, description, tags, and timestamps.",
    },
    {
      title: "Short-form scripts",
      body: "Reels, Shorts, TikTok. Structured for watch time and written to convert.",
    },
    {
      title: "Content repurposing",
      body: "One long-form source becomes a full week of channel assets. You record once. It produces the rest.",
    },
    {
      title: "Audience pain research",
      body: "Surfaces the specific problems your ideal client is trying to solve, in the words they use. Drawn from forums, comment threads, and competitor content.",
    },
    {
      title: "Weekly market research briefs",
      body: "Every week it researches your industry and pulls the stories that matter. You get a brief with ready content angles before the week starts.",
    },
    {
      title: "Referral and JV partner research",
      body: "It searches for candidates, builds a short dossier on each, and drafts an outreach message. Nothing goes out until you approve it.",
    },
    {
      title: "LinkedIn analytics",
      body: "It pulls your post-level data, reads what landed, and tells you why.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Produces
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          One AI. The output of a whole team.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <h3 className="text-lg font-semibold text-[#111111]">
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

function TheHolidayTest() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Holiday Test
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Every other option needs you present. This one keeps working after you
          leave.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The standard worth holding your marketing to is simple: it should
            keep producing while you are on holiday. Agencies fail it. They need
            briefings, approvals, and feedback cycles. In-house staff need
            direction, and AI tools need a human at the keyboard. Your Own AI
            Marketing Team does not wait for you.
          </p>
          <p>
            The weekly plan is agreed once and executes on schedule. The market
            research brief lands on Tuesday without anyone asking for it. The
            week&apos;s draft content is queued before you sit down on Monday
            morning, and the only thing left in your column is approval.
          </p>
          <p className="text-[#111111] font-medium">
            The 36 hours come back because the system keeps moving after you
            stop, not because you got faster. They go back to delivery, to
            strategy, or to the Saturday you have been promising your family.
          </p>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="bg-[#0a0f1e]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          36 hours a week, reclaimed.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            The first business this ran was mine. Twenty-six years building
            businesses, fifteen of them running a marketing agency, and my own
            marketing still consumed 36 hours of my week or did not happen at
            all. The social posts, the newsletter, the research, the drafting:
            every hour it needed belonged to a client first.
          </p>
          <p>
            The system took those tasks over. The research brief arrives on
            schedule. The week&apos;s content is drafted before I look at it. My
            involvement is reading, approving, and occasionally redirecting,
            which takes minutes where the work took hours. The time came back
            and the output did not fall.
          </p>
          <p className="text-white font-medium">
            The same methodology, deployed as a full acquisition system for a
            financial advisory client, produced a 10x lift in average lead asset
            value. That story belongs to{" "}
            <Link
              href="/products/marketing-ecosystem"
              className="text-[#188bf6] underline underline-offset-4 hover:text-white transition"
            >
              the Marketing Ecosystem
            </Link>
            , and it lives on that page. This is the version you run yourself,
            and what it buys you first is time.
          </p>
        </div>
        {/* TODO: testimonial from a Team user, speaking to VOICE accuracy ("it
            sounds like me"), not time saved. Awaiting an approved testimonial. */}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "The Setup Session",
      body: "One conversation, about an hour, and it is with the AI itself. It asks about your methodology, your voice, your proof points, and your ideal client. You answer in plain language, the way you would explain your business to a sharp new hire. No forms, no onboarding project.",
    },
    {
      n: "02",
      title: "The Weekly Plan",
      body: "You agree the targets for the week. Three social posts, one newsletter, one market research brief, or whatever your strategy requires. It owns the execution of that plan.",
    },
    {
      n: "03",
      title: "The Draft Queue",
      body: "While you work on your business, it drafts the content, formats it, and queues it for your review.",
    },
    {
      n: "04",
      title: "Approval and Release",
      body: "Nothing goes out without your approval. You review the drafts, ask for changes if needed, and release the approved content. The output belongs entirely to your business.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Simple to set up. No technical knowledge required.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8"
            >
              <div className="text-sm text-[#188bf6] font-mono font-medium">
                {s.n}
              </div>
              <div className="mt-2 text-xl font-semibold text-[#111111]">
                {s.title}
              </div>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4 text-center">
          Common questions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10 text-center">
          The questions every owner asks before starting.
        </h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
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
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          The marketing plan that keeps moving while you build the business.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          One conversation to set it up, held with the AI itself. A working
          content queue by the end of the week.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}
