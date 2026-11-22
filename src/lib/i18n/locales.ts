/**
 * Locale config. Hebrew is the default and lives at "/", English at "/en".
 * (Phase 2 replaces the small dictionaries in ./dictionaries with next-intl.)
 */
export const locales = ["he", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "he";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Map a path in one locale to the same page in the other locale. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const withoutPrefix =
    pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/)/, "");
  return localeHref(target, withoutPrefix);
}

export const localeDirection: Record<Locale, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
};

/** Path prefix for a locale: "" for Hebrew, "/en" for English. */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

/** Build an in-site href for a locale, e.g. localeHref("en", "/visit") → "/en/visit". */
export function localeHref(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const prefixed = `${localePrefix(locale)}${clean}`;
  return prefixed.length > 1 && prefixed.endsWith("/")
    ? prefixed.slice(0, -1)
    : prefixed || "/";
}

/** A translatable CMS-style field. English may be missing: fall back to Hebrew. */
export type Localized<T = string> = { he: T; en?: T | null };

export function localized<T>(
  field: Localized<T>,
  locale: Locale,
): { value: T; lang: Locale; isFallback: boolean } {
  if (locale === "en" && field.en != null && field.en !== "") {
    return { value: field.en, lang: "en", isFallback: false };
  }
  return { value: field.he, lang: "he", isFallback: locale !== "he" };
}
