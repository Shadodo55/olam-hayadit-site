import { categoryPath, categoryTree } from "@/features/catalog/category-tree";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";
import { pagePaths, type PageKey } from "@/lib/routes";
import { business, wazeUrl, whatsappUrl } from "@/lib/site/business";
import type { NavItem, NavLink } from "./nav-types";
import type { QuickActions } from "./MobileMenu";

/** Navigation data for header, mobile menu and footer, resolved for one locale. */
export function categoryNav(locale: Locale): NavItem[] {
  return categoryTree.map((category) => ({
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

export function quickActions(): QuickActions {
  return {
    tel: `tel:${business.phones.store.e164}`,
    whatsapp: whatsappUrl(),
    waze: wazeUrl(),
  };
}
