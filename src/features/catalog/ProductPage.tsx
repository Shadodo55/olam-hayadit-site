import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { pagePaths, productPath } from "@/lib/routes";
import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/site/settings";
import { categoryPath, type Category } from "./category-tree";
import { getCategoryTree, getProducts } from "./data";
import { toCardData } from "./listing";
import type { Product } from "./product";
import { ProductGallery } from "./ui/ProductGallery";
import { ProductGrid } from "./ui/ProductCard";
import { ProductPurchase, ProductPurchaseFallback } from "./ui/ProductPurchase";

/** Path of categories (root → leaf) for a category id, or null. */
function chainForId(tree: readonly Category[], id: string): Category[] | null {
  for (const node of tree) {
    if (node.id === id) return [node];
    const sub = node.children ? chainForId(node.children, id) : null;
    if (sub) return [node, ...sub];
  }
  return null;
}

function relatedProducts(product: Product, all: readonly Product[]): Product[] {
  const explicit = product.relatedIds
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  if (explicit.length >= 4) return explicit.slice(0, 4);
  const sameCategory = all.filter(
    (p) =>
      p.id !== product.id &&
      !explicit.includes(p) &&
      p.categoryIds.some((id) => product.categoryIds.includes(id)),
  );
  return [...explicit, ...sameCategory].slice(0, 4);
}

export async function productStaticParams(): Promise<{ slug: string }[]> {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function productMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const product = (await getProducts()).find((p) => p.slug === slug);
  if (!product) return {};
  const description = product.seoDescription ?? product.shortDescription;
  const meta = pageMetadata(
    locale,
    productPath(slug),
    localized(product.title, locale).value,
    description ? localized(description, locale).value : undefined,
  );
  const image = product.images[0];
  if (!image) return meta;
  const og = new URL(image.src);
  og.searchParams.set("w", "1200");
  og.searchParams.set("fm", "jpg");
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: og.toString() }] },
  };
}

export async function ProductPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const [products, tree, settings, t, common, pages] = await Promise.all([
    getProducts(),
    getCategoryTree(),
    getSiteSettings(),
    getTranslations({ locale, namespace: "product" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "pages" }),
  ]);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const title = localized(product.title, locale);
  const chain =
    product.categoryIds.map((id) => chainForId(tree, id)).find(Boolean) ?? [];
  const crumbs: Crumb[] = [
    { label: common("home"), href: localeHref(locale) },
    { label: pages("catalog"), href: localeHref(locale, pagePaths.catalog) },
    ...chain.map((c, i) => ({
      label: localized(c.name, locale).value,
      href: localeHref(
        locale,
        categoryPath(...chain.slice(0, i + 1).map((x) => x.slug)),
      ),
    })),
    { label: title.value },
  ];

  const phone = settings.phones.store ?? settings.phones.mobile;
  const purchaseProps = {
    variants: product.variants,
    name: title.value,
    url: `${siteUrl}${localeHref(locale, productPath(product.slug))}`,
    whatsappId: settings.whatsapp?.waId ?? null,
    tel: phone ? `tel:${phone.e164}` : null,
  };

  const ccValues = [
    ...new Set(
      product.variants
        .map((v) => v.holeToHoleMm)
        .filter((n): n is number => n !== null),
    ),
  ].sort((a, b) => a - b);
  const lengths = [
    ...new Set(
      product.variants
        .map((v) => v.lengthMm)
        .filter((n): n is number => n !== null),
    ),
  ].sort((a, b) => a - b);
  const specRows: { label: string; value: string; ltr?: boolean }[] = [
    ...(product.brand
      ? [{ label: t("brand"), value: product.brand.name }]
      : []),
    ...(product.material
      ? [
          {
            label: t("material"),
            value: localized(product.material.name, locale).value,
          },
        ]
      : []),
    ...(ccValues.length
      ? [
          {
            label: t("holeToHole"),
            value: t("mm", { value: ccValues.join(" / ") }),
          },
        ]
      : []),
    ...(lengths.length
      ? [{ label: t("length"), value: t("mm", { value: lengths.join(" / ") }) }]
      : []),
    ...product.specs.map((s) => ({
      label: localized(s.label, locale).value,
      value: localized(s.value, locale).value,
    })),
  ];
  const description = product.description
    ? localized(product.description, locale)
    : null;
  const short = product.shortDescription
    ? localized(product.shortDescription, locale)
    : null;
  const related = relatedProducts(product, products).map(toCardData);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={crumbs} label={common("breadcrumbs")} />

      {product.isSample && (
        <p
          role="note"
          className="mt-6 border-s-4 border-ink bg-surface px-4 py-3 text-sm"
        >
          {t("sampleNotice")}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={title.value} />
        </div>

        <div className="lg:col-span-5">
          {product.brand && (
            <p className="text-sm text-ink-muted">{product.brand.name}</p>
          )}
          <h1
            className="mt-1 text-4xl leading-tight"
            lang={title.isFallback ? "he" : undefined}
          >
            {title.value}
          </h1>
          {short && (
            <p
              className="mt-4 text-lg text-ink-muted"
              lang={short.isFallback ? "he" : undefined}
            >
              {short.value}
            </p>
          )}
          <div className="mt-6 border-t border-line pt-6">
            <Suspense fallback={<ProductPurchaseFallback {...purchaseProps} />}>
              <ProductPurchase {...purchaseProps} />
            </Suspense>
          </div>
          <p className="mt-6 text-sm text-ink-muted">
            {(await getTranslations({ locale, namespace: "catalog" }))(
              "priceNote",
            )}
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
        {specRows.length > 0 && (
          <section aria-labelledby="specs" className="lg:col-span-6">
            <h2 id="specs" className="text-2xl">
              {t("specs")}
            </h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {specRows.map((row) => (
                <div key={row.label} className="grid grid-cols-2 gap-4 py-3">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="tabular">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {description && (
          <section
            aria-labelledby="description"
            className="lg:col-span-5 lg:col-start-8"
          >
            <h2 id="description" className="text-2xl">
              {t("description")}
            </h2>
            <p
              className="mt-4 max-w-prose whitespace-pre-line"
              lang={description.isFallback ? "he" : undefined}
            >
              {description.value}
            </p>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section
          aria-labelledby="related"
          className="mt-16 border-t border-line pt-12"
        >
          <h2 id="related" className="text-2xl">
            {t("related")}
          </h2>
          <div className="mt-8">
            <ProductGrid cards={related} />
          </div>
        </section>
      )}
    </div>
  );
}
