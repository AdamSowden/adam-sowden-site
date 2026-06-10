import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service — Adam Sowden",
  description:
    "The terms that govern your use of adamsowden.com, our services, and any messages we exchange.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
            Terms
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#111111] mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-black/55 mb-12">Last updated 10 June 2026</p>

          <section className="prose-spacing">
            <P>
              These terms govern your use of adamsowden.com and the services
              provided by Adam Sowden. By using the site, completing the
              diagnostic, booking a call, subscribing, or exchanging messages
              with us, you agree to these terms. Plain English, no legal
              theatre.
            </P>

            <H2>What we provide</H2>
            <P>
              Adam Sowden builds and provides autonomous AI marketing systems
              and related services for service-business owners, along with the
              free AI Marketing Diagnostic, the Monday Essay newsletter, and
              the content published on this site. Specific deliverables, scope,
              and fees for any paid engagement are agreed separately in writing
              before work begins.
            </P>

            <H2>No guarantee of specific results</H2>
            <P>
              The site, the diagnostic, and our content are provided for
              information and to help you decide whether to work with us. We do
              not promise any specific result, revenue, lead volume, or outcome
              for your business. Any results described on the site are the
              specific results of Adam or named clients in their own contexts
              and are not a promise of what you will achieve.
            </P>

            <H2>Messaging and SMS</H2>
            <P>
              If you give us your phone number, for example through our chat
              widget, a booking, or by replying to a message, you consent to
              receive SMS messages from Adam Sowden about your enquiry, your
              booking, and relevant follow-up. Message frequency varies.
              Message and data rates may apply.
            </P>
            <P>
              You can opt out of SMS at any time by replying STOP, and reply
              HELP for help. We do not sell or share your phone number with
              third parties for their own marketing. See our{" "}
              <a
                href="/privacy"
                className="text-[#188bf6] underline hover:text-[#0d78dc]"
              >
                Privacy Policy
              </a>{" "}
              for how we handle your information.
            </P>

            <H2>Intellectual property</H2>
            <P>
              The content, methodology, and materials on this site are owned by
              Adam Sowden and are provided for your personal and business
              reference. You may not copy, resell, or redistribute them as your
              own. Where we build a system for you under a paid engagement, the
              ownership of deliverables is set out in that engagement&apos;s
              terms.
            </P>

            <H2>Acceptable use</H2>
            <P>
              Use the site and our services lawfully and in good faith. Do not
              attempt to disrupt, reverse-engineer, scrape at scale, or misuse
              the site, the diagnostic, or our messaging channels.
            </P>

            <H2>Disclaimers and liability</H2>
            <P>
              The site and free resources are provided on an &ldquo;as
              is&rdquo; basis without warranties of any kind. To the maximum
              extent permitted by law, Adam Sowden is not liable for any
              indirect or consequential loss arising from your use of the site
              or free resources. Nothing in these terms limits any rights you
              have that cannot be excluded under applicable law.
            </P>

            <H2>Governing law</H2>
            <P>
              These terms are governed by the laws of the State of Colorado,
              United States. Any dispute will be handled in the courts located
              in Colorado.
            </P>

            <H2>Changes to these terms</H2>
            <P>
              If we materially change these terms, this page will be updated
              and the &ldquo;Last updated&rdquo; date at the top will change.
            </P>

            <H2>Contact</H2>
            <P>
              Questions about these terms:{" "}
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
