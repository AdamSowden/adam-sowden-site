import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { WAITLIST_FORM_URL, OG_DEFAULTS } from "@/lib/site";

const PAGE_PATH = "/waitlist";

export const metadata: Metadata = {
  title: "Join the Waiting List — Adam Sowden",
  description:
    "Join the waiting list for the Outreach Agent and the Marketing Ecosystem. You will be first in line when a build slot opens, with the case studies as they land.",
  alternates: { canonical: PAGE_PATH },
  openGraph: { ...OG_DEFAULTS, url: PAGE_PATH },
};

export default function WaitlistPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 pt-16 pb-8 md:pt-24 md:pb-10 text-center">
            <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">
              The Waiting List
            </p>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.08] text-[#111111]">
              First in line when the next build slot opens.
            </h1>
            <p className="mt-5 text-lg text-[#111111]/75 leading-relaxed">
              The Outreach Agent and the Marketing Ecosystem are built per
              client, one at a time. Join the waiting list and you will be first
              to hear when a slot opens, with the case studies as they are
              released along the way.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-2xl px-6 pb-24 md:pb-32">
            {WAITLIST_FORM_URL ? (
              <iframe
                src={WAITLIST_FORM_URL}
                id="lc-waitlist-iframe"
                scrolling="no"
                style={{ width: "100%", border: "none", minHeight: 600 }}
                title="Join the waiting list"
              />
            ) : (
              <div className="rounded-2xl border border-black/10 bg-[#F9FAFB] p-8 md:p-12 text-center">
                <p className="text-[#111111]/80 leading-relaxed">
                  The waiting-list form is being connected. In the meantime,{" "}
                  <Link
                    href="/contact"
                    className="text-[#188bf6] font-medium underline underline-offset-4 hover:text-[#0d78dc] transition"
                  >
                    send a note through the contact page
                  </Link>{" "}
                  and you will be added to the list.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      {WAITLIST_FORM_URL ? (
        <Script
          src="https://link.msgsndr.com/js/form_embed.js"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
