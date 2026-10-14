import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import AnalyzerClient from "./AnalyzerClient";

export const metadata: Metadata = {
  title: "Smart Site Analyzer — Adam Sowden",
  description:
    "Enter your website address and get real, measured findings in about a minute: how a visitor can get in touch, whether AI search can read the site, how fast it loads, and what to fix first.",
  alternates: { canonical: "/analyzer" },
};

export default async function AnalyzerPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const sp = await searchParams;
  const initialUrl = typeof sp.url === "string" ? sp.url.slice(0, 2048) : "";
  return (
    <>
      <SiteNav />
      <main className="flex-1 bg-white">
        <section className="mx-auto max-w-3xl px-6 pt-14 pb-10 md:pt-20">
          <p className="text-[#188bf6] text-sm font-medium uppercase tracking-[0.18em] mb-5">Smart Site Analyzer</p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] text-[#111111]">
            Find out what your website does when you are not there.
          </h1>
          <p className="mt-6 text-lg text-[#111111]/75 leading-relaxed max-w-2xl">
            Enter the address. In about a minute you get real findings about your own site: how a ready buyer can get in touch, whether AI search engines can read it, how it is built, how fast it loads, and the three things to fix first. No email needed to see the first finding.
          </p>
        </section>
        <AnalyzerClient initialUrl={initialUrl} />
      </main>
      <SiteFooter />
    </>
  );
}
