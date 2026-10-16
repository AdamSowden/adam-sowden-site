"use client";

// Pushes one GTM event when the booking page is viewed, carrying where the
// visitor came from (?src=analyzer, analyzer-email, ...). WP8: booking is
// attributed to the analyzer through this event and the GHL tags on the
// contact; the calendar itself stays the single CTA.

import { useEffect } from "react";

export default function BookingTracker({ source }: { source: string | null }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "booking_view", source: source ?? "direct" });
  }, [source]);
  return null;
}
