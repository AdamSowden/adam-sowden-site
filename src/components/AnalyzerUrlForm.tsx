"use client";

// Homepage URL field: sends the visitor to /analyzer with the address, where
// the analysis starts immediately. No gate, no email (spec §9, §13).

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzerUrlForm({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = url.trim();
    if (!v) return;
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "analyzer_start_home", url: v });
    }
    router.push(`/analyzer?url=${encodeURIComponent(v)}`);
  };
  return (
    <form onSubmit={onSubmit} className={`flex flex-col sm:flex-row gap-2 ${compact ? "" : "max-w-xl"}`} aria-label="Analyze your website">
      <input
        type="text"
        inputMode="url"
        autoComplete="url"
        placeholder="yourwebsite.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="Your website address"
        required
        className="flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition"
      />
      <button type="submit" className="rounded-full border border-[#111111] text-[#111111] px-6 py-3 text-sm font-medium hover:bg-[#111111] hover:text-white transition whitespace-nowrap">
        Analyze my site
      </button>
    </form>
  );
}
