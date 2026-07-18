import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import ChatWidget from "@/components/ChatWidget";
import { SITE_URL, OG_DEFAULTS } from "@/lib/site";

const PAGE_PATH = "/products/site-conversation-agent";
const CTA_LABEL = "Book the Setup Session";

export const metadata: Metadata = {
  title: "The Site Conversation Agent | Turn Visitors Into Booked Calls",
  description:
    "A conversational AI that engages, qualifies, and books your visitors in real time, in your voice. Not a chatbot. Embeds on any platform. Try it on this page.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...OG_DEFAULTS, url: PAGE_PATH, title: "The Site Conversation Agent" },
};

// AEO: self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "The Site Conversation Agent is a conversational AI embedded on every page of a business's website. It engages every visitor in a real conversation, qualifies them against the ideal-client profile, handles objections in the owner's voice, and books qualified prospects directly into the owner's calendar. The owner is never in the conversation. It is not a scripted chatbot, and it embeds on any platform with a single script tag.";

// Context that grounds the embedded live-demo chat in this product.
const DEMO_CONTEXT = {
  title: "The Site Conversation Agent",
  articleSection: "Site Conversation Agent product page",
  metaDescription:
    "The reader is on the Site Conversation Agent product page and is talking to the agent itself as a live demonstration.",
  bodyPlain:
    "This page sells The Site Conversation Agent: a conversational AI embedded on a business's website that engages every visitor, qualifies them against the ideal client profile, handles objections in the owner's voice, and books qualified prospects into the owner's calendar in real time. It is not a scripted chatbot. It embeds on any platform (Squarespace, WordPress, custom) with one script tag, with a one-hour setup session. Proof: a financial advisor client's average lead asset value grew from about $1M to about $10M, the system now regularly books prospects with over $100M in assets (previous record was a single $42M lead), and cost per lead fell 30 to 50%. The reader talking to you now is inside the live demonstration: you are the product. Have a real conversation about their situation, qualify gently, and offer to book a call with Adam when it fits.",
};

const DEMO_CHIPS = [
  "Convince me you're not a chatbot.",
  "Why wouldn't I just use a contact form?",
  "How do you decide if someone is a good fit?",
];

const faqItems = [
  {
    question: "Is this just another chatbot?",
    answer:
      "It looks like one, and that is where the resemblance ends. A chatbot runs a script: keyword matching, canned answers, and a dead end the moment the question gets specific. This holds a conversation built from your methodology and your ideal client profile, which is why the demo sits at the top of this page instead of a feature list. Two messages with it will answer this question better than this paragraph can.",
  },
  {
    question: "Will it sound like me?",
    answer:
      "Yes. It was trained on your specific materials: your methodology, your voice, your proof points, and how you respond to the questions prospects ask before they commit. The conversation reads like the prospect reached you on a good day with time to spare.",
  },
  {
    question: "What happens when it gets a question it cannot answer?",
    answer:
      "It knows the edges of what it knows. When a conversation falls outside its training, it says so, captures the question, and hands the prospect to you with the full context rather than guessing. The visitor never receives a confident wrong answer.",
  },
  {
    question: "Will it annoy my visitors?",
    answer:
      "No popups, no chasing the cursor, no windows that open themselves mid-paragraph. The agent is present when the visitor has something to ask, and the conversation starts on their terms. It earns attention by being worth talking to, not by demanding it.",
  },
  {
    question: "Do visitors know they are talking to AI?",
    answer:
      "That is configurable, and our recommendation is honesty. A visitor who gets a specific answer to the question they asked does not mind that it came from AI. What loses trust is a scripted bot pretending to be a person. Honest AI that holds up in conversation does not have that problem.",
  },
  {
    question: "Can I see the conversations?",
    answer:
      "Every conversation is captured and visible to you. That serves two purposes. You can verify how the agent handles real visitors, especially in the early weeks. And the conversations themselves become an asset: the exact language your market uses to describe its problems, feeding back into your content, your ads, and the agent's own training.",
  },
  {
    question: "I work in a regulated industry. Can it be constrained?",
    answer:
      "Yes. The agent is configured during setup with explicit boundaries: what it can and cannot say, restricted topics, required disclaimers. For licensed advisors, that means it educates and qualifies without advising, and escalates anything that crosses the line to you rather than answering it.",
  },
  {
    question: "Does this replace my sales process?",
    answer:
      "It replaces the part before your sales process: the waiting, the chasing, and the discovery work that eats the first twenty minutes of every call. Your process starts where it always did, except the prospect arrives qualified, briefed, and already in a conversation with your business.",
  },
  {
    question: "Do I own the conversations it captures?",
    answer:
      "Completely. Every conversation, every transcript, and all the market language they surface belong to your business.",
  },
  {
    question: "How long does setup take?",
    answer:
      "One hour for the setup session, and the agent is live on your site by the end of the week.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Site Conversation Agent",
  description: ANSWER_FIRST,
  category: "AI marketing software",
  brand: { "@type": "Brand", name: "Adam Sowden" },
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
      name: "The Site Conversation Agent",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function SiteConversationAgentPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <ChatWidget
          article={DEMO_CONTEXT}
          eyebrow="Live demo. You are talking to the product."
          heading="Ask it anything, right now."
          intro="This is the exact conversation your prospects would have. Ask it about your situation, or the objection in your head this second."
          sectionId="live-demo"
          chips={DEMO_CHIPS}
        />
        <SilentMajority />
        <TheProblem />
        <WhatItIs />
        <WhatItDoes />
        <Proof />
        <MidCTA />
        <WhatChanges />
        <HowItWorks />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter showAiToolHuntBadge showToolPilotBadge />
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
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          Site Conversation Agent
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          Your next qualified prospect is on your website right now.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          The Site Conversation Agent engages them, qualifies them, handles
          their objections, and books the call. You are not in the conversation
          and you do not need to be. There is no need to take anyone&apos;s word
          for it either: the agent is running on this page. Ask it something.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function SilentMajority() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="rounded-2xl bg-[#eff6ff] p-8 md:p-14 max-w-4xl mx-auto text-center">
          <p className="text-[#188bf6] text-xs uppercase tracking-[0.18em] font-semibold mb-4">
            The Silent Majority
          </p>
          <h2 className="font-serif text-2xl md:text-4xl tracking-tight leading-tight text-[#111111]">
            Open your analytics. Compare last month&apos;s visitors to last
            month&apos;s enquiries. The gap between those two numbers is why we
            built the Conversation Agent.
          </h2>
          <div className="mt-6 space-y-5 text-lg text-[#111111]/75 leading-relaxed">
            <p>
              For most service businesses, the overwhelming majority of visitors
              leave without a word. They were not the wrong visitors. The site
              gave them nothing to do except read, plus a form that asks for
              their details in exchange for silence.
            </p>
            <p>
              Every one of those visitors arrived with a question. The site
              could not answer it. So they left, and some of them asked a
              competitor instead.
            </p>
            <p className="text-[#111111] font-medium">
              The Site Conversation Agent gives every visitor a conversation
              instead of a form. The question they arrived with gets answered
              while they are still on the page, and the ones who fit your ideal
              client profile leave with a call booked instead of a tab closed.
            </p>
          </div>
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
          Most websites are built for consumption, not conversation.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            A visitor reads the page, decides they are interested, and then hits
            a form. The form asks for their name, email, and maybe a message.
            Then it thanks them and tells them someone will be in touch.
          </p>
          <p>
            That someone is you, and you are currently with a client, in a
            meeting, or asleep. By the time you respond, the window has closed.
            The prospect has moved on, found an alternative, or lost the urgency
            they had when they first reached out.
          </p>
          <p className="text-[#111111] font-medium">
            None of that is a responsiveness problem. The website was never
            designed to hold a conversation.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItIs() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          What It Is
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          A chatbot, if a chatbot could hold a real conversation.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Every visitor to your site has already met a chatbot, and the
            experience trained them to ignore the widget in the corner. It
            matched keywords instead of reading the question, served canned
            answers from a script, and fell apart the moment they asked
            something that mattered. Nobody blames them for closing it.
          </p>
          <p>
            This looks the same on the page. What sits behind it is different,
            and you can tell within two messages.
          </p>
          <p>
            We built it from three sources. The first is your specific
            materials: methodology, brand voice, proof points, and a detailed
            model of your ideal client. The second is the principles behind the
            most effective first conversations in sales: how to surface a
            prospect&apos;s real situation, how to identify fit, and how to move
            the right people forward without pressure. The third is your
            industry&apos;s best practices, so it speaks to your specific market
            rather than to business in general.
          </p>
          <p>
            A chatbot follows its script regardless of what the visitor says.
            This reads the message in front of it and responds to that. It
            answers the question the visitor asked, in your voice, with your
            reasoning, and it knows the difference between a prospect who needs
            education, a prospect who needs a call, and a visitor who is not a
            fit at all.
          </p>
          <p>
            The mechanism behind the results: we build your agent by simulating
            your ideal client, critiquing your existing language from that
            perspective, and rewriting against the critique. The output is a
            conversation built from the buyer&apos;s frame instead of the
            seller&apos;s. That distinction is what moves a prospect from reading
            to booking.
          </p>
          <p className="text-[#111111] font-medium">
            There is no sales call required to see it work. The agent on this
            page is the product. Ask it anything right now.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItDoes() {
  const items = [
    {
      title: "Engages every visitor immediately",
      body: "No wait, no form, no auto-reply. The visitor sends a message and the conversation starts. The agent reads their situation and responds to it.",
    },
    {
      title: "Qualifies against the ideal client profile",
      body: "It knows who belongs in the pipeline, and it does not advance poor-fit prospects or turn away good ones. Your time is protected before the first call is ever booked.",
    },
    {
      title: "Books calls directly into your calendar",
      body: "Qualified prospects reach the booking step inside the conversation. The call lands with context already captured: what the prospect said, what they need, and what moved them to reach out.",
    },
    {
      title: "Handles objections in your voice",
      body: "The agent was trained on how you respond to the questions prospects ask before they commit. The prospect never notices you were not there.",
    },
    {
      title: "Captures the language the market uses",
      body: "Every conversation surfaces the exact words prospects use to describe their problem. That language feeds back into content, ad copy, and future campaigns. The agent gets more effective the more conversations it has.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Does
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Five things that happen every time a visitor starts a conversation.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {items.map((it, i) => (
            <div
              key={it.title}
              className={`bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 ${
                i === items.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-[#111111]">
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
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          The same traffic. The same site. A different conversation.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            A financial advisory client rebuilt their acquisition around this
            methodology and watched average lead asset value go from $1 million
            to $10 million within months. No new ad platform. No increased
            budget. Those numbers came from{" "}
            <Link
              href="/products/marketing-ecosystem"
              className="text-[#188bf6] underline underline-offset-4 hover:text-white transition"
            >
              the full system
            </Link>
            . The conversation layer was one of the components that produced
            them, and it is the piece this page sells.
          </p>
          <p>
            When we audited the advisor&apos;s existing site, the copy was not
            lacking polish. It was speaking in the seller&apos;s language: the
            credentials, the process, the offer. So we simulated the ideal
            client, read every page and every response from the buyer&apos;s
            side of the table, and rebuilt the conversation from their frame.
            What changed was not how the site sounded. It was who kept talking
            to it.
          </p>
          <p className="text-white font-medium">
            Better-fit visitors stayed in the conversation, poor-fit visitors
            were filtered before they cost anyone a call, and the calls that got
            booked arrived pre-briefed. That is what the numbers reflect, and
            the agent on this page runs the same shift live.
          </p>
        </div>
        {/* TODO: agent-specific numbers slot in here when they exist:
            conversations started per hundred visitors, conversation-to-booking
            rate, share of calls booked outside business hours. */}
      </div>
    </section>
  );
}

function MidCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        <p className="font-serif text-2xl md:text-3xl tracking-tight leading-tight text-[#111111]">
          You have already met the product. Putting it on your site takes one
          session.
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
          The first conversation stops waiting for business hours.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Tuesday, 9:47pm. A visitor lands on one of your articles from a
            search. They have the question they would never bother typing into a
            contact form, because a contact form is a promise of silence. So
            they ask the agent instead. It answers, asks about their situation,
            recognises a fit, and offers your Thursday calendar. They take the
            10am.
          </p>
          <p>
            You find out the next morning: a booked call, a transcript, and a
            briefing on who they are, what they need, and what moved them to
            reach out. The first conversation happened without you. The
            relationship did not wait for business hours.
          </p>
          <p className="text-[#111111] font-medium">
            That is not the exceptional case. It is what the system does with
            every visitor who engages, at whatever hour they decided to show up.
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
      body: "One hour where you walk the agent through your methodology, brand voice, proof points, and ideal client profile. The agent learns your business.",
    },
    {
      n: "02",
      title: "The Integration",
      body: "The agent is embedded on your site. It works on any platform: Squarespace, WordPress, custom builds. No developer required: one script tag and it is live.",
    },
    {
      n: "03",
      title: "The Conversation",
      body: "Every visitor who engages gets a real conversation. The agent qualifies, educates, handles objections, and routes the right prospects to a booking. You are not in the conversation.",
    },
    {
      n: "04",
      title: "The Handoff",
      body: "Every call you take from this point is warm, qualified, and pre-briefed. The first conversation already happened. You step in where your time is worth spending.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          The setup is a single conversation. No technical knowledge required.
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

function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Your next qualified prospect is on your website right now.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          You have already met the product. It is the conversation you had
          further up this page. One session to train it on your business, one
          script tag to put it on your site, and every visitor from that point
          gets the same conversation you just did, in your voice instead of
          ours.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}
