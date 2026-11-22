import { business, wazeUrl, whatsappUrl } from "@/lib/site/business";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Phase-1 holding page: real, confirmed store details only.
 * Replaced by the full home page in phase 6.
 */
export function HoldingPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const { address, phones } = business;

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <p className="font-display text-xl">{business.name[locale]}</p>
          <a
            href={t.languageSwitch.href}
            hrefLang={t.languageSwitch.lang}
            lang={t.languageSwitch.lang}
            className="inline-flex min-h-11 items-center px-2 underline-offset-4 hover:underline"
          >
            {t.languageSwitch.label}
          </a>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 sm:px-8">
        <section
          className="grid gap-8 py-16 sm:py-24 lg:grid-cols-12"
          aria-labelledby="intro"
        >
          <div className="lg:col-span-7">
            <h1 id="intro" className="text-5xl sm:text-7xl">
              {business.name[locale]}
            </h1>
            <p className="mt-6 font-display text-2xl text-brass-ink sm:text-3xl">
              {t.tagline}
            </p>
          </div>
          <p className="max-w-prose self-end text-lg text-ink-muted lg:col-span-5">
            {t.underConstruction}
          </p>
        </section>

        <div className="grid gap-12 border-t border-line py-12 sm:py-16 lg:grid-cols-12">
          <section className="lg:col-span-5" aria-labelledby="hours">
            <h2 id="hours" className="text-3xl">
              {t.hoursHeading}
            </h2>
            <table className="mt-6 w-full border-collapse">
              <caption className="sr-only">{t.hoursHeading}</caption>
              <tbody>
                {business.hours.map((day, index) => (
                  <tr key={t.days[index]} className="border-b border-line">
                    <th scope="row" className="py-3 text-start font-normal">
                      {t.days[index]}
                    </th>
                    <td className="py-3 text-end font-semibold tabular">
                      {day ? (
                        <span dir="ltr">
                          {day.opens}–{day.closes}
                        </span>
                      ) : (
                        t.closed
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-ink-muted">{t.holidayNote}</p>
          </section>

          <section
            className="lg:col-span-6 lg:col-start-7"
            aria-labelledby="visit"
          >
            <h2 id="visit" className="text-3xl">
              {t.visitHeading}
            </h2>
            <address className="mt-6 text-xl not-italic">
              {address.street[locale]}, {address.city[locale]}
              <span className="block text-base text-ink-muted">
                {address.area[locale]}
              </span>
            </address>

            <h3 className="mt-10 text-xl">{t.contactHeading}</h3>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              <li>
                <a
                  href={`tel:${phones.store.e164}`}
                  className="flex min-h-12 items-center justify-between gap-4 py-3 hover:underline"
                >
                  <span>{t.storePhone}</span>
                  <span dir="ltr" className="font-semibold tabular">
                    {phones.store.display}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phones.mobile.e164}`}
                  className="flex min-h-12 items-center justify-between gap-4 py-3 hover:underline"
                >
                  <span>{t.mobilePhone}</span>
                  <span dir="ltr" className="font-semibold tabular">
                    {phones.mobile.display}
                  </span>
                </a>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-sm bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
              >
                {t.whatsapp}
                <span className="sr-only"> {t.opensInNewTab}</span>
              </a>
              <a
                href={wazeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-sm border border-line-strong px-6 font-semibold hover:bg-surface"
              >
                {t.navigate}
                <span className="sr-only"> {t.opensInNewTab}</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-8 border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-muted sm:px-8">
          © {new Date().getFullYear()} {business.name[locale]}
        </p>
      </footer>
    </>
  );
}
