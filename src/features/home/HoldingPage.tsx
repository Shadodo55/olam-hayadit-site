import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locales";
import { business, wazeUrl, whatsappUrl } from "@/lib/site/business";

/**
 * Temporary home page content: real, confirmed store details only.
 * Replaced by the full home page in phase 6.
 */
export async function HoldingPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const header = await getTranslations({ locale, namespace: "header" });
  const footer = await getTranslations({ locale, namespace: "footer" });
  const common = await getTranslations({ locale, namespace: "common" });
  const days = (await getTranslations({ locale, namespace: "days" }))(
    "long",
  ).split(",");
  const { address, phones } = business;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section
        className="grid gap-8 py-16 sm:py-24 lg:grid-cols-12"
        aria-labelledby="intro"
      >
        <div className="lg:col-span-7">
          <h1 id="intro" className="text-5xl sm:text-7xl">
            {business.name[locale]}
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
              {business.hours.map((day, index) => (
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
          <p className="mt-4 text-sm text-ink-muted">{footer("holidayNote")}</p>
        </section>

        <section
          className="lg:col-span-6 lg:col-start-7"
          aria-labelledby="visit"
        >
          <h2 id="visit" className="text-3xl">
            {t("visitHeading")}
          </h2>
          <address className="mt-6 text-xl not-italic">
            {address.street[locale]}, {address.city[locale]}
            <span className="block text-base text-ink-muted">
              {address.area[locale]}
            </span>
          </address>

          <h3 className="mt-10 text-xl">{t("contactHeading")}</h3>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            <li>
              <a
                href={`tel:${phones.store.e164}`}
                className="flex min-h-12 items-center justify-between gap-4 py-3 hover:underline"
              >
                <span>{footer("storePhone")}</span>
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
                <span>{footer("mobilePhone")}</span>
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
              className={buttonClass("solid")}
            >
              {header("whatsapp")}
              <span className="sr-only"> {common("opensInNewTab")}</span>
            </a>
            <a
              href={wazeUrl()}
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
