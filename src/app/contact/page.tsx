import type { Metadata } from "next";
import Script from "next/script";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { BOOKING_URL, CALENDAR_WIDGET_URL, OG_DEFAULTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Adam Sowden",
  description:
    "Book a 20-minute Quick Chat. No pitch. A conversation about where AI marketing automation would deliver the biggest lift in your sales right now.",
  alternates: { canonical: "/contact" },
  openGraph: { ...OG_DEFAULTS, url: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Booking />
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
      <div className="mx-auto max-w-4xl px-6 pt-16 pb-10 md:pt-24 md:pb-14 text-center">
        <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-6">
          Contact
        </p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.05] text-[#111111]">
          Book a Quick Chat.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          20 minutes. No pitch. We look at where AI marketing automation
          would deliver the biggest lift in your sales right now and what it
          would take to ship it.
        </p>
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-24">
        <iframe
          src={CALENDAR_WIDGET_URL}
          id="lc-booking-iframe"
          scrolling="no"
          style={{ width: "100%", border: "none", minHeight: 800 }}
          title="Book a Quick Chat with Adam Sowden"
        />
        <p className="mt-4 text-center text-sm text-[#111111]/55">
          Trouble with the booking widget?{" "}
          <a
            href={BOOKING_URL}
            className="text-[#188bf6] hover:underline font-medium"
          >
            Open it in a new tab.
          </a>
        </p>
      </div>
    </section>
  );
}
