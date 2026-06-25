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
        <nav className="flex items-center gap-3 sm:gap-5 lg:gap-7 text-sm">
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

          {/* Mobile menu — pure-CSS disclosure, mirrors the FAQ details/group-open pattern */}
          <details className="group md:hidden relative">
            <summary
              aria-label="Open menu"
              className="list-none cursor-pointer flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-[#111111]/80 hover:bg-black/5 transition [&::-webkit-details-marker]:hidden"
            >
              <svg
                className="w-6 h-6 group-open:hidden"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <svg
                className="w-6 h-6 hidden group-open:block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-3 w-52 rounded-xl border border-black/10 bg-white shadow-lg py-2 z-50">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-5 py-3 text-[#111111]/80 hover:bg-black/5 hover:text-[#111111] transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
