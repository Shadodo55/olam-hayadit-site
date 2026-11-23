import { createImageUrlBuilder } from "@sanity/image-url";
import type { Localized } from "@/lib/i18n/locales";
import { sanityConfig } from "./client";

const builder = createImageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

/** GROQ projection for an image field (altImage). Use as: `image ${IMAGE_PROJECTION}`. */
export const IMAGE_PROJECTION = `{
  "assetId": asset._ref,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  crop,
  hotspot,
  alt
}`;

export interface RawImage {
  assetId?: string | null;
  width?: number | null;
  height?: number | null;
  lqip?: string | null;
  crop?: { top: number; bottom: number; left: number; right: number } | null;
  hotspot?: { x: number; y: number } | null;
  alt?: Localized | null;
}

/** A ready-to-render image. `src` is a Sanity CDN URL; next/image adds size and format. */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: Localized;
  blurDataURL?: string;
  /** CSS object-position from the editor's hotspot, e.g. "50% 40%". */
  objectPosition: string;
}

export function toSiteImage(
  raw: RawImage | null | undefined,
): SiteImage | null {
  if (!raw?.assetId || !raw.width || !raw.height) return null;
  const src = builder
    .image({
      asset: { _ref: raw.assetId },
      ...(raw.crop ? { crop: raw.crop } : {}),
    })
    .url();
  const hotspot = raw.hotspot ?? { x: 0.5, y: 0.5 };
  return {
    src,
    width: raw.width,
    height: raw.height,
    alt: raw.alt?.he ? raw.alt : { he: "" },
    ...(raw.lqip ? { blurDataURL: raw.lqip } : {}),
    objectPosition: `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%`,
  };
}
