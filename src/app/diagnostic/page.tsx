import type { Metadata } from "next";
import DiagnosticClient from "./DiagnosticClient";

// The diagnostic page is intentionally standalone:
// no SiteNav, no SiteFooter, no other CTAs. The booking button lives
// inside the report at the end of a completed diagnostic.

export const metadata: Metadata = {
  title: "AI Marketing Diagnostic — Adam Sowden",
  description:
    "An 18-question AI-led diagnostic that identifies where AI marketing automation would have the biggest impact in your business right now. Get a personalised implementation plan in seven to ten minutes.",
  alternates: { canonical: "/diagnostic" },
};

export default function DiagnosticPage() {
  return <DiagnosticClient />;
}
