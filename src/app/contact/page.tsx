import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";
import { BOOKING_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Adam Sowden",
  description:
    "Book a 20-minute Quick Chat. No pitch. A conversation about where owner dependency is costing you growth and what becomes possible when it's removed.",
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
          20 minutes. No pitch. We look at where owner dependency is costing
          you growth and what becomes possible when it&apos;s removed.
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
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">
          Prefer email first?
        </h2>
        <p className="mt-5 text-lg text-[#111111]/75 max-w-2xl mx-auto leading-relaxed">
          The weekly essay lands every Monday. One idea, deeply unpacked.
          Subscribe and read a few before booking.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <CTAButton href="/blog" variant="ghost">Read the essays</CTAButton>
          <CTAButton>Book a Quick Chat</CTAButton>
        </div>
      </div>
    </section>
  );
}
