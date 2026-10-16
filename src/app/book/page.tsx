import type { Metadata } from "next";
import Script from "next/script";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BookingTracker from "@/components/BookingTracker";
import { CALENDAR_WIDGET_URL, OG_DEFAULTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Smart Site Strategy Call — Adam Sowden",
  description:
    "Book a 20-minute Smart Site Strategy Call on turning your current site into a smart site: same pages, same addresses, cleaned up and working as a sales asset. No pitch.",
  alternates: { canonical: "/book" },
  openGraph: { ...OG_DEFAULTS, url: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<{ src?: string | string[] }> }) {
  const { src } = await searchParams;
  const source = typeof src === "string" && /^[a-z0-9-]{1,40}$/.test(src) ? src : null;
  return (
    <>
      <BookingTracker source={source} />
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
          Twenty minutes on turning your site into a smart site.
        </h1>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          A smart site is your current site, moved onto a build that works on
          its own. It brings the right people in, then answers and books them
          while you run the business. The pages and addresses Google already
          ranks come across with it. Whatever was holding the site back gets
          cleaned up on the way, and nothing is thrown away. It stops being a
          business card on the internet and starts working as a sales asset.
        </p>
        <p className="mt-4 text-lg text-[#111111]/75 leading-relaxed">
          On the call we pick the one visitor path most worth fixing first and
          work out whether there&apos;s a practical fit to build it together. No
          generic pitch, no obligation. If a smart site isn&apos;t the right next
          move, I&apos;ll tell you directly. Pick a time that works for you.
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
