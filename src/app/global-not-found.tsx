import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import { icons } from "@/lib/seo/metadata";
import { themeInitScript, themePickerEnabled } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "הדף לא נמצא | Page not found",
  robots: { index: false },
  icons,
};

/** Bilingual 404: there is no locale to read from an unmatched URL. */
export default function GlobalNotFound() {
  return (
    <html
      lang="he"
      dir="rtl"
      className={fontVariables}
      suppressHydrationWarning={themePickerEnabled}
    >
      {themePickerEnabled && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
      )}
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <main className="mx-auto max-w-3xl px-4 py-24 sm:px-8">
          <p className="font-display text-7xl text-accent-ink tabular">404</p>
          <h1 className="mt-6 text-4xl">הדף שחיפשתם לא נמצא</h1>
          <p className="mt-4 text-lg text-ink-muted">
            ייתכן שהקישור שגוי או שהדף הועבר.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center font-semibold underline underline-offset-4"
          >
            לדף הבית
          </Link>

          <div lang="en" dir="ltr" className="mt-16 border-t border-line pt-10">
            <h2 className="text-2xl">Page not found</h2>
            <p className="mt-3 text-ink-muted">
              The link may be wrong, or the page has moved.
            </p>
            <Link
              href="/en"
              className="mt-4 inline-flex min-h-12 items-center font-semibold underline underline-offset-4"
            >
              Go to the English home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
