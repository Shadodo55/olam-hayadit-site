import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/Wordmark";
import { ListIcon, SearchIcon } from "@/components/ui/icons";
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

  const iconLink =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2 hover:bg-surface";

  return (
    <header className="print:hidden">
      {/* Utility bar: live status, a few links, language. */}
      <div className="on-dark bg-band text-sm text-on-band">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={localeHref(locale, pagePaths.visit)}
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            <OpenStatus
              hours={settings.hours}
              specialDays={settings.specialDays}
            />
          </Link>
          <nav
            aria-label={t("secondaryNav")}
            className="flex items-center gap-5"
          >
            <ul className="hidden items-center gap-5 lg:flex">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-on-band/85 underline-offset-4 hover:text-on-band hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-line">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:min-h-20 lg:gap-8 lg:px-8">
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
              <span className="sr-only lg:not-sr-only">{t("search")}</span>
            </Link>
            <Link
              href={localeHref(locale, pagePaths.myList)}
              className={iconLink}
            >
              <ListIcon />
              <span className="sr-only lg:not-sr-only">{t("myList")}</span>
              <MyListBadge />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
