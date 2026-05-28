import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/site";

export default function SiteNav() {
  return (
    <header className="bg-white border-b border-black/5 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Adam Sowden — home"
          className="flex items-center flex-shrink-0"
        >
          <Image
            src="/adam-sowden-logo.png"
            alt="Adam Sowden"
            width={1200}
            height={805}
            priority
            className="h-20 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-5 lg:gap-7 text-sm">
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[#111111]/80 hover:text-[#111111] transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            href="/diagnostic"
            className="ml-1 md:ml-2 inline-flex items-center rounded-full bg-[#188bf6] text-white px-4 py-2 text-xs sm:text-sm font-medium hover:bg-[#0d78dc] transition whitespace-nowrap"
          >
            Get MY AI Marketing Plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
