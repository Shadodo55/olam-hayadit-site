import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/Wordmark";
import { Placeholder } from "@/components/ui/Placeholder";
import { CookieSettingsButton } from "@/features/consent/CookieSettingsButton";
import { groupHours } from "@/features/store-info/hours";
import { localeHref, type Locale } from "@/lib/i18n/locales";
import { business, wazeUrl, whatsappUrl } from "@/lib/site/business";
import {
  categoryNav,
  footerInfoPages,
  legalPages,
  pageLinks,
} from "./site-nav";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const common = await getTranslations({ locale, namespace: "common" });
  const header = await getTranslations({ locale, namespace: "header" });
  const days = (await getTranslations({ locale, namespace: "days" }))(
    "long",
  ).split(",");
  const year = new Date().getFullYear();

  const linkClass =
    "inline-flex min-h-11 items-center text-paper/80 underline-offset-4 hover:text-paper hover:underline sm:min-h-9";
  const headingClass = "font-display text-lg text-paper";

  return (
    <footer className="on-dark mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-10 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <Wordmark
            name={business.name[locale]}
            href={localeHref(locale)}
            label={header("homeLink")}
            tone="dark"
          />
          <p className="mt-4 max-w-sm text-paper/80">{t("about")}</p>
        </div>

        <nav aria-labelledby="footer-catalog" className="lg:col-span-2">
          <h2 id="footer-catalog" className={headingClass}>
            {t("catalogHeading")}
          </h2>
          <ul className="mt-3">
            {categoryNav(locale).map((item) => (
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
          <address className="mt-3 text-paper/80 not-italic">
            {business.address.street[locale]}, {business.address.city[locale]}
            <br />
            {business.address.area[locale]}
          </address>

          <h3 className="mt-6 font-semibold text-paper">{t("hoursHeading")}</h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-paper/80">
            {groupHours(business.hours).map((group) => (
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
          <p className="mt-2 text-sm text-paper/70">{t("holidayNote")}</p>

          <ul className="mt-6 space-y-1">
            <li>
              <a
                href={`tel:${business.phones.store.e164}`}
                className={linkClass}
              >
                {t("storePhone")}:&nbsp;
                <span dir="ltr" className="tabular">
                  {business.phones.store.display}
                </span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${business.phones.mobile.e164}`}
                className={linkClass}
              >
                {t("mobilePhone")}:&nbsp;
                <span dir="ltr" className="tabular">
                  {business.phones.mobile.display}
                </span>
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {header("whatsapp")}
                <span className="sr-only"> {common("opensInNewTab")}</span>
              </a>
            </li>
            <li>
              <a
                href={wazeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {header("navigate")}
                <span className="sr-only"> {common("opensInNewTab")}</span>
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="border-t border-paper/15">
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
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-paper/70">
            <span>{t("rights", { year, name: business.name[locale] })}</span>
            <span>
              {t("registration")}{" "}
              {business.registrationNumber ?? (
                <Placeholder label={common("placeholder")} />
              )}
            </span>
            <span>
              {t("email")}:{" "}
              {business.email ?? <Placeholder label={common("placeholder")} />}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
