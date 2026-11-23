import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/Placeholder";
import { localized, type Locale } from "@/lib/i18n/locales";
import { getSiteSettings, wazeUrl, whatsappUrl } from "@/lib/site/settings";

/**
 * Temporary home page content: store details from the CMS.
 * Replaced by the full home page in phase 6.
 */
export async function HoldingPage({ locale }: { locale: Locale }) {
  const [t, header, footer, common, dayNames, settings] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "days" }),
    getSiteSettings(),
  ]);
  const days = dayNames("long").split(",");
  const { street, area, city } = settings.address;
  const whatsapp = whatsappUrl(settings.whatsapp);
  const phones = [
    { label: footer("storePhone"), phone: settings.phones.store },
    { label: footer("mobilePhone"), phone: settings.phones.mobile },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section
        className="grid gap-8 py-16 sm:py-24 lg:grid-cols-12"
        aria-labelledby="intro"
      >
        <div className="lg:col-span-7">
          <h1 id="intro" className="text-5xl sm:text-7xl">
            {localized(settings.name, locale).value}
          </h1>
          <p className="mt-6 font-display text-2xl text-brass-ink sm:text-3xl">
            {t("tagline")}
          </p>
        </div>
        <p className="max-w-prose self-end text-lg text-ink-muted lg:col-span-5">
          {t("underConstruction")}
        </p>
      </section>

      <div className="grid gap-12 border-t border-line py-12 sm:py-16 lg:grid-cols-12">
        <section className="lg:col-span-5" aria-labelledby="hours">
          <h2 id="hours" className="text-3xl">
            {t("hoursHeading")}
          </h2>
          <table className="mt-6 w-full border-collapse">
            <caption className="sr-only">{t("hoursHeading")}</caption>
            <tbody>
              {settings.hours.map((day, index) => (
                <tr key={days[index]} className="border-b border-line">
                  <th scope="row" className="py-3 text-start font-normal">
                    {days[index]}
                  </th>
                  <td className="py-3 text-end font-semibold tabular">
                    {day ? (
                      <span dir="ltr">
                        {day.opens}–{day.closes}
                      </span>
                    ) : (
                      footer("closedDay")
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-ink-muted">
            {settings.hoursNote
              ? localized(settings.hoursNote, locale).value
              : footer("holidayNote")}
          </p>
        </section>

        <section
          className="lg:col-span-6 lg:col-start-7"
          aria-labelledby="visit"
        >
          <h2 id="visit" className="text-3xl">
            {t("visitHeading")}
          </h2>
          <address className="mt-6 text-xl not-italic">
            {street ? (
              localized(street, locale).value
            ) : (
              <Placeholder label={common("placeholder")} />
            )}
            {city && `, ${localized(city, locale).value}`}
            {area && (
              <span className="block text-base text-ink-muted">
                {localized(area, locale).value}
              </span>
            )}
          </address>

          <h3 className="mt-10 text-xl">{t("contactHeading")}</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {phones
              .filter((p) => p.phone)
              .map(({ label, phone }) => (
                <li key={label}>
                  <a
                    href={`tel:${phone!.e164}`}
                    className="flex min-h-12 items-center justify-between gap-4 py-3 hover:underline"
                  >
                    <span>{label}</span>
                    <span dir="ltr" className="font-semibold tabular">
                      {phone!.display}
                    </span>
                  </a>
                </li>
              ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("solid")}
              >
                {header("whatsapp")}
                <span className="sr-only"> {common("opensInNewTab")}</span>
              </a>
            )}
            <a
              href={wazeUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline")}
            >
              {header("navigate")}
              <span className="sr-only"> {common("opensInNewTab")}</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
