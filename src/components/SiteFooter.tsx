import Link from "next/link";
import Image from "next/image";
import SubscribeForm from "@/components/SubscribeForm";
import { NAV_LINKS } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="bg-[#F9FAFB] border-b border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-12 grid gap-6 md:gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <h3 className="font-serif text-xl md:text-2xl tracking-tight text-[#111111]">
              Marketing systems that run without you. Delivered weekly.
            </h3>
            <p className="mt-2 text-sm text-black/60">
              One short essay each Monday. One idea. No filler.
            </p>
          </div>
          <div>
            <SubscribeForm buttonLabel="Subscribe" />
          </div>
        </div>
      </div>
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-[auto_1fr] md:items-center">
          <Link
            href="/"
            aria-label="Adam Sowden — home"
            className="inline-flex"
          >
            <Image
              src="/adam-sowden-logo-stacked.png"
              alt="Adam Sowden"
              width={800}
              height={800}
              className="h-20 w-auto"
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
              <Link
                href="/privacy"
                className="hover:text-black transition"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
