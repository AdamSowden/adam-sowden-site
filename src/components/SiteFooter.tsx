import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-[auto_1fr] md:items-center">
        <Link
          href="/"
          aria-label="Adam Sowden — home"
          className="inline-flex"
        >
          <Image
            src="/adam-sowden-logo-stacked.png"
            alt="Adam Sowden"
            width={84}
            height={74}
            className="h-16 w-auto"
          />
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-black/60">
          <div>
            © {new Date().getFullYear()} Adam Sowden. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-black transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
