import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/products";

export const metadata: Metadata = {
  title: "Products | Six AI Marketing Systems That Run Without You",
  description:
    "Six modular AI marketing systems from Adam Sowden. Buy the ones that fit: lead response, warm outreach, on-site conversation, and your own AI marketing team.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { url: PAGE_PATH, title: "Products — Adam Sowden" },
};

const products = [
  {
    tag: "Lead response",
    title: "The Speed-to-Lead Agent",
    benefit: "Be the first to reply. Every time.",
    body: "An AI agent that watches your forms, email, and SMS around the clock and replies to every new enquiry in seconds, before a competitor sees it.",
    href: "/products/speed-to-lead-agent",
  },
  {
    tag: "Engagement",
    title: "The Outreach Agent",
    benefit: "Turn engagement into conversations.",
    body: "Finds the people already interacting with you and continues the conversation in the right channel. Warm relationship building, not cold prospecting.",
    href: "/products/outreach-agent",
  },
  {
    tag: "Site conversion",
    title: "The Site Conversation Agent",
    benefit: "Every visitor, a real conversation.",
    body: "A conversational AI on every page that engages visitors, qualifies them, and books calls in real time, while their interest is still live.",
    href: "/products/site-conversation-agent",
  },
  {
    tag: "Self-serve",
    title: "Your Own AI Marketing Team",
    benefit: "One AI. The output of a whole team.",
    body: "Trained on your voice and methodology, it plans the week and drafts the content while you are away. You approve, it ships.",
    href: "/products/ai-marketing-team",
  },
  {
    tag: "Inbound",
    title: "The Content Ecosystem",
    benefit: "Inbound that runs itself.",
    body: "A Living AI Website, a weekly content engine, and a diagnostic tool that captures and qualifies intent before the first human conversation.",
    href: "/products/content-ecosystem",
  },
  {
    tag: "Outbound",
    title: "The Marketing Ecosystem",
    benefit: "Your agency, run as a system.",
    body: "Paid acquisition and distribution run as a system, so the strategy, trained voice, and results stay inside your business.",
    href: "/products/marketing-ecosystem",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Autonomous AI Marketing Systems",
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.title,
    url: `${SITE_URL}${p.href}`,
  })),
};

export default function ProductsPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
            <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
              Products
            </p>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.04] text-[#111111] max-w-4xl mx-auto">
              Six AI marketing systems. Buy the ones that fit.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-[#111111]/75 max-w-3xl mx-auto leading-relaxed">
              Each one removes a different point of owner dependency. There is
              no required order and no required bundle. The AI Marketing
              Diagnostic tells you which one will move your sales fastest.
            </p>
          </div>
        </section>

        <section className="bg-[#F9FAFB]">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((p) => (
                <Link
                  key={p.title}
                  href={p.href}
                  className="group bg-white border border-black/10 rounded-2xl p-8 flex flex-col transition hover:border-black/25 hover:shadow-sm"
                >
                  <p className="text-[#0d9488] text-xs uppercase tracking-[0.18em] font-semibold mb-3">
                    {p.tag}
                  </p>
                  <h2 className="font-serif text-2xl tracking-tight text-[#111111]">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-[#188bf6] font-semibold leading-snug">
                    {p.benefit}
                  </p>
                  <p className="mt-3 text-[#111111]/70 leading-relaxed flex-1">
                    {p.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-[#111111] font-medium">
                    Learn more
                    <span className="transition-transform group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111]">
              Not sure which one to start with?
            </h2>
            <p className="mt-6 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
              The AI Marketing Diagnostic is seven to ten minutes, no call. You
              get a written plan showing where AI would move your sales fastest,
              and which system to start with.
            </p>
            <div className="mt-10 flex justify-center">
              <CTAButton size="lg" href="/diagnostic">
                Get MY AI Marketing Implementation Plan
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </>
  );
}
