import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SubscribeForm from "@/components/SubscribeForm";
import { BOOKING_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Adam Sowden",
  description:
    "Book a 20-minute Quick Chat. No pitch. A conversation about where AI marketing automation would deliver the biggest lift in your sales right now.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Booking />
        <Other />
      </main>
      <SiteFooter />
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
        <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl overflow-hidden">
          <iframe
            src={BOOKING_URL}
            className="w-full"
            style={{ minHeight: 780, border: 0 }}
            title="Book a Quick Chat with Adam Sowden"
            loading="lazy"
          />
        </div>
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

function Other() {
  return (
    <section className="bg-[#F9FAFB]">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
          Or read first
        </p>
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          Prefer to read a few essays first?
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
          Subscribe to the weekly Monday essay. One idea, deeply unpacked.
          No pitches, no upsells, easy unsubscribe.
        </p>
        <div className="mt-8">
          <SubscribeForm buttonLabel="Subscribe" />
        </div>
      </div>
    </section>
  );
}
