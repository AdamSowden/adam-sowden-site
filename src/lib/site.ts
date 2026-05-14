export const BOOKING_URL =
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
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
