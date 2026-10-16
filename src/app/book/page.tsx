import type { Metadata } from "next";
import Script from "next/script";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { CALENDAR_WIDGET_URL, OG_DEFAULTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Smart Site Strategy Call — Adam Sowden",
  description:
    "Book a 20-minute Smart Site Strategy Call. We pick the one visitor path most worth fixing first and decide whether there is a practical fit. No pitch.",
  alternates: { canonical: "/book" },
  openGraph: { ...OG_DEFAULTS, url: "/book" },
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
          Smart Site Strategy Call
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.08] text-[#111111]">
          Twenty minutes on the version of this for your business.
        </h1>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          We pick the one visitor path most worth fixing first, map what your
          site needs to do it, and decide whether there is a practical fit to
          build it together. No generic pitch, no obligation. If a smart site
          is not the right next move, I will tell you directly. Pick a time
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
          title="Book a Smart Site Strategy Call with Adam Sowden"
        />
      </div>
    </section>
  );
}
