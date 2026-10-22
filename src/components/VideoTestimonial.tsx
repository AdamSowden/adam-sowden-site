import WistiaVideo from "@/components/WistiaVideo";
import {
  attributionLine,
  posterFromSanity,
  type SanityVideo,
} from "@/lib/video";

// A client testimonial card: the click-to-play video beside the person's
// words and attribution. Everything the diagnostic's trust check reads
// (first name, role, business or location, a specific result) is plain text
// next to the player, so the proof stands without pressing play.

export default function VideoTestimonial({
  video,
  className = "",
}: {
  video: SanityVideo;
  className?: string;
}) {
  const portrait = video.orientation === "portrait";
  const name = video.person?.firstName;
  const line = attributionLine(video);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-black/10 bg-white md:grid ${
        portrait ? "md:grid-cols-5" : "md:grid-cols-12"
      } ${className}`}
    >
      <div
        className={`p-4 md:p-6 ${
          portrait
            ? "md:col-span-2 flex justify-center md:items-center"
            : "md:col-span-7"
        }`}
      >
        <WistiaVideo
          mediaId={video.wistiaId}
          title={video.title}
          kind="testimonial"
          description={video.description}
          uploadDate={video.uploadDate}
          poster={posterFromSanity(video)}
          orientation={video.orientation}
          transcript={video.transcript}
          sizes={
            portrait
              ? "(min-width: 768px) 320px, 80vw"
              : "(min-width: 768px) 640px, 100vw"
          }
          className={portrait ? "w-full max-w-xs" : undefined}
        />
      </div>
      <div
        className={`flex flex-col justify-center p-8 md:p-10 ${
          portrait ? "md:col-span-3" : "md:col-span-5"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-[#188bf6] font-medium">
          Client testimonial
        </p>
        {video.pullQuote && (
          <blockquote className="mt-4 font-serif text-2xl md:text-3xl leading-snug tracking-tight text-[#111111]">
            &ldquo;{video.pullQuote}&rdquo;
          </blockquote>
        )}
        {(name || line) && (
          <p className="mt-6 text-[#111111]">
            {name && <span className="font-medium">{name}</span>}
            {name && line && <span className="text-[#111111]/60">, </span>}
            {line && <span className="text-[#111111]/60">{line}</span>}
          </p>
        )}
        {video.result && (
          <p className="mt-4 border-t border-black/10 pt-4 text-sm leading-relaxed text-[#111111]/75">
            {video.result}
          </p>
        )}
      </div>
    </div>
  );
}
