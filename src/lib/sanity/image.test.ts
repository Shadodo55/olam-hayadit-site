import { describe, expect, it } from "vitest";
import { toSiteImage } from "./image";
import loader from "./image-loader";

const ASSET = "image-abc123def456-1200x1500-png";

describe("toSiteImage", () => {
  it("builds a CDN url and keeps alt text", () => {
    const image = toSiteImage({
      assetId: ASSET,
      width: 1200,
      height: 1500,
      alt: { he: "ידית", en: "Handle" },
      hotspot: { x: 0.3, y: 0.6 },
    });
    expect(image?.src).toBe(
      "https://cdn.sanity.io/images/gntr6ikv/production/abc123def456-1200x1500.png",
    );
    expect(image?.alt).toEqual({ he: "ידית", en: "Handle" });
    expect(image?.objectPosition).toBe("30% 60%");
  });

  it("returns null for missing images", () => {
    expect(toSiteImage(null)).toBeNull();
    expect(toSiteImage({ assetId: null })).toBeNull();
  });
});

describe("sanityImageLoader", () => {
  it("adds width, quality and automatic format", () => {
    const url = new URL(
      loader({
        src: "https://cdn.sanity.io/images/gntr6ikv/production/abc-1200x1500.png",
        width: 640,
      }),
    );
    expect(url.searchParams.get("w")).toBe("640");
    expect(url.searchParams.get("q")).toBe("75");
    expect(url.searchParams.get("auto")).toBe("format");
  });

  it("keeps an existing crop rectangle", () => {
    const url = new URL(
      loader({
        src: "https://cdn.sanity.io/images/p/d/abc-100x100.png?rect=0,0,50,50",
        width: 320,
        quality: 60,
      }),
    );
    expect(url.searchParams.get("rect")).toBe("0,0,50,50");
    expect(url.searchParams.get("q")).toBe("60");
  });

  it("passes through local images", () => {
    expect(loader({ src: "/poster.jpg", width: 100 })).toBe("/poster.jpg");
  });
});
