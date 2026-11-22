import type { Metadata } from "next";
import { localeHref, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * While the site is under construction it must not be indexed.
 * Flip NEXT_PUBLIC_ALLOW_INDEXING=true at launch (see CLAUDE.md).
 */
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

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
    openGraph: {
      type: "website",
      siteName: meta.siteName,
      locale: locale === "he" ? "he_IL" : "en_US",
      url: localeHref(locale, "/"),
    },
    robots: allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
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
    openGraph: {
      title,
      url: localeHref(locale, path),
      ...(description ? { description } : {}),
    },
  };
}
