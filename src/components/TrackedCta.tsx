"use client";

// Wraps a CTA so the click pushes a GTM event before the navigation. Used by
// the analyzer report's booking CTA (WP8). Capture phase so the anchor's
// default navigation still happens.

import type { ReactNode } from "react";

export default function TrackedCta({ event, data = {}, children }: { event: string; data?: Record<string, unknown>; children: ReactNode }) {
  const push = () => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  };
  return <span onClickCapture={push}>{children}</span>;
}
