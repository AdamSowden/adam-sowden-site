import { describe, expect, it } from "vitest";
import {
  durationLabel,
  isWistiaId,
  isoDuration,
  wistiaIframeUrl,
  wistiaThumbnailAt,
} from "@/lib/wistia";

describe("wistia helpers", () => {
  it("accepts ten-character hashed ids only", () => {
    expect(isWistiaId("e4a27b971d")).toBe(true);
    expect(isWistiaId("E4A27B971D")).toBe(false);
    expect(isWistiaId("e4a27b971")).toBe(false);
    expect(isWistiaId("../etc/passwd")).toBe(false);
    expect(isWistiaId(undefined)).toBe(false);
  });

  it("builds the iframe URL with the brand colour and Wistia SEO off", () => {
    const url = new URL(wistiaIframeUrl("e4a27b971d", { autoplay: true }));
    expect(url.origin + url.pathname).toBe(
      "https://fast.wistia.net/embed/iframe/e4a27b971d"
    );
    expect(url.searchParams.get("playerColor")).toBe("188bf6");
    expect(url.searchParams.get("seo")).toBe("false");
    expect(url.searchParams.get("autoPlay")).toBe("true");
    expect(
      new URL(wistiaIframeUrl("e4a27b971d")).searchParams.has("autoPlay")
    ).toBe(false);
  });

  it("formats durations for schema.org and for the poster badge", () => {
    expect(isoDuration(91)).toBe("PT1M31S");
    expect(isoDuration(3600)).toBe("PT1H");
    expect(isoDuration(0)).toBe("PT0S");
    expect(isoDuration(16.51)).toBe("PT17S");
    expect(durationLabel(91)).toBe("1:31");
    expect(durationLabel(5)).toBe("0:05");
  });

  it("re-crops the Wistia thumbnail to the rendered size", () => {
    const src =
      "https://embed-ssl.wistia.com/deliveries/abc.jpg?image_crop_resized=960x540";
    expect(wistiaThumbnailAt(src, 1280, 720)).toBe(
      "https://embed-ssl.wistia.com/deliveries/abc.jpg?image_crop_resized=1280x720"
    );
    expect(wistiaThumbnailAt("not a url", 1, 1)).toBe("not a url");
  });
});
