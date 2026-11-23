import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings, whatsappUrl } from "@/lib/site/settings";
import { SearchView, SearchWithParams } from "./SearchView";

export function searchMetadata(locale: Locale): Metadata {
  // Search result pages should never be indexed.
  return {
    ...pageMetadata(locale, pagePaths.search, messagesFor(locale).pages.search),
    robots: { index: false },
  };
}

export async function SearchPage({ locale }: { locale: Locale }) {
  const [pages, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getSiteSettings(),
  ]);
  const whatsapp = whatsappUrl(settings.whatsapp);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl">{pages("search")}</h1>
      <div className="mt-8">
        <Suspense fallback={<SearchView initialQuery="" whatsapp={whatsapp} />}>
          <SearchWithParams whatsapp={whatsapp} />
        </Suspense>
      </div>
    </div>
  );
}
