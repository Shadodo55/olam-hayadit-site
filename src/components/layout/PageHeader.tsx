import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { localeHref, type Locale } from "@/lib/i18n/locales";

/** Breadcrumbs (Home > … > title), the page's single h1 and an optional intro. */
export async function PageHeader({
  locale,
  title,
  titleLang,
  intro,
  trail = [],
  children,
}: {
  locale: Locale;
  title: string;
  /** Set to "he" when the title is a Hebrew fallback on the English site. */
  titleLang?: "he";
  intro?: string;
  /** Crumbs between Home and the current page. */
  trail?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  const common = await getTranslations({ locale, namespace: "common" });
  return (
    <header>
      <Breadcrumbs
        label={common("breadcrumbs")}
        items={[
          { label: common("home"), href: localeHref(locale) },
          ...trail,
          { label: title },
        ]}
      />
      <h1 className="mt-6 text-4xl sm:text-5xl" lang={titleLang}>
        {title}
      </h1>
      {intro && (
        <p className="mt-4 max-w-prose text-lg text-ink-muted">{intro}</p>
      )}
      {children}
    </header>
  );
}
