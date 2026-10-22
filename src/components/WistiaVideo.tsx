import WistiaPlayer from "@/components/WistiaPlayer";
import type { VideoOrientation, VideoPoster } from "@/components/WistiaPlayer";
import { PERSON_REF } from "@/lib/site";
import {
  durationLabel,
  fetchWistiaMeta,
  isWistiaId,
  isoDuration,
  wistiaIframeUrl,
  wistiaThumbnailAt,
} from "@/lib/wistia";

// Server wrapper for one video. Resolves the poster and duration (from a
// Sanity poster override, else Wistia's auto-thumbnail via oEmbed), renders
// the click-to-play player, the transcript as readable text, and one
// VideoObject JSON-LD block. The transcript is what AI search and the
// Smart Site's own proof checks can read; the video itself is opaque to them.
//
// Testimonials get VideoObject only. No Review or AggregateRating markup
// for the site's own testimonials (decision, 14 Oct 2026).

export type WistiaVideoProps = {
  mediaId: string;
  title: string;
  kind: "testimonial" | "explainer" | "walkthrough";
  description?: string;
  uploadDate?: string;
  poster?: VideoPoster;
  orientation?: VideoOrientation;
  transcript?: string;
  sizes?: string;
  className?: string;
  // Set when the page already shows the transcript elsewhere.
  hideTranscript?: boolean;
};

const POSTER_SIZE: Record<VideoOrientation, [number, number]> = {
  landscape: [1280, 720],
  portrait: [720, 1280],
};

export default async function WistiaVideo({
  mediaId,
  title,
  kind,
  description,
  uploadDate,
  poster,
  orientation = "landscape",
  transcript,
  sizes,
  className,
  hideTranscript = false,
}: WistiaVideoProps) {
  if (!isWistiaId(mediaId)) return null;

  const meta = await fetchWistiaMeta(mediaId);
  const [w, h] = POSTER_SIZE[orientation];
  const resolvedPoster: VideoPoster | null =
    poster ??
    (meta
      ? {
          src: wistiaThumbnailAt(meta.thumbnailUrl, w, h),
          alt: title,
          width: w,
          height: h,
        }
      : null);

  // No poster at all (oEmbed down and nothing in Sanity): render nothing
  // rather than a black box. The page copy still stands on its own.
  if (!resolvedPoster) return null;

  const seconds = meta?.durationSeconds ?? 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description || undefined,
    thumbnailUrl: [resolvedPoster.src],
    uploadDate: uploadDate || undefined,
    duration: seconds ? isoDuration(seconds) : undefined,
    embedUrl: wistiaIframeUrl(mediaId),
    transcript: transcript || undefined,
    author: PERSON_REF,
    inLanguage: "en",
  };

  const paragraphs = transcript
    ? transcript
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <figure className={className}>
      <WistiaPlayer
        mediaId={mediaId}
        title={title}
        kind={kind}
        poster={resolvedPoster}
        orientation={orientation}
        durationLabel={seconds ? durationLabel(seconds) : undefined}
        sizes={sizes}
      />
      {!hideTranscript && paragraphs.length > 0 && (
        <details className="group mt-4 rounded-xl border border-black/10 bg-white px-5 py-3 text-left">
          <summary className="cursor-pointer list-none text-sm font-medium text-[#111111]/80 marker:content-none">
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 transition-transform group-open:rotate-90"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Read the transcript
            </span>
          </summary>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#111111]/75">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </figure>
  );
}
