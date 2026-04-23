import Link from "next/link";
import { BOOKING_URL, NAV_LINKS } from "@/lib/site";

export default function SiteNav() {
  return (
    <header className="bg-white border-b border-black/5 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-2xl tracking-tight text-[#111111]"
        >
          Adam Sowden
        </Link>
        <nav className="flex items-center gap-7 text-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[#111111]/80 hover:text-[#111111] transition"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={BOOKING_URL}
            className="ml-2 inline-flex items-center rounded-full bg-[#188bf6] text-white px-4 py-2 text-sm font-medium hover:bg-[#0d78dc] transition"
          >
            Book a Quick Chat
          </a>
        </nav>
      </div>
    </header>
  );
}
