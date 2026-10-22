// Wistia is the video system of record for the site: every video is uploaded,
// captioned and measured there. The site never loads Wistia's player script
// on page load. It renders a poster image and swaps in Wistia's iframe embed
// only when the visitor presses play (see components/WistiaPlayer.tsx), so a
// page with a video costs one lazy image until someone wants to watch.
//
// This module is the only place that knows Wistia URLs.

// Wistia hashed media ids are ten lower-case alphanumerics, e.g. "e4a27b971d".
export const WISTIA_ID_RE = /^[a-z0-9]{10}$/;

export function isWistiaId(id: unknown): id is string {
  return typeof id === "string" && WISTIA_ID_RE.test(id);
}

// Brand blue without the hash, as Wistia's playerColor option wants it.
const PLAYER_COLOR = "188bf6";

// The iframe embed takes player options as query parameters. `seo=false`
// stops Wistia injecting its own VideoObject markup inside the frame; the
// page emits its own (components/WistiaVideo.tsx) so Google sees one copy.
export function wistiaIframeUrl(
  mediaId: string,
  opts: { autoplay?: boolean } = {}
): string {
  const params = new URLSearchParams({
    playerColor: PLAYER_COLOR,
    seo: "false",
    videoFoam: "false",
  });
  if (opts.autoplay) params.set("autoPlay", "true");
  return `https://fast.wistia.net/embed/iframe/${mediaId}?${params.toString()}`;
}

// Schema.org wants ISO 8601 durations: 91 s -> PT1M31S.
export function isoDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  let out = "PT";
  if (h) out += `${h}H`;
  if (m) out += `${m}M`;
  if (sec || (!h && !m)) out += `${sec}S`;
  return out;
}

// Visible badge on the poster: 91 s -> "1:31".
export function durationLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Wistia thumbnail URLs carry the crop as a query parameter; swap it for the
// size the poster is rendered at so next/image is not resizing a 960px
// source up to a wider slot.
export function wistiaThumbnailAt(
  thumbnailUrl: string,
  width: number,
  height: number
): string {
  try {
    const u = new URL(thumbnailUrl);
    u.searchParams.set("image_crop_resized", `${width}x${height}`);
    return u.toString();
  } catch {
    return thumbnailUrl;
  }
}

export type WistiaMeta = {
  title: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  durationSeconds: number;
};

// Public oEmbed endpoint: no API key, returns the auto-thumbnail, title and
// duration. Cached a day; a Wistia outage must never take a page down, so
// every failure path returns null and the caller renders without the
// fields it could not get.
export async function fetchWistiaMeta(
  mediaId: string
): Promise<WistiaMeta | null> {
  if (!isWistiaId(mediaId)) return null;
  const target = `https://home.wistia.com/medias/${mediaId}`;
  const url = `https://fast.wistia.com/oembed?url=${encodeURIComponent(target)}&format=json`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    if (typeof data.thumbnail_url !== "string") return null;
    return {
      title: typeof data.title === "string" ? data.title : "",
      thumbnailUrl: data.thumbnail_url,
      thumbnailWidth:
        typeof data.thumbnail_width === "number" ? data.thumbnail_width : 960,
      thumbnailHeight:
        typeof data.thumbnail_height === "number" ? data.thumbnail_height : 540,
      durationSeconds:
        typeof data.duration === "number" ? data.duration : 0,
    };
  } catch {
    return null;
  }
}
