"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { switchLocalePath, type Locale } from "@/lib/i18n/locales";

/**
 * Link to the same page in the other language. The visible label is written
 * in the target language (and marked with its lang/dir) so screen readers
 * pronounce it correctly. A plain <a>: the two languages have separate root
 * layouts, so this is always a full page load anyway.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  const pathname = usePathname();
  const target: Locale = locale === "he" ? "en" : "he";

  return (
    <a
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      lang={target}
      dir={target === "he" ? "rtl" : "ltr"}
      className={`inline-flex min-h-11 items-center underline-offset-4 hover:underline ${className}`}
    >
      {t("languageLabel")}
    </a>
  );
}
