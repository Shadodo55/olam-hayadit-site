import type { Metadata } from "next";
import { localeHref, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * While the site is under construction it must not be indexed.
 * Flip NEXT_PUBLIC_ALLOW_INDEXING=true at launch (see CLAUDE.md).
 */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/** Social preview image (public/og.png, from scripts/generate-brand-images.mjs). */
const OG_IMAGE = { url: "/og.png", width: 1200, height: 630 };

export const icons: Metadata["icons"] = {
  icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  apple: "/apple-touch-icon.png",
};

/**
 * Open Graph for a page. A page's `openGraph` replaces the layout's whole
 * object in Next.js, so every page repeats the site name, locale and image.
 */
export function openGraph(
  locale: Locale,
  path: string,
  extra: { title?: string; description?: string } = {},
): NonNullable<Metadata["openGraph"]> {
  const { meta } = messagesFor(locale);
  return {
    type: "website",
    siteName: meta.siteName,
    locale: locale === "he" ? "he_IL" : "en_US",
    url: localeHref(locale, path),
    images: [{ ...OG_IMAGE, alt: meta.siteName }],
    ...extra,
  };
}

function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localeHref(locale, path),
    languages: {
      he: localeHref("he", path),
      en: localeHref("en", path),
      "x-default": localeHref("he", path),
    },
  };
}

/** Site-wide defaults, set in each root layout. */
export function baseMetadata(locale: Locale): Metadata {
  const { meta } = messagesFor(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.siteName, template: `%s | ${meta.siteName}` },
    description: meta.description,
    alternates: alternates(locale, "/"),
    icons,
    openGraph: openGraph(locale, "/"),
    twitter: { card: "summary_large_image" },
    robots: allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

/** The home page: a title that says what and where, not only the name. */
export function homeMetadata(locale: Locale): Metadata {
  const { meta } = messagesFor(locale);
  return {
    title: { absolute: meta.homeTitle },
    openGraph: openGraph(locale, "/", {
      title: meta.homeTitle,
      description: meta.description,
    }),
  };
}

/** Per-page metadata: title, canonical and hreflang for `path` (unprefixed). */
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    alternates: alternates(locale, path),
    openGraph: openGraph(locale, path, {
      title,
      ...(description ? { description } : {}),
    }),
  };
}
