import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, WAITLIST_URL, OG_DEFAULTS } from "@/lib/site";

const PAGE_PATH = "/products/outreach-agent";
const CTA_LABEL = "Join the Waiting List";

export const metadata: Metadata = {
  title: "The Outreach Agent | Turn Engagement Into Conversations",
  description:
    "The Outreach Agent continues every comment, reply, and reaction your content earns, in your voice, while the interest is warm. It never contacts anyone cold.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...OG_DEFAULTS, url: PAGE_PATH, title: "The Outreach Agent" },
};

// AEO: self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "The Outreach Agent watches the channels where a business's audience already engages (post comments, email replies, social interactions) and continues each conversation in the right channel, in the owner's voice, while the interest is still warm. Every message is built from what that specific person said. It never contacts anyone who did not engage first, and it is not a cold outreach tool.";

const whatItDoes = [
  {
    title: "Watches every channel you connect",
    body: "Post comments, email replies, and social interactions across the platforms you publish on. The channels are agreed during setup, and every connected channel is covered from that point.",
  },
  {
    title: "Continues each conversation in the right place",
    body: "The follow-up happens where the relationship naturally goes next. Public engagement can move to a private conversation, and an email thread stays an email thread.",
  },
  {
    title: "Writes from the signal, in your voice",
    body: "Each reply is built from what the person said and the content they responded to. Your audience knows how you sound, and the agent was trained on exactly that.",
  },
  {
    title: "Knows which signals matter",
    body: "A thoughtful comment from an ideal client gets a different response from a passing emoji. The agent reads the difference and spends its effort where the intent is.",
  },
  {
    title: "Hands you the conversations worth having",
    body: "When an exchange reaches the point where you belong in it, it arrives with the full thread and the context attached. You step in at the moment your involvement is worth something.",
  },
];

const faqItems = [
  {
    question: "Will my audience be able to tell it is not me?",
    answer:
      "The agent was trained on how you write and how you respond to your audience when you have the time to do it well. And you do not have to take that on trust: run it in review mode, read every draft before it sends, and release it to run on its own only when the replies consistently sound like you. You set that pace.",
  },
  {
    question: "Can I approve every message before it goes out?",
    answer:
      "Yes. Review mode is how most people start: the agent drafts, you approve, it sends. Moving to full autopilot is your decision, made after you have watched it handle your real engagement for a week or two.",
  },
  {
    question: "What counts as a signal?",
    answer:
      "Comments on your posts, replies to your emails, reactions, and direct messages, configured to your channels during setup. You decide which signals warrant a conversation and which get a lighter touch, and the agent applies that judgment consistently.",
  },
  {
    question: "Is this cold outreach?",
    answer:
      "No, and it never becomes it. The agent only responds to people who engaged with your business first. Anyone it talks to started the conversation themselves.",
  },
  {
    question: "When will it be available, and what will it cost?",
    answer:
      "It opens when it meets the standard of the systems already running this site. Pricing is announced at launch, and the waiting list hears first.",
  },
];

/*
  FAQ ON HOLD until the true operating model is confirmed (per copy note 3).
  Do not fill with reassuring copy — a wrong answer risks the personal-brand
  account this buyer's business runs on. Publish once the model is known:

  - "Is this allowed on LinkedIn and the other platforms?"
    State exactly how sending works: if the agent drafts and sending happens
    through approved channels within platform rules, say that plainly; if any
    channel operates differently, name it.
*/

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "The Outreach Agent",
  description: ANSWER_FIRST,
  serviceType: "AI marketing software",
  provider: { "@type": "Person", name: "Adam Sowden", url: SITE_URL },
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
      name: "The Outreach Agent",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function OutreachAgentPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <WarmSignalGap />
        <WhatItIs />
        <WhatItDoes />
        <WhatItIsNot />
        <WhyTheGapCosts />
        <WhatChanges />
        <HowItWorks />
        <WorksWellWith />
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
          Outreach Agent
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          The warmest leads you get are often comments on your socials.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          Every comment, email reply, and reaction is someone raising their
          hand. The Outreach Agent watches every channel where your audience
          engages and continues each conversation in the right place, in your
          voice, while the interest is still warm. It never contacts anyone who
          did not engage first.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg" href={WAITLIST_URL}>
            {CTA_LABEL}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}

function WarmSignalGap() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="rounded-2xl bg-[#eff6ff] p-8 md:p-14 max-w-4xl mx-auto text-center">
          <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-semibold mb-4">
            The Warm Signal Gap
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-tight text-[#111111]">
            Open your last three posts and count the comments you never replied
            to.
          </h2>
          <div className="mt-6 space-y-5 text-lg text-[#111111]/75 leading-relaxed">
            <p>
              Then check the email replies still sitting unanswered from the
              past fortnight. Each one of those was a person who saw something
              you made and responded to it.
            </p>
            <p>
              Those are the warmest signals a business receives, and in most
              businesses they go nowhere. The intent is real when the comment
              lands, and by the time a spare hour appears three days later, the
              moment has passed. The person has moved on, and the interest you
              earned expires quietly in a notification tray.
            </p>
            <p className="text-[#111111] font-medium">
              The Outreach Agent closes that gap. Every signal gets a
              continuation while the interest is still live.
            </p>
          </div>
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
          Someone who watches every interaction your business gets, and follows
          each one up in the right place.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The Outreach Agent monitors the channels where your audience already
            engages: post comments, email replies, social interactions. When a
            signal comes in, it continues the conversation where it started. A
            comment on a post can move to a direct message, an email reply gets
            a considered follow-up, and a reaction that would have vanished in a
            busy week becomes an opening line.
          </p>
          <p>
            Every message is built around what that specific person said. There
            is no template underneath and no sequence being triggered. The agent
            reads the signal, reads the content it responded to, and writes a
            continuation of the conversation the person already started.
          </p>
          <p>
            We built it from three sources. The first is your specific
            materials: your voice, your methodology, your proof points, and how
            you talk to your audience when you have the time to do it properly.
            The second is the principles behind conversations that move interest
            forward without pressure: when to ask a question, when to offer
            something useful, and when a signal is just appreciation that needs
            nothing more than warmth back. The third is your industry&apos;s
            best practices, so the follow-up fits your specific market rather
            than business in general.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItDoes() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Does
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Five things that happen to every signal you earn.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {whatItDoes.map((it, i) => (
            <div
              key={it.title}
              className={`bg-white border border-black/10 rounded-2xl p-8 ${
                i === whatItDoes.length - 1 ? "md:col-span-2" : ""
              }`}
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

function WhatItIsNot() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What It Is Not
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          This is not a cold outreach tool.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The Outreach Agent does not contact people who have not interacted
            with your business. Every conversation it starts is a continuation
            of something the prospect began: they engaged first, and the agent
            responds.
          </p>
          <p className="text-[#111111] font-medium">
            Cold outreach scales poorly and erodes trust, especially for a
            personal brand where the audience knows exactly how you operate.
            Every reply this sends goes to someone who already showed interest,
            which is why the conversations it starts feel earned rather than
            intrusive.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhyTheGapCosts() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Why The Gap Costs More Than The Lead
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          An unanswered signal costs you twice.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The first cost is the obvious one: the conversation. The person who
            commented on Monday was interested on Monday. By Thursday they are
            someone who once commented, and the difference between those two
            people is the entire value of the lead.
          </p>
          <p>
            The second cost is quieter, and it compounds. An audience that
            engages and hears nothing back learns to stop engaging. The
            platforms make it worse, because active conversations get
            distributed and dead threads do not, so every unanswered comment
            also shrinks the reach of the next post. The gap loses the lead in
            front of you and slowly reduces the number of leads that arrive at
            all.
          </p>
          <p>
            The same loop runs in the other direction. Worked signals produce
            livelier threads, livelier threads travel further, and further
            reach produces more signals, which makes the follow-up the part of
            the content process that compounds.
          </p>
          <p className="text-[#111111] font-medium">
            You do not need a case study for this one. The evidence is in your
            own notifications.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatChanges() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What Changes
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          The follow-up stops waiting for your spare hour.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Monday, 7:40am. Someone thoughtful comments on the post you
            published an hour ago. By the time you are out of your first
            meeting, the agent has replied in the thread, moved the conversation
            to a message, and asked the one question you would have asked. By
            Thursday there is a call on your calendar with someone who started
            as a comment, and you have the whole exchange in front of you before
            you say a word.
          </p>
          <p className="text-[#111111] font-medium">
            Nothing about that required you. The signals get worked at the pace
            they arrive, at whatever hour they arrive, and you step into the
            ones that earn your time.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "The Setup Session",
      body: "One hour where you walk the agent through your voice, your methodology, your ideal client, and how you respond to your audience when you have the time. It learns the difference between a signal worth a conversation and one worth a thank-you.",
    },
    {
      n: "02",
      title: "The Channel Connection",
      body: "The agent connects to the channels where your engagement arrives: your social platforms and your inbox. The setup covers which channels to include and how each one behaves.",
    },
    {
      n: "03",
      title: "The Continuation",
      body: "Every signal gets a response built from what the person said, in the channel where the relationship naturally continues. You can run in review mode, approving messages before they send, for as long as you want.",
    },
    {
      n: "04",
      title: "The Handoff",
      body: "Conversations that reach the point of a call, a proposal, or a question only you can answer arrive with the full thread attached. Your involvement starts where it counts.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          One session to set up. Running by the end of the week.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-white border border-black/10 rounded-2xl p-8"
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

function WorksWellWith() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-4 pb-20 md:pb-24">
        <div className="rounded-2xl bg-[#F9FAFB] border border-black/10 p-8 md:p-10 max-w-3xl mx-auto text-center">
          <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
            Works well with
          </p>
          <h2 className="font-serif text-2xl tracking-tight text-[#111111]">
            Irene, Your Own AI Marketing Team
          </h2>
          <p className="mt-3 text-[#111111]/75 leading-relaxed">
            The Outreach Agent works the engagement your content earns.{" "}
            <Link
              href="/products/ai-marketing-team"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#0d78dc] transition"
            >
              Irene
            </Link>{" "}
            produces that content in the first place. Run together, one makes the
            posts and the other makes sure no signal they generate goes
            unanswered.
          </p>
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
          What you are probably wondering before you join.
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
          The engagement is already happening. The follow-up is the missing
          piece.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          The Outreach Agent is in development now, built to the same standard
          as the systems already running this site. Join the waiting list and
          you will be first to get it when it opens.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg" href={WAITLIST_URL}>
            {CTA_LABEL}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
