import { categoryPath, type Category } from "@/features/catalog/category-tree";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths, type PageKey } from "@/lib/routes";
import { wazeUrl, whatsappUrl, type SiteSettings } from "@/lib/site/settings";
import type { NavItem, NavLink } from "./nav-types";

/** Navigation data for header, mobile menu and footer, resolved for one locale. */
export function categoryNav(
  locale: Locale,
  tree: readonly Category[],
): NavItem[] {
  return tree.map((category) => ({
    label: localized(category.name, locale).value,
    href: localeHref(locale, categoryPath(category.slug)),
    allLabel: localized(category.allLabel, locale).value,
    children: category.children?.map((child) => ({
      label: localized(child.name, locale).value,
      href: localeHref(locale, categoryPath(category.slug, child.slug)),
    })),
  }));
}

export function pageLinks(locale: Locale, keys: readonly PageKey[]): NavLink[] {
  const titles = messagesFor(locale).pages;
  return keys.map((key) => ({
    label: titles[key],
    href: localeHref(locale, pagePaths[key]),
  }));
}

/** Header utility bar (desktop) and mobile menu secondary links. */
export const secondaryPages = [
  "professionals",
  "visit",
  "projects",
  "catalogs",
  "measuringGuide",
  "about",
  "contact",
] as const satisfies readonly PageKey[];

export const footerInfoPages = [
  "about",
  "professionals",
  "projects",
  "brands",
  "catalogs",
  "measuringGuide",
  "faq",
  "contact",
] as const satisfies readonly PageKey[];

export const legalPages = [
  "accessibility",
  "privacy",
  "terms",
  "cookies",
] as const satisfies readonly PageKey[];

export interface QuickActions {
  tel: string | null;
  whatsapp: string | null;
  waze: string;
}

export function quickActions(settings: SiteSettings): QuickActions {
  const phone = settings.phones.store ?? settings.phones.mobile;
  return {
    tel: phone ? `tel:${phone.e164}` : null,
    whatsapp: whatsappUrl(settings.whatsapp),
    waze: wazeUrl(settings),
  };
}
