import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { CookieSettingsButton } from "@/features/consent/CookieSettingsButton";
import { staticPageMetadata } from "@/features/content/pages";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { pagePaths } from "@/lib/routes";
import { getSiteSettings } from "@/lib/site/settings";
import { legalEn } from "./content-en";
import { legalHe } from "./content-he";
import { LEGAL_UPDATED, type LegalFacts, type LegalPage as Key } from "./types";

const content = { he: legalHe, en: legalEn };

export function legalMetadata(locale: Locale, page: Key): Metadata {
  return staticPageMetadata(locale, page);
}

/** Accessibility statement, privacy, terms and cookies: drafts, clearly marked. */
export async function LegalPage({
  locale,
  page,
}: {
  locale: Locale;
  page: Key;
}) {
  const [pages, t, common, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "legal" }),
    getTranslations({ locale, namespace: "common" }),
    getSiteSettings(),
  ]);
  const missing = <Placeholder label={common("placeholder")} />;
  const or = (value: string | null, ltr = false) =>
    value ? ltr ? <span dir="ltr">{value}</span> : value : missing;
  const { street, area, city } = settings.address;
  const address = [street, area, city]
    .flatMap((part) => (part ? [localized(part, locale).value] : []))
    .join(", ");
  const store = settings.phones.store;

  const facts: LegalFacts = {
    name: localized(settings.name, locale).value,
    address: address || missing,
    storePhone: store ? (
      <a href={`tel:${store.e164}`} className="underline underline-offset-4">
        <span dir="ltr">{store.display}</span>
      </a>
    ) : (
      missing
    ),
    email: settings.email ? (
      <a
        href={`mailto:${settings.email}`}
        className="underline underline-offset-4"
      >
        <span dir="ltr">{settings.email}</span>
      </a>
    ) : (
      missing
    ),
    registrationNumber: or(settings.registrationNumber, true),
    coordinator: or(settings.accessibility.coordinator),
    coordinatorContact: or(settings.accessibility.contact, true),
    missing,
    links: {
      privacy: localeHref(locale, pagePaths.privacy),
      cookies: localeHref(locale, pagePaths.cookies),
      visit: localeHref(locale, pagePaths.visit),
      contact: localeHref(locale, pagePaths.contact),
    },
    cookieSettings: (label) => (
      <CookieSettingsButton className="font-semibold underline underline-offset-4">
        {label}
      </CookieSettingsButton>
    ),
  };
  const updated = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    dateStyle: "long",
  }).format(new Date(`${LEGAL_UPDATED}T12:00:00Z`));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader locale={locale} title={pages(page)}>
        <p className="mt-4 text-ink-muted">
          {t("updated")} <time dateTime={LEGAL_UPDATED}>{updated}</time>
        </p>
      </PageHeader>
      <p className="mt-10 max-w-prose rounded-sm border-2 border-highlight bg-paper p-4 font-semibold">
        {t("draft")}
      </p>
      <div className="legal-prose mt-8 max-w-prose text-lg leading-relaxed">
        {content[locale][page](facts)}
      </div>
    </div>
  );
}
