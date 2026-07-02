import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import ChatWidget from "@/components/ChatWidget";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/products/content-ecosystem";
const CTA_LABEL = "Book the Strategy Session";

export const metadata: Metadata = {
  title: "The Content Ecosystem | Inbound That Runs Itself, Owned by You",
  description:
    "The complete inbound system: a Living AI Website, a weekly content engine, and a diagnostic that qualifies visitors. It publishes every week without you.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { url: PAGE_PATH, title: "The Content Ecosystem" },
};

// AEO: self-contained, extractable definition of the entity.
const ANSWER_FIRST =
  "The Content Ecosystem is a complete inbound marketing system trained on a business's methodology, voice, and proof points. It is made up of three pieces: a Living AI Website that writes and publishes long-form content on a schedule, a weekly content engine that produces the piece and the companion email, and a diagnostic tool that qualifies visitors before the first conversation. It produces, publishes, distributes, and qualifies every week without the owner, and the whole system is owned by the business.";

// Grounds the embedded live-demo chat in this product.
const DEMO_CONTEXT = {
  title: "The Content Ecosystem",
  articleSection: "Content Ecosystem product page",
  metaDescription:
    "The reader is on the Content Ecosystem product page, talking to the chat that runs on the site as a live demonstration.",
  bodyPlain:
    "This page sells the Content Ecosystem: a complete inbound system that writes, publishes, distributes, and qualifies every week without the owner. It is three pieces: a Living AI Website (writes and publishes long-form content on a schedule, optimised for search and AI answer platforms, generates images, no developer needed), a Weekly Content Engine (one core idea per week: a long-form piece, a companion email, and the social layer), and a Diagnostic Tool (qualifies visitors before the first conversation). It is trained on the owner's methodology, voice, and proof points, plus the principles of the greatest marketers and the industry's best practices. The whole site the reader is on was produced by this system. It works best with the Site Conversation Agent, which is the chat the reader is talking to right now. Everything the system produces is owned by the business. Setup is a strategy session plus a two-week build. Have a real conversation about the reader's situation, and offer to book a strategy call with Adam when it fits.",
};

const DEMO_CHIPS = [
  "Did this site really write itself?",
  "Will Google penalise AI content?",
  "How is this different from ChatGPT?",
];

const threePieces = [
  {
    title: "The Living AI Website",
    body: "The site writes long-form content on a schedule, optimises each piece for search engines and AI answer platforms, generates the images, and publishes it. You update the site by telling it what to change, with no developer in the loop.",
  },
  {
    title: "The Weekly Content Engine",
    body: "Each week the system identifies one core idea, writes the long-form piece, broadcasts the companion email to your database, and feeds the social distribution layer. The email drives the reader back to the site, where the next piece of the system is waiting.",
  },
  {
    title: "The Diagnostic Tool",
    body: "A standalone surface on the site that asks the visitor structured questions, identifies what they need help with, and delivers that intelligence to you before the first conversation. When a visitor completes it, the Speed-to-Lead Agent reads the intake and replies in seconds.",
  },
];

const whatItDoes = [
  {
    title: "Publishes long-form content on schedule",
    body: "A new post goes out on the schedule you set, optimised for search engines and for AI answer platforms such as Perplexity and ChatGPT. You approve the strategy. The system handles every detail of execution.",
  },
  {
    title: "Sends the companion email to the database",
    body: "Each piece of long-form content triggers a companion email to the list. The email drives readers back to the site, and it goes out on schedule whether you are available or not.",
  },
  {
    title: "Updates the website without a developer",
    body: "Site changes that previously took two to three days, sometimes longer, now happen on command. You tell the site what to change and the change is live. No developer handoff, no ticket, no waiting.",
  },
  {
    title: "Engages every visitor in a real conversation",
    body: "Paired with the Site Conversation Agent, a visitor who arrives from a piece of content does not hit a contact form. Their questions get answered, their objections get handled, and the call gets booked while they are still on the page.",
  },
  {
    title: "Qualifies visitors before the first conversation",
    body: "Visitors ready to take the next step complete the Diagnostic Tool. They answer structured questions, and you receive their answers before the first conversation. The first call is a continuation, not a discovery call.",
  },
  {
    title: "Gets more effective the longer it runs",
    body: "Every piece of content adds to the indexed asset base. Every completed Diagnostic surfaces new language your prospects use, and that language feeds back into the content, email subject lines, and Diagnostic questions. The system improves with use.",
  },
];

const faqItems = [
  {
    question: "Does this replace my existing website?",
    answer:
      "No. The Living AI Website is built on your existing domain and can be designed to match your current brand. If your existing site is on a platform we support, the content layer can be added to it. If a rebuild makes more sense, that is part of the setup conversation.",
  },
  {
    question: "How does it know what to write about?",
    answer:
      "The Strategy Session establishes the core topic map: the questions your ideal clients are asking, the problems they are searching for answers to, and the keywords that will bring the right visitors to the site. The system draws from that map each week and identifies the highest-value topic to write about next.",
  },
  {
    question: "What does review and approval look like?",
    answer:
      "Each week you receive a draft of the long-form piece and the companion email before they are published. You read, approve, or request changes, and the turnaround is fast. Most owners spend under 30 minutes a week on review.",
  },
  {
    question: "Will Google penalise AI-written content?",
    answer:
      "Google penalises unhelpful content, not content by authorship method. That distinction is stated in their own guidance. The AI content that gets buried is generic output produced at volume with nothing behind it: no methodology, no experience, no point of view. This system produces the opposite, and it was built with deliberate anti-slop discipline. The structures, phrasing habits, and formatting tics that mark content as machine-generated are engineered out before a draft ever reaches you. Every piece is built from your specific expertise, your proof points, and the exact questions your market is asking, then reviewed by you before it publishes. The site you are reading ranks on the same basis.",
  },
  {
    question: "Do I own everything it produces?",
    answer:
      "Completely. Every piece of content, every email, and every Diagnostic response belongs to your business.",
  },
  {
    question: "What happens if I stop working with you?",
    answer:
      "You keep everything. The website, the content, the email list, and the trained system are yours, built as your asset from day one. What continues is the running cost. Like any website, the system has infrastructure behind it: hosting, the AI layer, the integrations that keep it publishing. You pay to keep it running the same way you pay to keep any site online. The difference from the agency model is what ending the relationship costs you. With an agency it costs the strategy, the trained voice, and everything they learned about your market. Here it costs nothing beyond the running costs you were already paying, because the asset was yours from the day it was built.",
  },
  {
    question: "I work in a regulated industry. How is compliance handled?",
    answer:
      "The review step is the compliance gate. Nothing publishes without your approval, and the system is configured during setup with your compliance boundaries: what it can and cannot claim, required disclaimers, restricted topics. For licensed advisors, that means every piece that reaches your audience passed through you first, with the rules already applied before you ever see the draft.",
  },
  {
    question: "Does this work if my audience is niche or highly technical?",
    answer:
      "Yes, and the more niche the audience, the more the training matters. Generic tools produce generic output. This produces content built from your specific expertise and the exact language your market uses, which is precisely what a technical audience notices.",
  },
  {
    question: "I already use ChatGPT. Why would this be different?",
    answer:
      "Because the tool is not the system. ChatGPT gives you a blank page and generic training, which is why its output sounds like everyone else using it, and why the writing still lands on your desk every week. This is different on three levels. It is trained on your methodology, your voice, and your proof points, so the content could only have come from your business. It is built on your industry's best practices, so it writes for your specific market rather than for business in general. And it runs as a system, on a schedule, connected to your site, your email list, and your qualification layer. Your involvement drops to direction and approval, and the production happens without you. The difference is visible on this page.",
  },
  {
    question: "How long before I see results in search?",
    answer:
      "SEO compounds over time. The first results typically appear within three to six months, and the businesses that see the strongest results are the ones that have been running the system consistently for twelve months or more, because the indexed asset base is what drives compounding. The system is designed to run consistently without requiring you, which is why the compounding happens.",
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "The Content Ecosystem",
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
      name: "The Content Ecosystem",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

export default function ContentEcosystemPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <ThisSiteIsTheProduct />
        <ChatWidget
          article={DEMO_CONTEXT}
          eyebrow="Live demo. You are talking to the site."
          heading="This is the conversation every visitor gets."
          intro="The chat that runs on this site is the Site Conversation Agent. Ask it anything about the Content Ecosystem, or about your situation."
          sectionId="content-chat"
          chips={DEMO_CHIPS}
        />
        <TheContentGap />
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
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          Content Ecosystem
        </p>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
          This website is alive.
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
          Everything you are reading was produced by the system this page sells.
          The articles, the emails behind them, the images, the rankings that
          brought you here. It writes and publishes every week, updates itself
          on command, and will hold a real conversation with you right now if
          you open the chat. You direct the strategy while the site does the
          marketing.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}

function ThisSiteIsTheProduct() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 pb-8 text-center">
        <div className="space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] leading-tight">
            You are not reading about the Content Ecosystem. You are inside one.
          </p>
          <p>
            The article that brought you here was written, illustrated,
            optimised, and published by this site. The email that may have
            landed in your inbox this week came from the same system. No writer
            was briefed, no agency was managed, and no developer touched a
            thing.
          </p>
          <p>
            Test it. Open the chat just below and ask it anything about the
            Content Ecosystem, or about your situation. That conversation is the
            same one it will have with every visitor to your site.
          </p>
          <p className="text-[#111111] font-medium">
            If AI content were generic, you would have noticed by now.
          </p>
        </div>
      </div>
    </section>
  );
}

function TheContentGap() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Content Gap
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Fifty-two indexed assets, or three and a stall.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            A service business that publishes one long-form piece per week for a
            year has 52 indexed assets compounding in search. Most publish three
            pieces and stop.
          </p>
          <p>
            The reason is structural, not motivational. You are the content
            system. Content gets produced when you have time, and you never have
            time. Client work always takes priority because it is billable and
            immediate. Content is valuable and deferred, every week, until weeks
            become months and months become a website that has not been updated
            since the last slow period.
          </p>
          <p className="text-[#111111] font-medium">
            The Content Ecosystem removes you from the production loop entirely.
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
          Most inbound systems depend on you to keep them alive.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            A blog that depends on you to write it stops when work picks up. An
            email list that depends on you to send it goes quiet for weeks. A
            website that depends on a developer to update it falls behind the
            business it is supposed to represent.
          </p>
          <p>None of these are failures of discipline. They are failures of design.</p>
          <p>
            Content, email, and SEO only compound if they are consistent, and
            they are only consistent if the system producing them does not
            require you. Most systems do. You are the writer, the scheduler, the
            approver, and the sender, and removing any one of those stops the
            whole thing.
          </p>
          <p>
            You may have already tried to solve this by handing it to an agency.
            Most owners at your stage have. The work came back competent and
            hollow, because nobody outside the business can articulate the
            methodology the way you do. And when the relationship ended,
            everything walked out the door with them: the templates, the
            strategy, the accumulated understanding of your market. You paid for
            years and kept nothing.
          </p>
          <p>
            That is the second design failure. The first system depended on you,
            and the second one was rented.
          </p>
          <p className="text-[#111111] font-medium">
            The Content Ecosystem is neither. It is trained on your methodology,
            it runs without you, and it belongs to you. The system is the asset,
            and the asset stays inside the business.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItIs() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
            What It Is
          </p>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
            The complete inbound infrastructure. It produces, publishes,
            distributes, and qualifies every week without you.
          </h2>
          <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
            <p>
              Where traditional content marketing stops at getting people to
              read, the Content Ecosystem gets them to participate. The visitor
              does not just consume the content and leave. They respond to it,
              qualify themselves through it, and start a conversation with your
              business before you are ever involved. That is the structural
              difference between a content strategy and a content ecosystem.
            </p>
            <p>
              Every piece of the system is built from three sources: your
              methodology, voice, and proof points, so the content could only
              have come from your business. The principles used by the greatest
              marketers in the world, so it converts rather than just informs.
              And your industry&apos;s best practices, so it speaks to your
              specific market rather than to business in general.
            </p>
            <p className="text-[#111111] font-medium">
              The system is made up of three pieces.
            </p>
          </div>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {threePieces.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-[#111111]">
                {p.title}
              </h3>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 max-w-3xl mx-auto text-center text-lg text-[#111111]/80 leading-relaxed">
          <p>
            Each piece works alone. Together they form the inbound engine:
            content brings the right visitors, the Diagnostic qualifies them,
            and the reply reaches them before a competitor sees the
            notification.
          </p>
        </div>
        <div className="mt-8 rounded-2xl bg-white border border-black/10 p-8 md:p-10 max-w-3xl mx-auto text-center">
          <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
            Works best with
          </p>
          <h3 className="font-serif text-2xl tracking-tight text-[#111111]">
            The Site Conversation Agent
          </h3>
          <p className="mt-3 text-[#111111]/75 leading-relaxed">
            The conversation you can have with this page runs on it. It engages
            every reader in a real conversation, answers their questions, and
            books the call while they are on the page. Most businesses deploy
            the two together: the Content Ecosystem brings the visitors, and the{" "}
            <Link
              href="/products/site-conversation-agent"
              className="text-[#188bf6] underline underline-offset-4 hover:text-[#0d78dc] transition"
            >
              Conversation Agent
            </Link>{" "}
            turns each one into a qualified conversation.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatItDoes() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          What It Does
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          Six things that happen without your involvement.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {whatItDoes.map((it) => (
            <div
              key={it.title}
              className="bg-[#F9FAFB] border border-black/10 rounded-2xl p-8"
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
      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Proof
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-white">
          The proof is the page.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-white/75 leading-relaxed">
          <p>
            You have been reading system output since you arrived, and if it
            read like AI content, you would have left.
          </p>
          <p>
            I built this system because I was the problem it solves. Twenty-six
            years building businesses, fifteen of them running a marketing
            agency, and my own marketing still only happened when client work
            allowed. Which meant it did not happen.
          </p>
          <p>
            The system now runs the marketing I could not get to. It produces
            and publishes the blog, sends the email, manages the website, and
            feeds the distribution layer. The tasks that consumed 36 hours of my
            week run without me.
          </p>
          <p>
            The developer I used for site changes is no longer needed for
            day-to-day updates. Changes that took a ticket, a handoff, and a two
            to three day turnaround now happen on command. That cost is gone
            entirely.
          </p>
          <p className="text-white font-medium">
            Clients who run the system see the same mechanism play out in their
            own market. Content trained on a specific methodology attracts a
            different visitor than generic content does. Better-fit readers
            become better-fit leads, because the content could only have come
            from one business: theirs.
          </p>
        </div>
        {/* TODO: when numbers exist, add (1) your own system stats as a visual
            grid after the developer paragraph — consecutive weeks published,
            keywords ranking, conversations held; (2) one client's real numbers
            replacing the final general claim; (3) a testimonial on VOICE
            accuracy ("it sounds like me") directly after this section. */}
      </div>
    </section>
  );
}

function MidCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        <p className="font-serif text-2xl md:text-3xl tracking-tight leading-tight text-[#111111]">
          One strategy session, two weeks to build, and the site runs itself
          from there.
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
          Content stops depending on your discipline.
        </h2>
        <div className="mt-10 space-y-6 text-lg text-[#111111]/80 leading-relaxed">
          <p>
            The system does not require motivation, a good week, or time you do
            not have. A post that goes out at 6am on a Tuesday while you are on a
            call is simply what the system does. The email that lands in a
            prospect&apos;s inbox on Monday morning was not written that morning:
            it was produced on schedule, reviewed by you when it was convenient,
            and sent without further involvement.
          </p>
          <p>
            One owner deployed this, went on leave for two weeks, and came back
            to a website that had published, an email list that had received two
            new issues, and a Diagnostic queue with qualified prospects waiting.
          </p>
          <p className="text-[#111111] font-medium">
            That is the standard this is built to. The system should run while
            you are unavailable. If it requires you to function, it is not done.
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
      title: "The Strategy Session",
      body: "One session where you set the content strategy: the core topics, the ideal client profile, the keyword map, and the email and Diagnostic architecture. The system learns your methodology, brand voice, and proof points.",
    },
    {
      n: "02",
      title: "The Build",
      body: "The pieces are built and connected: the Living AI Website, the Weekly Content Engine, and the Diagnostic Tool. Each is trained on your specific materials, and the integrations are set up and tested.",
    },
    {
      n: "03",
      title: "The Launch",
      body: "The first piece of long-form content goes out. The email goes to the list. The Diagnostic is live on the site. The first week gives you a working reference for what the output looks and sounds like before the system runs on its own.",
    },
    {
      n: "04",
      title: "The Run",
      body: "Every week from that point, the system identifies the core idea, produces the long-form piece, sends the email, and feeds the distribution layer. You review and approve. The production is no longer yours to do.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4 text-center">
          How It Works
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-[1.1] text-[#111111] text-center">
          The setup is a two-session process. Two weeks from start to live.
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
        <p className="text-[#188bf6] text-sm text-center mb-8">
          Still deciding?{" "}
          <a
            href="#content-chat"
            className="font-medium underline underline-offset-4 hover:text-[#0d78dc] transition"
          >
            The chat at the top of this page
          </a>{" "}
          will answer anything this page did not.
        </p>
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4 text-center">
          Common questions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-10 text-center">
          What owners ask before they hand over their marketing.
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
          Right now your website is a brochure that waits for you to find time.
          It could be alive instead.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          One strategy session to encode your methodology and two weeks to
          build. Every week after that, the system writes, publishes,
          distributes, and qualifies while you deliver the work.
        </p>
        <div className="mt-10 flex justify-center">
          <CTAButton size="lg">{CTA_LABEL}</CTAButton>
        </div>
      </div>
    </section>
  );
}
