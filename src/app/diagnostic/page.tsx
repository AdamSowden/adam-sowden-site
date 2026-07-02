import type { Metadata } from "next";
import DiagnosticClient from "./DiagnosticClient";

// The diagnostic page is intentionally standalone:
// no SiteNav, no SiteFooter, no other CTAs. The booking button lives
// inside the report at the end of a completed diagnostic.

export const metadata: Metadata = {
  title: "AI Marketing Diagnostic — Adam Sowden",
  description:
    "An AI-led diagnostic that finds where AI marketing automation will move your sales fastest. Get your personalised implementation plan in under ten minutes.",
  alternates: { canonical: "/diagnostic" },
};

export default function DiagnosticPage() {
  return <DiagnosticClient />;
}
