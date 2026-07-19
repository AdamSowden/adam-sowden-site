import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, OG_DEFAULTS } from "@/lib/site";

// Canonical URL stays /products/ai-marketing-team: it carries the searchable
// term, sits inside the /products hub and breadcrumbs, and holds whatever
// equity the page has. /irene is a 308 vanity redirect here (see next.config.ts).
const PAGE_PATH = "/products/ai-marketing-team";
const CTA_LABEL = "Book the Setup Session";

export const metadata: Metadata = {
  title: "Irene, Your Own AI Marketing Team | Trained On You, Runs Without You",
  description:
    "Irene is an AI marketing team trained on your methodology, voice, and proof points. She plans the week and drafts content in your voice. You approve, she ships.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    ...OG_DEFAULTS,
    url: PAGE_PATH,
    title: "Irene, Your Own AI Marketing Team",
  },
};

// AEO: this is the self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "Irene is a personal AI marketing department: a single AI marketing operator trained on one business's methodology, voice, proof points, and ideal customer. She owns an agreed weekly content plan, researches the market, drafts the week's content in the owner's voice, and queues it for approval. The owner directs the strategy and approves every piece. Irene handles the planning, the drafting, and the follow-through.";

const faqItems = [
  {
    question: "How do I know it will sound like me?",
    answer:
      "Because she is built from you. Your voice files, your brand-voice rules, your anti-slop patterns, and the history of every correction you have made are what she draws from, rather than a generic style guide. Generic AI tools sound average because they were trained on everything. Irene is trained on your methodology, your voice, and your past content.",
  },
  {
    question: "Isn't this just ChatGPT with a prompt?",
    answer:
      "No. ChatGPT is trained on the internet and starts from a blank page every time you open it. Irene is trained on your business. The methodology, the voice, the proof points, and the ideal customer are all specific to you, so what comes out is content only you could have written. She also produces against an agreed plan on schedule instead of waiting to be prompted.",
  },
  {
    question: "Won't my brand get diluted if AI writes for me?",
    answer:
      "Irene is a drafter, not a decider. Every piece is owner-approved before it goes anywhere, so your judgement gates every send. Nothing publishes on its own.",
  },
  {
    question: "What if the market shifts and my methodology needs to change?",
    answer:
      "You update the methodology files and Irene follows. She is not baked in. She reads her instructions at the start of every conversation, so a change you make today applies to the next draft she writes.",
  },
  {
    question: "What does it cost?",
    answer:
      "$497 per month. You can point the weekly plan at a single task to start and expand it as each one proves out, so you are not paying for capacity you are not using yet.",
  },
  {
    question: "Can I start with just one task?",
    answer:
      "Yes, and most people should. If the newsletter is the task eating your week, the weekly plan can be the newsletter and nothing else. Once that runs without you, add the next thing. Irene takes on as much or as little of the plan as you hand her.",
  },
  {
    question: "What happens to my materials?",
    answer:
      "Everything you give her during setup, and everything she produces, belongs to your business. Your methodology is the asset the whole system is built on, and it stays yours.",
  },
  {
    question: "How long does it take to see results?",
    answer:
      "She produces visible, high-quality output within the first week of setup. The compound effect of consistent, methodology-driven content typically generates inbound conversations within 30 to 60 days.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Irene, Your Own AI Marketing Team",
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
      name: "Irene, Your Own AI Marketing Team",
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
        <WhatSheIs />
        {/* TODO: <ChatPreview /> goes here. Awaiting real web-UI screenshots
            from Adam. Not shipping a placeholder box on a sales page. */}
        <WhatSheProduces />
        <WhyDifferent />
        <TheWeek />
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
          Meet Irene
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          Your own marketing department, trained on your business, working while
          you are with a client.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          Irene is a marketing operator trained on your methodology, your
          voice, and your ideal customer. She plans the week, drafts the
          content, and queues it for your approval while you get on with the
          work. You keep control of every decision.
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
      title: "Write it yourself",
      body: "It competes with client work for the same hours, and your clients will always win. The cost is the time you do not have, plus the positioning you lose every week the marketing does not go out.",
    },
    {
      title: "Use off-the-shelf AI",
      body: "The tools were trained on everything, so the output defaults to average. It sounds like every other business paying for the same subscription, which makes it indistinguishable from noise.",
    },
    {
      title: "Hire an agency",
      body: "You rent the asset. A playbook gets applied to your brand, and the strategy and trained voice sit inside the agency. When the relationship ends, the IP walks out with them.",
    },
    {
      title: "Hire in-house",
      body: "This solves execution and creates a dependency. There is an approval queue, a key person to lose, and someone still has to direct, review, and correct the work. That someone is you.",
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
          The real problem with all four is that the owner is still the
          bottleneck. The marketing stops the moment the owner stops paying
          attention to it.
        </p>
      </div>
    </section>
  );
}

function WhatSheIs() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What She Is
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          A fifth option. A marketing operator built for your business
          specifically.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Irene is not a tool you operate or a template you fill in. She runs
            an agreed weekly plan, drafts the content ahead of time, tells you
            what is ready for approval, and tracks what is still outstanding.
            She works the plan proactively, draws it down, and chases what is
            left.
          </p>
          <p>
            The personalisation is half of it. The other half is what sits
            underneath: the principles of the greatest marketers in history and
            your industry&apos;s best practices, trained in before she produces
            a word. Your methodology gives the output its voice, and that
            foundation sets its standard. The combination is what generic AI
            tools cannot replicate, and it is the reason the drafts arrive
            usable rather than needing a rewrite.
          </p>
          <p>
            She remembers. Every conversation persists, so she carries the
            context from Monday&apos;s newsletter into Friday&apos;s post
            without being re-briefed. You talk to her the way you would brief a
            sharp member of staff. She asks what she needs, updates you on
            progress, and tells you plainly when she is waiting on you.
          </p>
          <p className="text-[#111111] font-medium">
            You are already looking at the same underlying intelligence. The AI
            on this site runs on it, with this business encoded into it the way
            yours would be. Ask it about this product right now.
          </p>
        </div>
      </div>
    </section>
  );
}

// Mirrors the Skills screen in the app: the same three groups, the same
// skills, in the same order. Keep this in sync when skills ship or change.
const skillGroups = [
  {
    label: "Draft",
    caption: "Create new content in your voice",
    skills: [
      {
        title: "LinkedIn post",
        body: "A single post in your voice for your LinkedIn profile, built on your angle bank and your proof points.",
      },
      {
        title: "Newsletter",
        body: "This week's issue for your subscribers, written from your methodology and the week's market brief.",
      },
      {
        title: "Reel or short script",
        body: "A 60-second script for Instagram Reels, TikTok, and YouTube Shorts, structured for watch time.",
      },
      {
        title: "YouTube script",
        body: "Long-form script with the intro, the body, and the close already in place.",
      },
      {
        title: "Promotional email",
        body: "A campaign or one-off promotional email written to move the right reader toward a conversation.",
      },
    ],
  },
  {
    label: "Package",
    caption: "Turn existing content into more content",
    skills: [
      {
        title: "Repurpose content",
        body: "One piece becomes a week of assets. You record or write once, she produces the rest.",
      },
      {
        title: "YouTube packaging",
        body: "Titles, thumbnail brief, description, tags, and timestamps for a video you have already made.",
      },
    ],
  },
  {
    label: "Research",
    caption: "Understand your market and find opportunities",
    skills: [
      {
        title: "Audience pain research",
        body: "Finds what your target market is struggling with, in the words they use, drawn from where they talk.",
      },
      {
        title: "Weekly market brief",
        body: "This week's news and the angles in your industry worth responding to, delivered every Monday.",
      },
      {
        title: "Referral partners",
        body: "Finds potential referral or JV partners on LinkedIn, builds a short dossier, and drafts the outreach.",
      },
    ],
  },
];

function WhatSheProduces() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What She Produces
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          One operator. The output of a whole team.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/70 max-w-2xl mx-auto leading-relaxed text-center">
          You pick a skill and she runs it using what she already knows about
          your voice and your methodology.
        </p>
        <div className="mt-14 space-y-12">
          {skillGroups.map((g) => (
            <div key={g.label}>
              <div className="flex items-baseline gap-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-semibold">
                  {g.label}
                </p>
                <p className="text-sm text-[#111111]/55">{g.caption}</p>
              </div>
              <div className="mt-5 grid md:grid-cols-3 gap-5">
                {g.skills.map((s) => (
                  <div
                    key={s.title}
                    className="bg-white border border-black/10 rounded-2xl p-7"
                  >
                    <h3 className="text-lg font-semibold text-[#111111]">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[#111111]/70 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyDifferent() {
  const points = [
    {
      title: "She fails the sounds-like-AI test on purpose",
      body: "Every draft passes an anti-slop scan for banned phrases, em-dashes, announced pivots, and the usual AI tells before you ever see it. If a draft does not pass the read-aloud test as your own voice, it is not finished.",
    },
    {
      title: "She uses cited proof, never invented proof",
      body: "Content references only the client outcomes you have verified and given her. She does not invent statistics, quotes, or case studies to make a point land.",
    },
    {
      title: "She works from a methodology, not a template",
      body: "Your methodology files define what she names as the enemy, what she recommends, and what she never says. The content is grounded in your actual IP rather than generic best practice.",
    },
    {
      title: "She is finite and accountable",
      body: "You see exactly what is planned, drafted, approved, shipped, and outstanding. She is a system with visible state rather than a black box that emits content.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          Why She Is Different
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          The reason her drafts do not read like everyone else&apos;s.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {points.map((p) => (
            <div
              key={p.title}
              className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8"
            >
              <h3 className="text-lg font-semibold text-[#111111]">
                {p.title}
              </h3>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheWeek() {
  const days = [
    {
      label: "Monday",
      body: "Irene delivers the market research brief. Three to seven content angles pulled from the week's news that fit your methodology.",
    },
    {
      label: "Tuesday to Thursday",
      body: "Drafts land in the queue against your weekly targets. Three LinkedIn posts, one newsletter, one long-form repurpose, one email sequence, or whatever the plan says.",
    },
    {
      label: "Friday",
      body: "You do a batch approval pass. Approved content is scheduled. Anything you reject becomes a training signal, and she banks the correction.",
    },
    {
      label: "Any time",
      body: "You can direct-command outside the plan. Write me an ad for this. Repurpose this podcast. Find me twenty referral partners in Ballina. She runs the job and returns the output.",
    },
  ];
  return (
    <section className="bg-[#0a0f1e]">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          A Week With Irene
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-white text-center">
          The plan moves whether or not you think about it.
        </h2>
        <div className="mt-14 space-y-4">
          {days.map((d) => (
            <div
              key={d.label}
              className="border border-white/10 rounded-2xl p-7 md:flex md:gap-8 md:items-baseline"
            >
              <div className="text-[#188bf6] font-medium md:w-52 md:shrink-0">
                {d.label}
              </div>
              <p className="mt-2 md:mt-0 text-white/75 leading-relaxed">
                {d.body}
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
            The standard worth holding your marketing to is simple. It should
            keep producing while you are on holiday. Agencies fail it, because
            they need briefings, approvals, and feedback cycles. In-house staff
            need direction, and AI tools need a human at the keyboard. Irene
            does not wait for you.
          </p>
          <p>
            The weekly plan is agreed once and executes on schedule. The market
            research brief lands on Monday without anyone asking for it. The
            week&apos;s draft content is queued before you sit down, and the
            only thing left in your column is approval.
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
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          36 hours a week, reclaimed.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The first business Irene ran was mine. Twenty-six years building
            businesses, fifteen of them running a marketing agency, and my own
            marketing still consumed 36 hours of my week or did not happen at
            all. The social posts, the newsletter, the research, the drafting:
            every hour it needed belonged to a client first.
          </p>
          <p>
            She took those tasks over. The research brief arrives on schedule.
            The week&apos;s content is drafted before I look at it. My
            involvement is reading, approving, and occasionally redirecting,
            which takes minutes where the work took hours. The time came back
            and the output did not fall.
          </p>
          <p className="text-[#111111] font-medium">
            The same methodology, deployed as a full acquisition system for a
            financial advisory client, produced a 10x lift in average lead asset
            value. That story belongs to{" "}
            <Link
              href="/products/marketing-ecosystem"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#111111] transition"
            >
              the Marketing Ecosystem
            </Link>
            , and it lives on that page. This is the version you run yourself,
            and what it buys you first is time.
          </p>
        </div>
        {/* TODO: testimonial from an Irene user, speaking to VOICE accuracy ("it
            sounds like me"), not time saved. Awaiting an approved testimonial. */}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "A 20-minute voice interview",
      body: "You talk to Jordan, the intake agent. She asks about your methodology, your positioning, your ideal customer, and how you sound. You answer in plain language, the way you would explain your business to a sharp new hire.",
    },
    {
      n: "02",
      title: "A 20-minute chat with Iris",
      body: "Iris is the onboarder. She fills the remaining gaps and ingests any existing content you want to share, whether that is your blog, your posts, or recordings of your sales calls.",
    },
    {
      n: "03",
      title: "Irene goes live the same day",
      body: "Once intake is complete she is working, in the same chat window. No forms, no onboarding project, and no technical setup on your side.",
    },
    {
      n: "04",
      title: "You agree the weekly plan",
      body: "Set the targets per channel. Three social posts, one newsletter, one market research brief, or whatever your strategy requires. She owns the execution of that plan and nothing goes out without your approval.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How She Is Trained On Your Business
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Two conversations, about 45 minutes, and she is yours.
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
        <p className="mt-12 max-w-3xl mx-auto text-lg text-[#111111]/75 leading-relaxed text-center">
          Not sure Irene is the one that moves your sales fastest? The{" "}
          <Link
            href="/diagnostic"
            className="text-[#188bf6] underline underline-offset-4 hover:text-[#111111] transition"
          >
            AI Marketing Diagnostic
          </Link>{" "}
          takes seven to ten minutes and tells you which of the six systems to
          start with.
        </p>
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
          Two conversations to set her up, about 45 minutes in total. A working
          content queue by the end of the week.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}
