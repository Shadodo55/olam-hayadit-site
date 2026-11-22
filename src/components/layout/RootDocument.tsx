import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeDirection, type Locale } from "@/lib/i18n/locales";

/** Shared <html>/<body> shell for both root layouts (Hebrew and English). */
export function RootDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const t = getDictionary(locale);
  return (
    <html lang={locale} dir={localeDirection[locale]} className={fontVariables}>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          {t.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
