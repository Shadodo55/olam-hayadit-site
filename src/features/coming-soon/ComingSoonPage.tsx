import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { buttonClass } from "@/components/ui/button";
import {
  categoryPath,
  findCategoryChain,
  type Category,
} from "@/features/catalog/category-tree";
import { getCategoryTree } from "@/features/catalog/data";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";
import { pageKeyForPath, pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings, whatsappUrl } from "@/lib/site/settings";

interface Resolved {
  path: string;
  title: string;
  crumbs: Crumb[];
  isCategory: boolean;
}

/** Turn a catch-all slug into a planned page or catalog category. */
function resolve(
  locale: Locale,
  slug: string[],
  tree: readonly Category[],
): Resolved | null {
  const messages = messagesFor(locale);
  const path = `/${slug.join("/")}`;
  const home: Crumb = { label: messages.common.home, href: localeHref(locale) };

  const pageKey = pageKeyForPath(path);
  if (pageKey) {
    const title = messages.pages[pageKey];
    return { path, title, crumbs: [home, { label: title }], isCategory: false };
  }

  if (slug[0] === "catalog") {
    const chain = findCategoryChain(tree, slug.slice(1));
    if (!chain) return null;
    const catalog: Crumb = {
      label: messages.pages.catalog,
      href: localeHref(locale, pagePaths.catalog),
    };
    const crumbs: Crumb[] = [home, catalog];
    chain.forEach((category, index) => {
      const label = localized(category.name, locale).value;
      const isLast = index === chain.length - 1;
      crumbs.push(
        isLast
          ? { label }
          : {
              label,
              href: localeHref(
                locale,
                categoryPath(...chain.slice(0, index + 1).map((c) => c.slug)),
              ),
            },
      );
    });
    const title = localized(chain[chain.length - 1]!.name, locale).value;
    return { path, title, crumbs, isCategory: true };
  }
  return null;
}

export async function comingSoonMetadata(
  locale: Locale,
  slug: string[],
): Promise<Metadata> {
  const page = resolve(locale, slug, await getCategoryTree());
  return page ? pageMetadata(locale, page.path, page.title) : {};
}

/** Placeholder for pages that are planned but not built yet. */
export async function ComingSoonPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string[];
}) {
  const [tree, settings, t, common] = await Promise.all([
    getCategoryTree(),
    getSiteSettings(),
    getTranslations({ locale, namespace: "comingSoon" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const page = resolve(locale, slug, tree);
  if (!page) notFound();
  const whatsapp = whatsappUrl(settings.whatsapp);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={page.crumbs} label={common("breadcrumbs")} />
      <div className="max-w-2xl py-12 sm:py-20">
        <h1 className="text-4xl sm:text-6xl">{page.title}</h1>
        <p className="mt-6 text-lg text-ink-muted">
          {page.isCategory ? t("categoryBody") : t("body")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localeHref(locale)} className={buttonClass("solid")}>
            {t("toHome")}
          </Link>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline")}
            >
              {t("askWhatsapp")}
              <span className="sr-only"> {common("opensInNewTab")}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
