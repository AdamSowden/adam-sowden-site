import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Adam Sowden",
  description:
    "What we collect, why, where it's stored, how long it's kept, and how to request deletion.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
            Privacy
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111] mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-black/55 mb-12">Last updated 26 May 2026</p>

          <section className="prose-spacing">
            <P>
              This page explains what personal information adamsowden.com
              collects, why we collect it, where it is stored, how long it
              is kept, and how to request access or deletion. Plain
              English, no legal theatre.
            </P>

            <H2>What we collect</H2>
            <P>
              We only collect what is needed to do the thing you asked for.
              There is no third-party tracking on the diagnostic page.
            </P>
            <Bullet>
              When you complete the AI Marketing Diagnostic, we collect
              your first name, the name of your business, your location,
              your industry, the answers you provide during the
              conversation, and your email address.
            </Bullet>
            <Bullet>
              When you subscribe to the Monday Essay newsletter, we collect
              your email address (and, optionally, your first name).
            </Bullet>
            <Bullet>
              When you book a Quick Chat, we collect whatever you submit on
              the booking and pre-call questionnaire forms.
            </Bullet>

            <H2>Why we collect it</H2>
            <P>
              We use this information to generate and send your diagnostic
              report, to send you the newsletter you asked for, and to
              prepare for and follow up after a Quick Chat. We do not sell
              your data, and we do not share it with anyone outside the
              service providers listed below.
            </P>

            <H2>Where it is stored</H2>
            <P>
              We use a small number of established service providers to run
              the site. Each one only sees the data needed for its job.
            </P>
            <Bullet>
              <strong>Upstash (or Vercel KV).</strong> While you are
              partway through the diagnostic, your in-progress
              conversation is stored as a short-lived session. The session
              automatically deletes itself within 24 hours.
            </Bullet>
            <Bullet>
              <strong>GoHighLevel (CRM).</strong> Once a diagnostic
              completes (or you subscribe, or you book), your contact
              record is stored in our CRM. This is the long-term record we
              keep for you.
            </Bullet>
            <Bullet>
              <strong>Resend (email).</strong> Used to deliver your
              diagnostic report email, your newsletter, and any
              transactional emails we send you.
            </Bullet>
            <Bullet>
              <strong>Anthropic (AI).</strong> Your diagnostic
              conversation is processed by Anthropic&apos;s Claude API to
              generate the report. Anthropic does not train on API data by
              default and does not retain conversation content beyond
              short-term operational logging.
            </Bullet>
            <Bullet>
              <strong>Sanity (content).</strong> Used to manage the blog
              content you read on the site. Sanity does not see any of
              your personal information.
            </Bullet>

            <H2>How long we keep it</H2>
            <P>
              CRM contact records are retained indefinitely unless you
              request deletion. In-progress diagnostic sessions expire
              within 24 hours. Newsletter subscriptions are kept until you
              unsubscribe.
            </P>

            <H2>Your rights</H2>
            <P>
              You can request access to the personal information we hold
              about you, ask us to correct it, or ask us to delete it
              entirely. Email{" "}
              <a
                href="mailto:adam@adamsowden.com"
                className="text-[#188bf6] underline hover:text-[#0d78dc]"
              >
                adam@adamsowden.com
              </a>{" "}
              and we will respond within a reasonable timeframe.
            </P>
            <P>
              Every newsletter email contains a one-click unsubscribe
              link. If you only want to leave the mailing list, that is
              the fastest path.
            </P>

            <H2>Cookies</H2>
            <P>
              We do not run third-party analytics or advertising cookies
              on this site. The only browser storage we use is a short-
              lived session token (in sessionStorage) so that if you
              accidentally refresh the diagnostic page mid-conversation,
              you can pick up where you left off. That token clears when
              you close the tab.
            </P>

            <H2>Changes to this policy</H2>
            <P>
              If we materially change how we collect or use data, this
              page will be updated and the &ldquo;Last updated&rdquo; date
              at the top will change. There is no separate notification
              for minor wording fixes.
            </P>

            <H2>Contact</H2>
            <P>
              Questions, concerns, or deletion requests:{" "}
              <a
                href="mailto:adam@adamsowden.com"
                className="text-[#188bf6] underline hover:text-[#0d78dc]"
              >
                adam@adamsowden.com
              </a>
              .
            </P>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

// Lightweight typography helpers so the privacy page reads cleanly
// without pulling in the Tailwind typography plugin.
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] mt-12 mb-4">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] md:text-[17px] leading-[1.8] text-[#111111]/85 mb-5">
      {children}
    </p>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4 text-[16px] md:text-[17px] leading-[1.8] text-[#111111]/85">
      <span className="text-[#188bf6] mt-1.5 flex-shrink-0">•</span>
      <span>{children}</span>
    </div>
  );
}
