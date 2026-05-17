import type { Metadata } from "next";
import Script from "next/script";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { CALENDAR_WIDGET_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Quick Chat — Adam Sowden",
  description:
    "Book a 20-minute Quick Chat. No pitch. A conversation about where owner dependency is costing growth and what becomes possible when it's removed.",
  alternates: { canonical: "/book" },
  openGraph: { url: "/book" },
};

export default function BookPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <CalendarEmbed />
      </main>
      <SiteFooter />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 md:pt-24 md:pb-10">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">
          Book a Quick Chat
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.08] text-[#111111]">
          A 20-minute conversation about your marketing.
        </h1>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          No pitch. We look at where owner dependency is costing growth
          and what becomes possible when it&apos;s removed. Pick a time
          that works for you.
        </p>
      </div>
    </section>
  );
}

function CalendarEmbed() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 pb-24 md:pb-32">
        <iframe
          src={CALENDAR_WIDGET_URL}
          id="lc-booking-iframe"
          scrolling="no"
          style={{ width: "100%", border: "none", minHeight: 800 }}
          title="Book a Quick Chat with Adam Sowden"
        />
      </div>
    </section>
  );
}
