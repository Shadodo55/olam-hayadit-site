import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/Wordmark";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Placeholder } from "@/components/ui/Placeholder";
import type { Category } from "@/features/catalog/category-tree";
import { CookieSettingsButton } from "@/features/consent/CookieSettingsButton";
import { groupHours } from "@/features/store-info/hours";
import { UpcomingSpecialDays } from "@/features/store-info/UpcomingSpecialDays";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { wazeUrl, whatsappUrl, type SiteSettings } from "@/lib/site/settings";
import {
  categoryNav,
  footerInfoPages,
  legalPages,
  pageLinks,
} from "./site-nav";

export async function SiteFooter({
  locale,
  settings,
  categories,
}: {
  locale: Locale;
  settings: SiteSettings;
  categories: readonly Category[];
}) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const common = await getTranslations({ locale, namespace: "common" });
  const header = await getTranslations({ locale, namespace: "header" });
  const days = (await getTranslations({ locale, namespace: "days" }))(
    "long",
  ).split(",");
  const year = new Date().getFullYear();
  const name = localized(settings.name, locale).value;
  const { street, area, city } = settings.address;
  const placeholder = <Placeholder label={common("placeholder")} />;
  const whatsapp = whatsappUrl(settings.whatsapp);

  const linkClass =
    "inline-flex min-h-11 items-center text-on-band/80 underline-offset-4 hover:text-on-band hover:underline sm:min-h-9";
  const headingClass = "font-display text-lg text-on-band";

  return (
    <footer className="on-dark mt-24 bg-band text-on-band print:hidden">
      {/* Invitation to the showroom, with the three ways to get in touch */}
      <div className="border-b border-on-band/15">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-14">
          <div className="lg:col-span-7">
            <h2 className="display-title text-3xl sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 text-on-band/80">
              {street ? localized(street, locale).value : placeholder}
              {area && `, ${localized(area, locale).value}`}
              {city && `, ${localized(city, locale).value}`}
            </p>
          </div>
          <ul className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            {settings.phones.store && (
              <li>
                <a
                  href={`tel:${settings.phones.store.e164}`}
                  className={buttonClass("highlight")}
                >
                  <PhoneIcon />
                  {header("call")}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("onDark")}
                >
                  <ChatIcon />
                  {header("whatsapp")}
                  <span className="sr-only"> {common("opensInNewTab")}</span>
                </a>
              </li>
            )}
            <li>
              <a
                href={wazeUrl(settings)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("onDark")}
              >
                <PinIcon />
                {header("navigate")}
                <span className="sr-only"> {common("opensInNewTab")}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-10 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Wordmark
            name={name}
            href={localeHref(locale)}
            label={header("homeLink")}
            tone="dark"
          />
          <p className="mt-4 max-w-sm text-on-band/80">{t("about")}</p>
        </div>

        <nav aria-labelledby="footer-catalog" className="lg:col-span-2">
          <h2 id="footer-catalog" className={headingClass}>
            {t("catalogHeading")}
          </h2>
          <ul className="mt-3">
            {categoryNav(locale, categories).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-info" className="lg:col-span-2">
          <h2 id="footer-info" className={headingClass}>
            {t("infoHeading")}
          </h2>
          <ul className="mt-3">
            {pageLinks(locale, footerInfoPages).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="footer-visit" className="lg:col-span-4">
          <h2 id="footer-visit" className={headingClass}>
            {t("visitHeading")}
          </h2>
          <address className="mt-3 text-on-band/80 not-italic">
            {street ? localized(street, locale).value : placeholder}
            {city && `, ${localized(city, locale).value}`}
            {area && (
              <>
                <br />
                {localized(area, locale).value}
              </>
            )}
          </address>

          <h3 className="mt-6 font-medium text-on-band">{t("hoursHeading")}</h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-on-band/80">
            {groupHours(settings.hours).map((group) => (
              <div key={group.from} className="contents">
                <dt>
                  {days[group.from]}
                  {group.to !== group.from && `–${days[group.to]}`}
                </dt>
                <dd className="tabular">
                  {group.hours ? (
                    <span dir="ltr">
                      {group.hours.opens}–{group.hours.closes}
                    </span>
                  ) : (
                    t("closedDay")
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <UpcomingSpecialDays specialDays={settings.specialDays} />
          <p className="mt-2 text-sm text-on-band/70">
            {settings.hoursNote
              ? localized(settings.hoursNote, locale).value
              : t("holidayNote")}
          </p>

          <ul className="mt-6 space-y-1">
            {settings.phones.store && (
              <li>
                <a
                  href={`tel:${settings.phones.store.e164}`}
                  className={linkClass}
                >
                  {t("storePhone")}:&nbsp;
                  <span dir="ltr" className="tabular">
                    {settings.phones.store.display}
                  </span>
                </a>
              </li>
            )}
            {settings.phones.mobile && (
              <li>
                <a
                  href={`tel:${settings.phones.mobile.e164}`}
                  className={linkClass}
                >
                  {t("mobilePhone")}:&nbsp;
                  <span dir="ltr" className="tabular">
                    {settings.phones.mobile.display}
                  </span>
                </a>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="border-t border-on-band/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <nav aria-label={t("legalNav")}>
            <ul className="flex flex-wrap gap-x-6">
              {pageLinks(locale, legalPages).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className={linkClass}>
                  {t("cookieSettings")}
                </CookieSettingsButton>
              </li>
            </ul>
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-on-band/70">
            <span>{t("rights", { year, name })}</span>
            <span>
              {t("registration")} {settings.registrationNumber ?? placeholder}
            </span>
            <span>
              {t("email")}:{" "}
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="underline underline-offset-4"
                >
                  {settings.email}
                </a>
              ) : (
                placeholder
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
