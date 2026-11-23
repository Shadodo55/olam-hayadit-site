import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { buttonClass } from "@/components/ui/button";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { pagePaths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings, whatsappUrl } from "@/lib/site/settings";
import {
  categoryPath,
  findCategoryChain,
  type Category,
} from "./category-tree";
import { getCategoryTree, getProducts, productsInCategory } from "./data";
import { sortCards, toCardData, type ProductCardData } from "./listing";
import { CatalogBrowser } from "./ui/CatalogBrowser";
import type { EnabledFilter } from "./ui/FiltersPanel";
import { ProductGrid } from "./ui/ProductCard";

const ALL_FILTERS: EnabledFilter[] = [
  "inStock",
  "finish",
  "holeToHole",
  "size",
  "brand",
  "material",
  "price",
];

async function resolve(slug: string[]) {
  const [tree, products] = await Promise.all([
    getCategoryTree(),
    getProducts(),
  ]);
  const chain = findCategoryChain(tree, slug);
  if (!chain) return null;
  const category = chain[chain.length - 1]!;
  return {
    tree,
    chain,
    category,
    products: productsInCategory(products, category),
  };
}

export async function categoryStaticParams(): Promise<{ slug: string[] }[]> {
  const tree = await getCategoryTree();
  const params: { slug: string[] }[] = [];
  const walk = (nodes: readonly Category[], prefix: string[]) =>
    nodes.forEach((n) => {
      params.push({ slug: [...prefix, n.slug] });
      if (n.children) walk(n.children, [...prefix, n.slug]);
    });
  walk(tree, []);
  return params;
}

export async function categoryMetadata(
  locale: Locale,
  slug: string[],
): Promise<Metadata> {
  const found = await resolve(slug);
  if (!found) return {};
  const { category } = found;
  return pageMetadata(
    locale,
    categoryPath(...slug),
    localized(category.name, locale).value,
    category.description
      ? localized(category.description, locale).value
      : undefined,
  );
}

export async function CategoryPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string[];
}) {
  const found = await resolve(slug);
  if (!found) notFound();
  const { chain, category, products } = found;
  const [common, pages] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "pages" }),
  ]);

  const crumbs: Crumb[] = [
    { label: common("home"), href: localeHref(locale) },
    { label: pages("catalog"), href: localeHref(locale, pagePaths.catalog) },
    ...chain.map((c, i) => {
      const label = localized(c.name, locale).value;
      return i === chain.length - 1
        ? { label }
        : {
            label,
            href: localeHref(
              locale,
              categoryPath(...chain.slice(0, i + 1).map((x) => x.slug)),
            ),
          };
    }),
  ];

  const title = localized(category.name, locale);
  const description = category.description
    ? localized(category.description, locale)
    : null;
  const enabled = category.filters.filter((f): f is EnabledFilter =>
    ALL_FILTERS.includes(f as EnabledFilter),
  );

  return (
    <CatalogLayout
      locale={locale}
      crumbs={crumbs}
      title={title}
      description={description}
      subcategories={(category.children ?? []).map((child) => ({
        label: localized(child.name, locale).value,
        href: localeHref(locale, categoryPath(...slug, child.slug)),
        count: productsInCategory(products, child).length,
      }))}
      cards={products.map(toCardData)}
      enabled={enabled}
    />
  );
}

/** The catalog home: top-level categories, then every product with all filters. */
export async function CatalogIndexPage({ locale }: { locale: Locale }) {
  const [tree, products, common, pages] = await Promise.all([
    getCategoryTree(),
    getProducts(),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "pages" }),
  ]);
  return (
    <CatalogLayout
      locale={locale}
      crumbs={[
        { label: common("home"), href: localeHref(locale) },
        { label: pages("catalog") },
      ]}
      title={{ value: pages("catalog"), isFallback: false }}
      description={null}
      subcategories={tree.map((c) => ({
        label: localized(c.name, locale).value,
        href: localeHref(locale, categoryPath(c.slug)),
        count: productsInCategory(products, c).length,
      }))}
      cards={products.map(toCardData)}
      enabled={ALL_FILTERS}
    />
  );
}

async function CatalogLayout({
  locale,
  crumbs,
  title,
  description,
  subcategories,
  cards,
  enabled,
}: {
  locale: Locale;
  crumbs: Crumb[];
  title: { value: string; isFallback: boolean };
  description: { value: string; isFallback: boolean } | null;
  subcategories: { label: string; href: string; count: number }[];
  cards: ProductCardData[];
  enabled: EnabledFilter[];
}) {
  const [t, common, comingSoon, settings] = await Promise.all([
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "comingSoon" }),
    getSiteSettings(),
  ]);
  const sorted = sortCards(cards, "newest", locale);
  const whatsapp = whatsappUrl(settings.whatsapp);
  const measureHref = localeHref(locale, pagePaths.measuringGuide);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={crumbs} label={common("breadcrumbs")} />

      <header className="mt-6 grid gap-4 lg:grid-cols-12">
        <h1
          className="text-4xl before:mb-4 before:block before:h-1.5 before:w-12 before:rounded-sm before:bg-accent sm:text-5xl lg:col-span-7"
          lang={title.isFallback ? "he" : undefined}
        >
          {title.value}
        </h1>
        {description && (
          <p
            className="max-w-prose self-end text-lg text-ink-muted lg:col-span-5"
            lang={description.isFallback ? "he" : undefined}
          >
            {description.value}
          </p>
        )}
      </header>

      {subcategories.length > 0 && (
        <nav aria-label={t("subcategories")} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong px-4 hover:bg-surface"
                >
                  {sub.label}
                  <span className="text-sm text-ink-muted tabular">
                    {sub.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-10">
        {cards.length === 0 ? (
          <div className="max-w-prose">
            <p className="text-lg">{t("emptyCategory")}</p>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("solid", "md", "mt-6")}
              >
                {comingSoon("askWhatsapp")}
                <span className="sr-only"> {common("opensInNewTab")}</span>
              </a>
            )}
          </div>
        ) : (
          <Suspense
            fallback={
              <div>
                <p className="border-b border-line pb-4 text-ink-muted">
                  {t("results", { count: sorted.length })}
                </p>
                <div className="mt-8">
                  <ProductGrid cards={sorted} />
                </div>
              </div>
            }
          >
            <CatalogBrowser
              cards={sorted}
              enabled={enabled}
              measureHref={measureHref}
            />
          </Suspense>
        )}
      </div>

      <p className="mt-12 max-w-prose text-sm text-ink-muted">
        {t("priceNote")}
      </p>
    </div>
  );
}
