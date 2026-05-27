import type { Metadata } from "next";
import DiagnosticClient from "./DiagnosticClient";

// The diagnostic page is intentionally standalone:
// no SiteNav, no SiteFooter, no other CTAs. The booking button lives
// inside the report at the end of a completed diagnostic.

export const metadata: Metadata = {
  title: "Marketing Bottleneck Diagnostic — Adam Sowden",
  description:
    "An 18-question AI-led diagnostic that identifies exactly where your marketing is owner-dependent and what it is costing you. Takes seven to ten minutes.",
  alternates: { canonical: "/diagnostic" },
  robots: { index: false, follow: false },
};

export default function DiagnosticPage() {
  return <DiagnosticClient />;
}
