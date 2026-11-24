import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getCategoryTree } from "@/features/catalog/data";
import { ConsentManager } from "@/features/consent/ConsentManager";
import { fontVariables } from "@/lib/fonts";
import { IntlProvider } from "@/lib/i18n/IntlProvider";
import { localeDirection, localeHref, type Locale } from "@/lib/i18n/locales";
import { clientMessagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import { getSiteSettings } from "@/lib/site/settings";
import { themeInitScript, themePickerEnabled } from "@/lib/theme";
import { MobileActionBar } from "./MobileActionBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Shared <html>/<body> shell for both root layouts (Hebrew and English). */
export async function RootDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [t, settings, categories] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getSiteSettings(),
    getCategoryTree(),
  ]);
  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={fontVariables}
      // The theme script below may set data-theme before React hydrates.
      suppressHydrationWarning={themePickerEnabled}
    >
      {themePickerEnabled && (
        // App Router root layout (this component renders <html>): a plain
        // <head> is correct here; the rule targets the Pages Router.
        // eslint-disable-next-line @next/next/no-head-element
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
      )}
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        <IntlProvider
          locale={locale}
          messages={clientMessagesFor(locale)}
          timeZone="Asia/Jerusalem"
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader
            locale={locale}
            settings={settings}
            categories={categories}
          />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter
            locale={locale}
            settings={settings}
            categories={categories}
          />
          {/* Room for the phone action bar, so it never covers the footer. */}
          <div aria-hidden="true" className="h-16 lg:hidden print:hidden" />
          <MobileActionBar locale={locale} settings={settings} />
          <ConsentManager policyHref={localeHref(locale, pagePaths.cookies)} />
        </IntlProvider>
      </body>
    </html>
  );
}
