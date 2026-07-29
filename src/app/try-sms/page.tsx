// /try-sms — unlisted beta door for the Speed-to-Lead Agent.
//
// Shared by hand with people who want to try the agent while it is in
// beta. Deliberately not linked from the nav, not in sitemap.ts, and
// noindex/nofollow below. Unlisted is enough for a hand-shared cohort; if
// it ever needs to be tighter, gate it behind an access code.
//
// The form only creates the GHL contact and applies `ai-beta`. GHL's W1
// workflow does the triggering and the sending, so this page tests the
// exact path a client account will run.
//
// When the beta ends, this page becomes the Speed-to-Lead Agent's live
// demo rather than getting deleted. The product page already sells the
// Site Conversation Agent by letting people talk to it; this is the same
// move for SMS.

import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import BetaSmsForm from "@/components/BetaSmsForm";

export const metadata: Metadata = {
  title: "Try the Speed-to-Lead Agent — Adam Sowden",
  description:
    "Put your number in and the Speed-to-Lead Agent texts you back in under a minute. Beta access by invitation.",
  robots: { index: false, follow: false },
};

export default function TrySmsPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 md:pt-24 md:pb-12">
            <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">
              Beta access
            </p>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.08] text-[#111111]">
              Put your number in. It texts you back before you close this tab.
            </h1>
            <p className="mt-6 text-lg text-[#111111]/75 leading-relaxed">
              This is the Speed-to-Lead Agent running live on my own number.
              Every enquiry gets a reply in under a minute, at any hour, and
              the conversation carries on from there without me in it.
            </p>
            <p className="mt-4 text-lg text-[#111111]/75 leading-relaxed">
              You are not being shown a recording. Reply to it, push on it,
              ask it something awkward. That is the point of a beta.
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-2xl px-6 pb-16">
            <div className="rounded-2xl border border-black/10 bg-[#F9FAFB] p-8 md:p-10">
              <BetaSmsForm />
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 pb-24 md:pb-32">
            <h2 className="font-serif text-2xl md:text-3xl text-[#111111] mb-6">
              What is actually happening
            </h2>
            <div className="space-y-4 text-[#111111]/75 leading-relaxed">
              <p>
                Your details go into my CRM, exactly as a real enquiry would.
                That triggers the agent, which reads who you are and what you
                asked, then writes a reply in my voice and sends it from my
                business number.
              </p>
              <p>
                It is trained on my methodology, my offers and my ideal client,
                so it can hold a real conversation about your situation rather
                than matching keywords. When it does not know something, it
                says so and hands you to me.
              </p>
              <p>
                Being a beta, I read every conversation. If it says something
                daft, that is useful, tell me.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
