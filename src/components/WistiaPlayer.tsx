"use client";

import Image from "next/image";
import { useState } from "react";
import { wistiaIframeUrl } from "@/lib/wistia";

// The click-to-play facade. Until the visitor presses play this is one
// next/image poster and a button: no Wistia script, no iframe, no cookies.
// On play it swaps in Wistia's iframe embed with autoplay on, which counts
// as a user gesture, and pushes one GTM event so GA4 can count plays.
// Engagement detail (watch time, heatmaps) stays in Wistia.

export type VideoOrientation = "landscape" | "portrait";

export type VideoPoster = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type Props = {
  mediaId: string;
  title: string;
  kind: string;
  poster: VideoPoster;
  orientation?: VideoOrientation;
  durationLabel?: string;
  // Hint for next/image; defaults suit a card that fills a column on
  // desktop and the viewport on phones.
  sizes?: string;
  className?: string;
};

export default function WistiaPlayer({
  mediaId,
  title,
  kind,
  poster,
  orientation = "landscape",
  durationLabel,
  sizes = "(min-width: 768px) 720px, 100vw",
  className = "",
}: Props) {
  const [playing, setPlaying] = useState(false);
  const aspect = orientation === "portrait" ? "aspect-[9/16]" : "aspect-video";

  function play() {
    setPlaying(true);
    // window.dataLayer is declared globally by the GTM integration.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "video_play",
      video_id: mediaId,
      video_title: title,
      video_kind: kind,
      video_page: window.location.pathname,
    });
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black ${aspect} ${className}`}
    >
      {playing ? (
        <iframe
          src={wistiaIframeUrl(mediaId, { autoplay: true })}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={play}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#188bf6]/60"
        >
          <Image
            src={poster.src}
            alt={poster.alt}
            width={poster.width}
            height={poster.height}
            sizes={sizes}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#188bf6] text-white shadow-lg transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 h-7 w-7 md:h-8 md:w-8"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {durationLabel && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
              {durationLabel}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
