import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeHref, type Locale } from "@/lib/i18n/locales";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * While the site is under construction it must not be indexed.
 * Flip NEXT_PUBLIC_ALLOW_INDEXING=true at launch (see CLAUDE.md).
 */
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export function baseMetadata(locale: Locale, path = "/"): Metadata {
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.siteTitle, template: `%s | ${t.siteTitle}` },
    description: t.metaDescription,
    alternates: {
      canonical: localeHref(locale, path),
      languages: {
        he: localeHref("he", path),
        en: localeHref("en", path),
        "x-default": localeHref("he", path),
      },
    },
    openGraph: {
      type: "website",
      siteName: t.siteTitle,
      locale: locale === "he" ? "he_IL" : "en_US",
      url: localeHref(locale, path),
    },
    robots: allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
