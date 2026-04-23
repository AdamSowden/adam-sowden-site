import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-black/60">
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
    </footer>
  );
}
