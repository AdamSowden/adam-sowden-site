import type { Metadata } from "next";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AnalyzerUrlForm from "@/components/AnalyzerUrlForm";

// Home page, Smart Site version. Copy source:
// ai-marketing-agency/clients/adam-sowden/drafts/home-page-smart-site-v7.md
// Written to Persona 4 (The Besieged Owner). US spelling. The analyzer is
// the front door; the dashboard it mentions is being built before traffic
// runs to this page.

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "AI Websites That Run Your Sales and Marketing | Adam Sowden",
  description:
    "A Smart Site is an AI website trained on your business. It writes your content, qualifies visitors, books appointments and follows up every lead, 24/7.",
};

const homeFaqItems = [
  {
    question: "What is a Smart Site?",
    answer:
      "An AI-integrated website that can talk and make decisions, live. It's trained on your business and works 24 hours a day on one mission: booking qualified people into your calendar. It writes your content, talks to every visitor, qualifies them, books appointments and follows up every lead. You approve the content and see everything else on a dashboard.",
  },
  {
    question: "What is the Smart Site Analyzer?",
    answer:
      "Enter your website address and the analyzer reads your public pages and reports what it finds: how a ready buyer can get in touch, whether AI search engines can read the site, how it's built, how fast it loads, and the three things to fix first. The first finding is on screen in about a minute with no email required. The full report, with every finding and its evidence, is sent by email.",
  },
  {
    question: "How is a Smart Site different from a normal website?",
    answer:
      "A normal website is mindless. It does what it was last programmed to do and waits for a visitor to find the form. Everything else needs a person: the reply, the content, the follow-up. A Smart Site knows your business and decides live, for each visitor, what to say and whether to book them. It does the work itself, at any hour.",
  },
  {
    question: "How is this different from my agency or web developer?",
    answer:
      "Your agency and your developer work on your business when they're working. A Smart Site works on it every hour of every day. It writes, replies, follows up and books on its own, and when you want something changed you say so and it's done. Everything it learns about your business stays with you.",
  },
  {
    question: "Do I have to rebuild my website?",
    answer:
      "No. If your current site already ranks well, we move it onto a Smart Site with every page redirected, so you get all the functionality and the rankings you've built carry over.",
  },
  {
    question: "Will it sound like every other AI website?",
    answer:
      "No. Before anything is built, the site learns how you sell and who you sell to. Everything it writes and says comes from that. Off-the-shelf AI isn't trained on your business, which is why it sounds like everyone else using the same tool.",
  },
  {
    question: "Does it work with my CRM?",
    answer:
      "It may integrate with your current CRM. Every Smart Site to date has been built inside GoHighLevel, and they have the capacity to integrate with most CRMs. We don't use GoHighLevel's built-in AI chat. The Smart Site uses its own conversation agent, trained on your business.",
  },
  {
    question: "Do I need the whole site, or can I just pay for some features?",
    answer:
      "You can start with some. The Speed-to-Lead Agent and the Site Conversation Agent are sold on their own and work on the website you already have. The analyzer shows where your current site is losing the most, which is usually the right place to start.",
  },
  {
    question: "What does a Smart Site cost?",
    answer:
      "Every Smart Site is quoted individually, because each one is built around a different business and the way it sells. There's a monthly cost to run it. It takes over work you're paying people and agencies to do now, so it costs less than the people it replaces, and because it never stops, that work gets done at every hour instead of office hours. Start with the analyzer. It shows what your site needs, and the quote is built from there.",
  },
  {
    question: "How much of my time does it take?",
    answer:
      "About two hours during the build, so the site learns your business properly. After that, you approve the content it writes before it goes out. The dashboard shows every inquiry and what happened to it.",
  },
  {
    question: "How long before I see results?",
    answer:
      "The conversation agent and the follow-up start working the moment the site goes live. How long the build takes depends on the size and complexity of the site, and the timeline is written down before work begins.",
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
        <WhatItDoes />
        <YourPart />
        <Proof />
        <TrustCluster />
        <HomeFAQ />
        <FinalCTA />
      </main>
      <SiteFooter showAiToolHuntBadge showToolPilotBadge showLaunchpadlyBadge />
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
            Smart Sites
          </p>
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-[1.02] text-[#111111]">
            Turn your website into a{" "}
            <span className="text-[#188bf6]">24/7 sales and marketing team</span>.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-2xl leading-relaxed">
            A Smart Site is an AI-integrated website that can talk and make
            decisions, live. It&apos;s trained on your business. It writes your
            content, qualifies visitors, books appointments and follows up
            every lead, 24/7.
          </p>
          <p className="mt-4 text-base md:text-lg font-medium text-[#111111]">
            Since June 30, every appointment in my calendar was booked by my
            website.
          </p>
          <div className="mt-10">
            <p className="text-sm font-medium text-[#111111] mb-3">
              Start with your website.
            </p>
            <AnalyzerUrlForm />
            <p className="mt-3 text-xs text-black/55 max-w-md">
              Free. Real findings about your own site in about a minute. No
              email needed to see the first one.
            </p>
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
    {
      value: "Every",
      label: "appointment in my calendar since June 30 was booked by my website",
    },
    {
      value: "$1B+",
      label: "in investable assets booked for one advisor client*",
    },
    { value: "10x", label: "lead quality for advisor clients" },
  ];
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid sm:grid-cols-3 gap-10">
          {stats.map((s) => (
            <div key={s.value} className="text-center sm:text-left">
              <div className="font-serif text-4xl md:text-5xl tracking-tight text-[#111111]">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-black/60">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-black/45 max-w-3xl">
          *Combined investable assets of the prospects who booked appointments
          with one financial advisor client. Not assets under management,
          sales or revenue.
        </p>
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Old versus new
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Old websites are mindless. They need people to run them.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Your website does what it was last programmed to do, and then it
          waits. A visitor has to find the form. The reply comes when someone
          in the office gets to it, and the content gets written when the
          agency does it. The follow-up was set up once, on one service, and
          nobody has looked at it since. And the people already in your
          database only hear from you when there is time, which is rarely.
        </p>
        <p className="mt-5 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          None of that is anyone&apos;s fault. That&apos;s just what old
          technology is. It can&apos;t decide anything, so the work only
          happens when a person is working. And no person can compete with a
          site that&apos;s trained on your business and never stops. Nobody,
          however good, is working on your business at 11pm on a Sunday when a
          ready buyer lands on your site.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              People have hours. Your site doesn&apos;t.
            </h3>
            <p className="text-[#111111]/70 leading-relaxed">
              Your sales team, your marketing department and your appointment
              setter all work set hours. Your website is open all night, and
              right now it does nothing with that time. A Smart Site keeps
              doing those jobs after everyone&apos;s gone home.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Mindless versus trained.</h3>
            <p className="text-[#111111]/70 leading-relaxed">
              An old website can&apos;t tell a ready buyer from someone
              browsing, so it treats them the same. A Smart Site knows your
              business and your customers. It decides live, for each visitor,
              what to say, whether they&apos;re a fit and when to book them in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatItDoes() {
  const jobs = [
    {
      n: "01",
      title: "Your concierge and appointment setter.",
      body:
        "A conversation on every page that answers questions properly and books the people who are a fit straight into your calendar. No hard sell. If you sell over appointments, people turn up already knowing what you do and why it suits them.",
    },
    {
      n: "02",
      title: "Your sales follow-up.",
      body:
        "Every form, email and text gets a personal reply in seconds, on every service, not just one. Reminders and nurture go out on the schedule you set, and your whole database hears from you regularly, not just when someone gets around to it. Your dashboard shows every inquiry and what happened to it: who came in, when they were answered, what was sent and whether they booked.",
    },
    {
      n: "03",
      title: "Your marketing department.",
      body:
        "Content that ranks on Google and gets cited by AI search, written in your voice every week and built to qualify the reader before they contact you. Once you approve it, it's published and sent to your database. Every blog on this site and every email I send was written and published by the site.",
    },
    {
      n: "04",
      title: "Your web developer.",
      body:
        "New page, new offer, new photo, new price. Tell the site what you want and it builds it. There's no one to chase and no week-long wait, and everything it builds loads fast because it was built properly.",
    },
  ];
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          The Smart Site
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          One website doing the work of your sales and marketing team.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          A Smart Site does four jobs you&apos;re paying people to do part
          time, and it does them around the clock.
        </p>

        <div className="mt-14 grid md:grid-cols-2 gap-6 md:gap-8">
          {jobs.map((j) => (
            <div
              key={j.n}
              className="bg-white border border-black/10 rounded-2xl p-8"
            >
              <div className="text-sm text-[#188bf6] font-mono font-medium">
                {j.n}
              </div>
              <h3 className="mt-2 text-xl font-semibold">{j.title}</h3>
              <p className="mt-3 text-[#111111]/70 leading-relaxed">{j.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white border border-black/10 rounded-2xl p-8">
          <h3 className="text-xl font-semibold">What makes it smart.</h3>
          <p className="mt-3 text-[#111111]/70 leading-relaxed max-w-3xl">
            It has a brain: before anything is built, it learns your services,
            your customers and how you sell. It&apos;s trained on best-practice
            marketing, sales and technology. And it has one mission, which is
            to book qualified people into your calendar. Everything it does is
            aimed at that, which is why it can make decisions live instead of
            waiting to be told.
          </p>
        </div>

        <p className="mt-10 text-lg md:text-xl font-medium text-[#111111] max-w-2xl">
          More sales from the people already finding you, and nothing for you
          to run.
        </p>
      </div>
    </section>
  );
}

function YourPart() {
  const items = [
    {
      title: "Before it goes live.",
      body:
        "About two hours of your time during the build, so the site learns your business properly.",
    },
    {
      title: "After it goes live.",
      body:
        "You approve any content the site writes before it's published or sent to your database. That is a yes or a no on each piece, not a job. Everything else, you can watch on the dashboard: every inquiry, answered or not, booked or not.",
    },
    {
      title: "What you own.",
      body:
        "The site, the content, and everything it learned about your business. If we ever part ways, it all stays with you.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Your part
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          Your part takes about two hours.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          You tell me how you sell and who you sell to. I build the Smart Site
          around that. If your current site already ranks well, you
          don&apos;t have to start again: we move it onto a Smart Site with
          every page redirected, so the rankings you&apos;ve built carry over.
        </p>
        <div className="mt-14 grid md:grid-cols-3 gap-10 md:gap-12">
          {items.map((it) => (
            <div key={it.title}>
              <h3 className="text-xl font-semibold mb-3">{it.title}</h3>
              <p className="text-[#111111]/70 leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const results = [
    "Clients who depended on an agency for content, copy and strategy now run their marketing without one.",
    "Website updates that took two or three days now happen on command.",
    "For financial advisor clients, average lead value went from about $1 million to about $10 million in assets, while cost per lead fell by 30 to 50 percent.",
  ];
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium mb-4">
          Results
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight max-w-3xl leading-[1.1] text-[#111111]">
          My own website is the proof.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl leading-relaxed">
          Since June 30, every appointment in my calendar has been booked by
          my website. Not by people finding a booking form: the site started
          the conversation, answered their questions, worked out whether they
          were a fit and booked them in. Over the same months, every blog post
          and every email I sent was written and published by the site.
        </p>
        <h3 className="mt-12 text-sm uppercase tracking-[0.18em] text-black/50 font-medium">
          Client results
        </h3>
        <ul className="mt-5 grid md:grid-cols-3 gap-8">
          {results.map((r) => (
            <li
              key={r}
              className="bg-white border border-black/10 rounded-2xl p-7 text-[#111111]/80 leading-relaxed"
            >
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TrustCluster() {
  const signals = [
    {
      label: "SSL Secured",
      icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    },
    {
      label: "No lock-in contracts",
      icon: <polyline points="20 6 9 17 4 12" />,
    },
    {
      label: "Free site analyzer, first finding with no email",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      ),
    },
    {
      label: "Privacy protected",
      icon: (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      ),
    },
  ];

  return (
    <section className="bg-white border-y border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {signals.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 text-sm text-black/60 font-medium"
          >
            <svg
              className="w-[18px] h-[18px] text-[#0d9488] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {s.icon}
            </svg>
            {s.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeFAQ() {
  return (
    <section className="bg-[#F9FAFB] border-y border-black/5">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Common questions
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[#111111] mb-4">
          Answers to what you&apos;re probably thinking right now.
        </h2>
        <p className="text-base md:text-lg text-[#111111]/70 leading-relaxed mb-10">
          These are the questions every business owner asks before starting.
          Read them before deciding.
        </p>
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

function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
          Rate your site.
        </h2>
        <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          Find out how your site stacks up and how to get it performing. The
          analyzer reads your site and shows you the three things to fix
          first. Free, about a minute, and you don&apos;t need to give an
          email to see the first finding.
        </p>
        <div className="mt-10 flex justify-center">
          <AnalyzerUrlForm />
        </div>
      </div>
    </section>
  );
}
