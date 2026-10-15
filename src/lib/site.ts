import type { Metadata } from "next";

// Public booking URL — used everywhere "Book a Quick Chat" CTAs point.
// Routes through the branded /book page (which embeds the LeadConnector
// calendar in an iframe) so every booking funnels through the same
// confirmation + questionnaire flow.
export const BOOKING_URL = "/book";

// Smart Site Analyzer: the public front door. Every primary CTA points here
// (Adam, 15 Oct 2026). The 18-question diagnostic stays live at /diagnostic as
// a back page reached from the analyzer report, not from navigation or hero CTAs.
export const ANALYZER_URL = "/analyzer";
export const ANALYZER_CTA_LABEL = "Analyze My Site";
export const DIAGNOSTIC_URL = "/diagnostic";

// Branded waitlist page — "Join the Waiting List" CTAs (Outreach Agent,
// Marketing Ecosystem) point here. The page embeds the LeadConnector
// opt-in form below.
export const WAITLIST_URL = "/waitlist";

// LeadConnector waitlist opt-in form embed URL — used inside the /waitlist
// page iframe only. TODO: replace with the real LeadConnector form URL.
// While empty, /waitlist shows a fallback opt-in state instead of a broken
// iframe. Do not link to this directly from buttons.
export const WAITLIST_FORM_URL = "";

// Direct LeadConnector calendar widget URL — used inside the /book page
// iframe embed only. Do not link to this directly from buttons.
export const CALENDAR_WIDGET_URL =
  "https://api.leadconnectorhq.com/widget/booking/vvT3ua4em90YPymNy0Lf";

// Canonical site URL. Production default is the cutover target
// (adamsowden.com). Override via NEXT_PUBLIC_SITE_URL in Vercel
// for preview branches or pre-cutover environments.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://adamsowden.com"
).replace(/\/$/, "");

export const SITE_NAME = "Adam Sowden";

// The one Person entity on the site. /about declares it in full; every other
// page (Article author, Service provider) references it through PERSON_REF so
// an engine reading any single page sees a named author that resolves to the
// same node, rather than a bare @id or an anonymous duplicate.
export const PERSON_ID = `${SITE_URL}/about#adam-sowden`;
export const PERSON_REF = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/about`,
} as const;

// Shared Open Graph defaults. Next.js merges metadata shallowly, so any page
// that defines its own `openGraph` object REPLACES the layout's `openGraph`
// entirely — dropping `type`, `siteName`, `locale`, and `images`. Pages that
// set an og url/title must spread this first so the default share image and
// type survive: `openGraph: { ...OG_DEFAULTS, url, title }`.
// See node_modules/next/dist/docs/.../generate-metadata.md ("Merging").
export const OG_DEFAULTS = {
  type: "website",
  siteName: SITE_NAME,
  locale: "en_US",
  images: [
    {
      url: "/og-default.png",
      width: 1200,
      height: 630,
      alt: "Adam Sowden — Autonomous AI Marketing Systems",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
