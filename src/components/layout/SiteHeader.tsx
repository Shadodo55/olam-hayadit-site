import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/Wordmark";
import { ListIcon, PhoneIcon, SearchIcon } from "@/components/ui/icons";
import type { Category } from "@/features/catalog/category-tree";
import { MyListBadge } from "@/features/my-list/MyListBadge";
import { OpenStatus } from "@/features/store-info/OpenStatus";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { pagePaths } from "@/lib/routes";
import type { SiteSettings } from "@/lib/site/settings";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import {
  categoryNav,
  pageLinks,
  quickActions,
  secondaryPages,
} from "./site-nav";

export async function SiteHeader({
  locale,
  settings,
  categories,
}: {
  locale: Locale;
  settings: SiteSettings;
  categories: readonly Category[];
}) {
  const t = await getTranslations({ locale, namespace: "header" });
  const nav = categoryNav(locale, categories);
  const secondary = pageLinks(locale, secondaryPages);
  const utilityLinks = pageLinks(locale, ["professionals", "visit"]);

  const footer = await getTranslations({ locale, namespace: "footer" });
  const phones = [
    { label: footer("storePhone"), phone: settings.phones.store },
    { label: footer("mobilePhone"), phone: settings.phones.mobile },
  ].flatMap(({ label, phone }) => (phone ? [{ label, phone }] : []));

  const iconLink =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 font-medium hover:bg-surface";
  const utilityLink =
    "inline-flex min-h-10 items-center gap-1.5 text-on-band/85 underline-offset-4 hover:text-on-band hover:underline";

  return (
    <>
      {/* Utility bar: live status, phones, a few links, language. Scrolls away. */}
      <div className="on-dark bg-band text-sm text-on-band print:hidden">
        <nav
          aria-label={t("secondaryNav")}
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        >
          <Link
            href={localeHref(locale, pagePaths.visit)}
            className="inline-flex min-h-10 items-center underline-offset-4 hover:underline"
          >
            <OpenStatus
              hours={settings.hours}
              specialDays={settings.specialDays}
            />
          </Link>
          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-6 lg:flex">
              {phones.map(({ label, phone }) => (
                <li key={label}>
                  <a href={`tel:${phone.e164}`} className={utilityLink}>
                    <PhoneIcon width={16} height={16} />
                    {label}{" "}
                    <span
                      dir="ltr"
                      className="font-semibold text-on-band tabular"
                    >
                      {phone.display}
                    </span>
                  </a>
                </li>
              ))}
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={utilityLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>

      {/* Main bar: stays at the top while scrolling. */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper print:hidden">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:min-h-20 lg:gap-10 lg:px-8">
          <MobileMenu
            items={nav}
            secondary={secondary}
            quick={quickActions(settings)}
          />
          <Wordmark
            name={localized(settings.name, locale).value}
            href={localeHref(locale)}
            label={t("homeLink")}
          />
          <DesktopNav items={nav} label={t("mainNav")} />
          <div className="ms-auto flex items-center gap-1">
            <Link
              href={localeHref(locale, pagePaths.search)}
              className={iconLink}
            >
              <SearchIcon />
              <span className="sr-only xl:not-sr-only">{t("search")}</span>
            </Link>
            <Link
              href={localeHref(locale, pagePaths.myList)}
              className={iconLink}
            >
              <ListIcon />
              <span className="sr-only xl:not-sr-only">{t("myList")}</span>
              <MyListBadge />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
