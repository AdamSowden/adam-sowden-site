// Public booking URL — used everywhere "Book a Quick Chat" CTAs point.
// Routes through the branded /book page (which embeds the LeadConnector
// calendar in an iframe) so every booking funnels through the same
// confirmation + questionnaire flow.
export const BOOKING_URL = "/book";

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

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
