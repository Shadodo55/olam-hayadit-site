import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Placeholder } from "@/components/ui/Placeholder";
import { localized, type Locale } from "@/lib/i18n/locales";
import { wazeUrl, whatsappUrl, type SiteSettings } from "@/lib/site/settings";
import { MapEmbed } from "./MapEmbed";
import { OpenStatus } from "./OpenStatus";
import { UpcomingSpecialDays } from "./UpcomingSpecialDays";

/**
 * Address, live status, weekly hours (+ holidays), contact actions and the
 * consent-gated map. Used on the home page (compact) and the visit page.
 */
export async function StoreVisit({
  locale,
  settings,
  headingLevel = 2,
  showParking = false,
}: {
  locale: Locale;
  settings: SiteSettings;
  headingLevel?: 2 | 3;
  showParking?: boolean;
}) {
  const [t, footer, header, common, dayNames] = await Promise.all([
    getTranslations({ locale, namespace: "visit" }),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "days" }),
  ]);
  const days = dayNames("long").split(",");
  const H = headingLevel === 2 ? "h2" : "h3";
  const { street, area, city } = settings.address;
  const addressLine = [street, city]
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => localized(x, locale).value)
    .join(", ");
  const mapQuery = [street?.he, city?.he].filter(Boolean).join(", ");
  const whatsapp = whatsappUrl(settings.whatsapp);
  const phone = settings.phones.store ?? settings.phones.mobile;
  const name = localized(settings.name, locale).value;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    // data-store-visit: the footer's own "come visit" band hides on pages
    // that already show this (globals.css), so it isn't said twice.
    <div className="grid gap-10 lg:grid-cols-12" data-store-visit>
      <div className="lg:col-span-5">
        <H className="text-xl">{t("addressTitle")}</H>
        <address className="mt-2 text-lg not-italic">
          {addressLine || <Placeholder label={common("placeholder")} />}
          {area && (
            <span className="block text-base text-ink-muted">
              {localized(area, locale).value}
            </span>
          )}
        </address>

        <p className="mt-6 inline-flex items-center gap-2 rounded-sm bg-surface px-3 py-2">
          <OpenStatus
            hours={settings.hours}
            specialDays={settings.specialDays}
          />
        </p>

        <H className="mt-8 text-xl">{t("hoursTitle")}</H>
        <table className="mt-2 w-full border-collapse">
          <caption className="sr-only">{t("hoursTitle")}</caption>
          <tbody>
            {settings.hours.map((day, index) => (
              <tr key={days[index]} className="border-b border-line">
                <th scope="row" className="py-2 text-start font-normal">
                  {days[index]}
                </th>
                <td className="py-2 text-end font-semibold tabular">
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
        <UpcomingSpecialDays specialDays={settings.specialDays} tone="light" />
        <p className="mt-3 text-sm text-ink-muted">
          {settings.hoursNote
            ? localized(settings.hoursNote, locale).value
            : footer("holidayNote")}
        </p>

        {showParking && (
          <>
            <H className="mt-8 text-xl">{t("parkingTitle")}</H>
            <p className="mt-2">
              {settings.parking ? (
                localized(settings.parking, locale).value
              ) : (
                <Placeholder label={common("placeholder")} />
              )}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {phone && (
            <a
              href={`tel:${phone.e164}`}
              className={buttonClass("solid", "md")}
            >
              <PhoneIcon />
              <span dir="ltr">{phone.display}</span>
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "md")}
            >
              <ChatIcon />
              {header("whatsapp")}
              <span className="sr-only"> {common("opensInNewTab")}</span>
            </a>
          )}
        </div>
      </div>

      <div className="lg:col-span-7">
        <MapEmbed query={mapQuery} name={name} />
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <a
            href={wazeUrl(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4"
          >
            <PinIcon />
            {header("navigate")}
            <span className="sr-only"> {common("opensInNewTab")}</span>
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            Google Maps
            <span className="sr-only"> {common("opensInNewTab")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
