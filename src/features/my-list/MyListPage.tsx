import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localized, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/site/settings";
import { MyListView } from "./MyListView";

export function myListMetadata(locale: Locale): Metadata {
  return {
    ...pageMetadata(locale, pagePaths.myList, messagesFor(locale).pages.myList),
    robots: { index: false },
  };
}

export async function MyListPage({ locale }: { locale: Locale }) {
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "list" }),
    getSiteSettings(),
  ]);
  const { street, city } = settings.address;
  const phone = settings.phones.store ?? settings.phones.mobile;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-muted print:hidden">
        {t("intro")}
      </p>
      <div className="mt-8">
        <MyListView
          whatsappId={settings.whatsapp?.waId ?? null}
          store={{
            name: localized(settings.name, locale).value,
            address: [street, city]
              .filter((x): x is NonNullable<typeof x> => Boolean(x))
              .map((x) => localized(x, locale).value)
              .join(", "),
            phone: phone?.display ?? null,
          }}
        />
      </div>
    </div>
  );
}
