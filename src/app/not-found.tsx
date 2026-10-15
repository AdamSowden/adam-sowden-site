import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import CTAButton from "@/components/CTAButton";

// Root not-found: renders inside the root layout for every unmatched URL and
// for any notFound() thrown in a route segment. Defining metadata here stops
// Next injecting its default "404: This page could not be found." title
// alongside the layout title (which produced two <title> tags).
export const metadata: Metadata = {
  title: "Page Not Found — Adam Sowden",
  description:
    "That page does not exist or has moved. Head back to the homepage or take the free AI Marketing Diagnostic.",
};

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="bg-white flex-1">
        <section className="mx-auto max-w-3xl px-6 py-24 md:py-32">
          <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-4">
            404
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[#111111] mb-6">
            This page does not exist.
          </h1>
          <p className="text-lg text-[#111111]/75 max-w-xl leading-relaxed mb-10">
            The link may be out of date, or the page has moved. The useful
            parts of the site are a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <CTAButton href="/">Back to the homepage</CTAButton>
            <CTAButton href="/diagnostic" variant="ghost">
              Take the free AI Marketing Diagnostic
            </CTAButton>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/55">
            <li><Link href="/products" className="hover:text-[#111111]">Products</Link></li>
            <li><Link href="/about" className="hover:text-[#111111]">About</Link></li>
            <li><Link href="/blog" className="hover:text-[#111111]">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-[#111111]">Contact</Link></li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
