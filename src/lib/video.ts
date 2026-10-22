import type { VideoPoster } from "@/components/WistiaPlayer";
import { client } from "@/lib/sanity";
import { urlFor } from "@/lib/sanity-image";

// The site-side shape of a Sanity `video` document and the one GROQ
// projection every query uses, so a field added in the schema is added here
// once and reaches the home page, the blog and any future video page.

export type VideoKind = "testimonial" | "explainer" | "walkthrough";
export type VideoOrientation = "landscape" | "portrait";

export type SanityVideo = {
  _id: string;
  title: string;
  wistiaId: string;
  kind: VideoKind;
  orientation?: VideoOrientation;
  description?: string;
  uploadDate?: string;
  poster?: { asset?: { _ref: string }; alt?: string };
  person?: {
    firstName?: string;
    role?: string;
    business?: string;
    location?: string;
  };
  pullQuote?: string;
  result?: string;
  transcript?: string;
};

export const videoProjection = `{
  _id, title, wistiaId, kind, orientation, description, uploadDate, poster,
  person, pullQuote, result, transcript
}`;

const featuredTestimonialQuery = `*[_type == "video" && kind == "testimonial" && featuredOnHome == true && defined(wistiaId)]
  | order(_updatedAt desc)[0] ${videoProjection}`;

// The home page must never fail because Sanity is unreachable: a null here
// renders the Results section exactly as it was before video existed.
export async function getFeaturedTestimonial(): Promise<SanityVideo | null> {
  try {
    return await client.fetch<SanityVideo | null>(featuredTestimonialQuery);
  } catch {
    return null;
  }
}

// A poster the editor chose beats Wistia's auto-thumbnail. Sized to the
// slot so next/image serves the real dimensions.
export function posterFromSanity(video: SanityVideo): VideoPoster | undefined {
  if (!video.poster?.asset) return undefined;
  const portrait = video.orientation === "portrait";
  const [w, h] = portrait ? [720, 1280] : [1280, 720];
  return {
    src: urlFor(video.poster).width(w).height(h).fit("crop").url(),
    alt: video.poster.alt ?? video.title,
    width: w,
    height: h,
  };
}

// Name line under a testimonial: "Sarah, Practice owner, Bright Dental, Perth".
export function attributionLine(video: SanityVideo): string {
  const p = video.person ?? {};
  return [p.role, p.business, p.location].filter(Boolean).join(", ");
}
