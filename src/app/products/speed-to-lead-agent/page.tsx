import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL, OG_DEFAULTS } from "@/lib/site";

const PAGE_PATH = "/products/speed-to-lead-agent";
const CTA_LABEL = "Book the Setup Session";

export const metadata: Metadata = {
  title: "The Speed-to-Lead Agent | Reply to Every Enquiry in Seconds",
  description:
    "The Speed-to-Lead Agent watches your forms, email, and SMS around the clock and replies to every new enquiry in seconds, in your voice. Not an auto-responder.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...OG_DEFAULTS, url: PAGE_PATH, title: "The Speed-to-Lead Agent" },
};

// AEO: self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "The Speed-to-Lead Agent is an AI that monitors a business's forms, email, and SMS around the clock and responds to every new enquiry within seconds. It reads what the specific prospect said, replies in the owner's voice, qualifies them against the ideal client profile, and hands the owner a warm, pre-briefed lead. It is not an auto-responder, and it runs on any channel without a developer.";

const faqItems = [
  {
    question: "Will it sound like me?",
    answer:
      "Yes. The agent was trained on your specific materials: your methodology, your voice, and your proof points. The reply it sends reads like you wrote it after reading the enquiry yourself.",
  },
  {
    question: "Will prospects know they are talking to AI?",
    answer:
      "That is your call, and we configure whichever position you take. Our recommendation is a light disclosure line, because it costs nothing with a prospect who was answered in seconds by a reply that clearly understood their situation. What loses trust is a generic reply pretending to be personal. This is the opposite of that.",
  },
  {
    question: "What happens when the prospect replies back?",
    answer:
      "The agent continues the conversation. It answers the questions prospects ask before they commit, qualifies against your ideal client profile, and moves toward a booked call. The moment a conversation crosses into territory that needs you (advice, pricing, anything unusual) it hands off with the full context attached, so you step into the call with the whole exchange already in front of you.",
  },
  {
    question: "I am a licensed advisor. What about compliance?",
    answer:
      "Compliance boundaries are configured during the setup session and are already live on advisor sites. The agent operates inside explicit rules on what it can and cannot say: no product recommendations, no performance claims, no personal advice, whatever your licence requires. Replies can be logged and audited. Its job is to acknowledge, qualify, and book. The advice stays with you, where it belongs.",
  },
  {
    question: "Can I review replies before they send?",
    answer:
      "Yes. Most clients start in review mode: the agent drafts, you approve, it sends. Once you have watched it handle your enquiries and the replies consistently sound like you, you switch it to full autopilot. You set the pace of that handover, not us.",
  },
  {
    question: "What if it gets something wrong?",
    answer:
      "It knows the edges of what it knows. When a situation falls outside its training, it escalates to you rather than guessing. The prospect never receives a confident wrong answer. And because you start in review mode, you see exactly how it handles edge cases before it ever runs unattended.",
  },
  {
    question: "Does this replace my CRM?",
    answer:
      "No. It works alongside your existing systems. The conversations it captures and the context it collects can be passed into your CRM as part of the setup.",
  },
  {
    question: "What channels does it watch?",
    answer:
      "Website forms, email, and SMS. The setup session covers which channels to connect. Every connected channel is covered around the clock from that point.",
  },
  {
    question: "Does it work if I do not have the Diagnostic Tool?",
    answer:
      "Yes. The agent responds to any inbound enquiry from any channel. The Diagnostic Tool improves the quality of the intake data it has to work with, but the agent runs effectively without it.",
  },
  {
    question: "How long does setup take?",
    answer:
      "One hour. The agent is connected and running by the end of the week.",
  },
];


const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "The Speed-to-Lead Agent",
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
      name: "The Speed-to-Lead Agent",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function SpeedToLeadAgentPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <ResponseWindow />
        <TheProblem />
        <TheFirstFiveMinutes />
        <WhatItIs />
        <WhatItDoes />
        <Proof />
        <MidCTA />
        <WhatChanges />
        <HowItWorks />
        <FAQ />
        <WorksBestWith />
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
          Speed-to-Lead Agent
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          The first reply wins the lead. Now yours is also the best one.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          The Speed-to-Lead Agent watches your forms, email, and SMS around the
          clock. The moment an enquiry lands, it sends the reply you would have
          written yourself after reading every word, while the prospect is
          still sitting with the problem that made them reach out.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function ResponseWindow() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="rounded-2xl bg-[#eff6ff] p-8 md:p-14 max-w-4xl mx-auto text-center">
          <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-semibold mb-4">
            The Response Window
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-tight text-[#111111]">
            Reach a lead within five minutes and you are 100 times more likely
            to make contact, and 21 times more likely to qualify them, than if
            you wait 30 minutes. Most businesses take longer than a day.
          </h2>
          <p className="mt-6 text-lg text-[#111111]/75 leading-relaxed">
            This is not just my opinion. It comes from the MIT lead response
            research by Dr. James Oldroyd, and Harvard Business Review confirmed
            the problem at scale: an audit of 2,241 companies found the average
            response to a web enquiry took 42 hours. Fewer than four in ten
            responded within the first hour.
          </p>
          <p className="mt-6 text-lg text-[#111111]/75 leading-relaxed">
            Now run it on your own pipeline. Count last month&apos;s enquiries.
            Then count how many got a reply inside five minutes. Every enquiry
            sitting in the gap between those two numbers was 21 times harder to
            qualify than it needed to be. That is not a marketing loss. It is
            sales you already paid to generate, leaking out of the pipeline
            while the reply sat in a queue.
          </p>
          <p className="mt-6 text-lg text-[#111111] font-medium">
            The Speed-to-Lead Agent closes the window to seconds.
          </p>
          <p className="mt-8 text-sm text-[#111111]/50 leading-relaxed">
            Sources:{" "}
            <a
              href="https://www.leadresponsemanagement.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#188bf6]"
            >
              Lead Response Management study (Oldroyd, MIT)
            </a>
            ;{" "}
            <a
              href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#188bf6]"
            >
              Harvard Business Review, &ldquo;The Short Life of Online Sales
              Leads&rdquo; (2011)
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Problem
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Most follow-up systems are built around availability, not speed.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Enquiries come in at all hours. You are on calls, with clients,
            asleep. Even when follow-up happens the same day, the prospect has
            already moved. They contacted three other people. One replied. That
            relationship started, and the others are catching up.
          </p>
          <p>
            The problem is not your commitment to follow-up. The problem is that
            human follow-up has a physical limit. The prospect does not wait for
            it.
          </p>
          <p className="text-[#111111] font-medium">
            The bottleneck appears twice. Once on timing. Once on
            personalisation. Both lose leads that should have converted.
          </p>
        </div>
      </div>
    </section>
  );
}

function TheFirstFiveMinutes() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The First Five Minutes
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          A prospect who just submitted a form is a different prospect from one
          who submitted it six hours ago.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The moment a form is completed, the problem that drove them to fill
            it in is at the top of their mind. They are expecting a response.
            The quality of that response shapes everything that follows.
          </p>
          <p>
            Every minute after that point, the context shifts. They move to the
            next task. The urgency that moved them to submit starts to settle.
            Other options come into view.
          </p>
          <p>
            The businesses that convert the highest percentage of their
            enquiries are not the best at sales. They are the fastest to respond
            with something worth reading. Speed signals attentiveness.
            Attentiveness signals what the relationship will feel like.
          </p>
          <p>
            Most owners know this and still cannot act on it. Acting on it
            requires someone watching every form, every email, every SMS, around
            the clock. That is not a realistic expectation of any owner or any
            team member.
          </p>
          <p className="text-[#111111] font-medium">
            The Speed-to-Lead Agent watches all of it.
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
          Not an auto-responder. A response built from what the prospect
          actually said.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            An auto-responder sends the same message to every enquiry. This
            reads the specific prospect&apos;s situation and responds to it. It
            monitors your inbound channels around the clock: forms, email, SMS.
            Every new enquiry triggers a response within seconds.
          </p>
          <p>
            Most businesses cannot respond quickly because no one is watching.
            The Speed-to-Lead Agent is always watching. It is alive 24 hours a
            day, 7 days a week. There is no after-hours, no weekend, no moment
            when an enquiry goes unmet.
          </p>
          <p>
            But speed alone is not the product. The quality of the response is
            what converts. The agent was trained on two things: your specific
            methodology, voice, and proof points, and the principles and
            strategies used by the greatest marketers in the world. That
            combination means the reply that arrives in seconds is not a faster
            version of the generic follow-up most businesses already send. It is
            a better response than most owners would write if they had the time.
          </p>
          <p className="text-[#111111] font-medium">
            A reply that reads like you wrote it yourself after reading the
            enquiry, delivered while the lead is still in the tab where they
            submitted the form.
          </p>
          <p>
            When the lead came through the Diagnostic Tool, the agent pulls the
            prospect&apos;s specific intake answers and builds its reply from
            what they actually said. What they identified as their biggest
            problem. What specific outcome they are after. What they said about
            their situation in their own words. The reply references all of it.
            The prospect does not feel like a form submission. They feel like
            they were heard.
          </p>
          <p>
            The mechanism behind the results: the agent was trained on your
            methodology, voice, and ideal client profile. It knows how to
            respond to a well-qualified prospect in a way that moves them
            forward, and how to respond to a prospect who is not a fit without
            burning the relationship. That training is what separates it from a
            faster version of the same generic follow-up most businesses already
            send.
          </p>
        </div>
        {/* TODO: video demo (enquiry arriving + personalised reply generated in
            seconds) sits here, after the mechanism paragraph. Awaiting asset. */}
      </div>
    </section>
  );
}

function WhatItDoes() {
  const items = [
    {
      title: "Responds in seconds, not hours",
      body: "The lead submitted the form. The agent reads it and responds before you see the notification. The window does not close.",
    },
    {
      title: "Personalises every reply from the enquiry itself",
      body: "It reads what the lead wrote, not a category they were assigned to. The reply references their specific situation, their stated problem, and their own words. Not a template with a name in it.",
    },
    {
      title: "Qualifies the prospect against the ideal client profile",
      body: "The agent knows who belongs in the pipeline. It does not advance poor-fit prospects and does not turn away good ones. Your time is protected before the first call is ever booked.",
    },
    {
      title: "Opens the conversation in your voice",
      body: "The agent was trained on how you respond to the questions prospects ask before they commit. The lead does not notice you were not there for the first exchange.",
    },
    {
      title: "Delivers the lead briefed and warm",
      body: "Every call you take from this point has already had a first conversation. What the prospect said, what they need, and what moved them to reach out is already captured. You step in where your time is worth spending.",
    },
    {
      title: "Captures the language the market uses",
      body: "Every exchange surfaces the exact words prospects use to describe their problem. That language feeds back into content, ad copy, and future campaigns. The agent gets more effective the more enquiries it handles.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Does
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Six things that happen the moment an enquiry arrives.
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

function Proof() {
  return (
    <section className="bg-[#0a0f1e]">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          The same traffic. The same enquiries. A different response.
        </h2>
        <div className="mt-10 max-w-3xl mx-auto space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            A financial advisory client rebuilt their acquisition around this
            methodology and saw average lead asset value rise tenfold. Those
            numbers came from the full system, and they live on the{" "}
            <Link
              href="/products/marketing-ecosystem"
              className="text-[#188bf6] underline underline-offset-4 hover:text-white transition"
            >
              Marketing Ecosystem
            </Link>{" "}
            page. The follow-up rewrite was one of the components that produced
            them, and it is the part this page is selling.
          </p>
          <p>
            When we audited the advisor&apos;s existing follow-up, the writing
            held up. What failed was the perspective. Every reply led with the
            seller&apos;s world: the credentials, the process, the offer. So we
            simulated the ideal client, read every reply from the buyer&apos;s
            side of the table, and rewrote until each one opened with the
            prospect&apos;s situation instead of the advisor&apos;s pitch.
          </p>
          <p>
            That is the training every Speed-to-Lead Agent gets. Rather than a
            brand guide pasted into a chatbot, your follow-up is critiqued and
            rebuilt from the buyer&apos;s perspective, then delivered in seconds
            instead of hours.
          </p>
        </div>
        {/* TODO: before/after evidence block sits here once instrumented
            (Adam: add later). "Before the rebuild, enquiries waited [X hours]
            on average for a first reply. After it, [X seconds]. Reply-to-booked
            -call rate went from [X]% to [X]%." These are the numbers that make
            the page airtight — pull from the next deployment's data. */}
        {/* TODO: financial-advisor testimonial sits directly below the evidence
            block. It should speak to reply QUALITY, not speed. Awaiting an
            approved client testimonial. */}
      </div>
    </section>
  );
}

function MidCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        <p className="font-serif text-2xl md:text-3xl tracking-tight leading-tight text-[#111111]">
          The first reply wins the lead. Make yours the best one too.
        </p>
        <div className="mt-8 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function WhatChanges() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What Changes
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Owners running this did not become faster. Their system did.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            A reply that arrives in seconds while the lead is still on the page
            is a different interaction from one that arrives the next morning.
            One catches the decision already forming. The other reopens a closed
            loop.
          </p>
          <p>
            The Speed-to-Lead Agent runs without you being there. An enquiry
            that arrives at 11pm on a Saturday gets a personalised response
            before midnight. The lead reads it first thing Sunday and has
            already started a conversation with the business.
          </p>
          <p>
            You now step into a conversation that has already started. The
            prospect has already been heard. Their situation has already been
            acknowledged. The call, in many cases, is already booked. Your
            involvement starts from a warmer position, with context already in
            hand and a relationship already underway.
          </p>
          <p className="text-[#111111] font-medium">
            That is a different conversation to have.
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
      body: "One hour where you walk the agent through your methodology, brand voice, proof points, and ideal client profile. The agent learns how you respond to the questions prospects ask before they commit.",
    },
    {
      n: "02",
      title: "The Channel Connection",
      body: "The agent connects to your forms, email inbox, and SMS. It watches for new enquiries across every channel. No developer required.",
    },
    {
      n: "03",
      title: "The Response",
      body: "Every new enquiry gets a personalised reply in seconds. The agent reads the specific message, identifies the situation, and responds in your voice.",
    },
    {
      n: "04",
      title: "The Handoff",
      body: "Every call you take from this point is warm, qualified, and pre-briefed. The first conversation already happened. You step in at the point where your time is actually worth spending.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          The setup is a single session. No technical knowledge required.
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
          Answers to what you are probably thinking right now.
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

function WorksBestWith() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="rounded-2xl bg-[#F9FAFB] border border-black/10 p-8 md:p-12 max-w-3xl mx-auto text-center">
          <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-4">
            Works best with
          </p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111]">
            The Diagnostic Tool
          </h2>
          <div className="mt-6 space-y-5 text-lg text-[#111111]/75 leading-relaxed">
            <p>
              When a prospect comes through the Diagnostic Tool before
              submitting an enquiry, the Speed-to-Lead Agent has their specific
              intake answers to build from. The reply is more personalised and
              the qualification is sharper.
            </p>
            <p>
              The Diagnostic Tool surfaces what the prospect needs. The
              Speed-to-Lead Agent responds to it immediately. Together, you step
              into a call with a prospect who has already identified their
              problem, already received a relevant response, and already been
              qualified against the ideal client profile.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-1 text-[#111111] font-medium hover:text-[#188bf6] transition"
            >
              See the Diagnostic Tool
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
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
          The first reply wins the lead. Right now, yours arrives in hours and
          sounds like everyone else&apos;s.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          That changes in one session. Walk the agent through your methodology,
          your voice, and your ideal client. It is watching every channel and
          answering every enquiry by the end of the week.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}
