import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DimensionDrawing } from "@/components/brand/DimensionDrawing";
import { buttonClass } from "@/components/ui/button";
import { categoryPath } from "@/features/catalog/category-tree";
import {
  getCategoryTree,
  getProducts,
  productsInCategory,
} from "@/features/catalog/data";
import { sortCards, toCardData } from "@/features/catalog/listing";
import { ProductGrid } from "@/features/catalog/ui/ProductCard";
import {
  formatFileSize,
  getBrands,
  getCatalogFiles,
  getHomeContent,
  getProjects,
} from "@/features/content/data";
import { ProjectCard } from "@/features/content/ProjectCard";
import { StoreVisit } from "@/features/store-info/StoreVisit";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import sanityImageLoader from "@/lib/sanity/image-loader";
import { pagePaths } from "@/lib/routes";
import { getSiteSettings } from "@/lib/site/settings";
import { HeroVideo } from "./HeroVideo";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const sectionTitle = "font-display text-3xl sm:text-4xl";
const moreLink =
  "inline-flex min-h-11 items-center underline underline-offset-4 hover:text-brass-ink";

export async function HomePage({ locale }: { locale: Locale }) {
  const [
    t,
    catalogT,
    projectsT,
    catalogsT,
    home,
    settings,
    tree,
    products,
    brands,
    projects,
    catalogFiles,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "projects" }),
    getTranslations({ locale, namespace: "catalogs" }),
    getHomeContent(),
    getSiteSettings(),
    getCategoryTree(),
    getProducts(),
    getBrands(),
    getProjects(),
    getCatalogFiles(),
  ]);

  const headline = home.headline
    ? localized(home.headline, locale)
    : { value: t("tagline"), isFallback: false };
  const intro = home.intro
    ? localized(home.intro, locale)
    : { value: t("intro"), isFallback: false };

  const picked = home.featuredProductIds.length
    ? home.featuredProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p) => p !== undefined)
    : products.filter((p) => p.isNew || p.featured);
  const featuredCards = sortCards(
    picked.map(toCardData),
    "newest",
    locale,
  ).slice(0, 8);
  const shownBrands = home.brandIds.length
    ? home.brandIds
        .map((id) => brands.find((b) => b.id === id))
        .filter((b) => b !== undefined)
    : brands;

  return (
    <>
      {/* Hero: the words lead; the media sits below them (no text over video). */}
      <section aria-labelledby="hero-title">
        <div
          className={`${container} grid gap-6 pt-12 pb-10 sm:pt-16 lg:grid-cols-12 lg:items-end lg:pb-14`}
        >
          <h1
            id="hero-title"
            className="text-5xl leading-[1.05] sm:text-6xl lg:col-span-7 lg:text-7xl"
            lang={headline.isFallback ? "he" : undefined}
          >
            {headline.value}
          </h1>
          <div className="lg:col-span-5">
            <p
              className="max-w-prose text-lg text-ink-muted"
              lang={intro.isFallback ? "he" : undefined}
            >
              {intro.value}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={localeHref(locale, pagePaths.catalog)}
                className={buttonClass("solid")}
              >
                {t("toCatalog")}
              </Link>
              <Link
                href={localeHref(locale, pagePaths.visit)}
                className={buttonClass("outline")}
              >
                {t("visitCta")}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface sm:aspect-[21/9]">
          {home.video ? (
            <HeroVideo
              src={home.video.src}
              type={home.video.type}
              mobileSrc={home.videoMobile?.src ?? null}
              mobileType={home.videoMobile?.type ?? null}
              poster={
                home.poster
                  ? sanityImageLoader({ src: home.poster.src, width: 1600 })
                  : null
              }
            />
          ) : home.poster ? (
            <Image
              src={home.poster.src}
              alt={localized(home.poster.alt, locale).value}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: home.poster.objectPosition }}
            />
          ) : (
            <div className="flex size-full items-center justify-center p-8">
              <DimensionDrawing className="w-full max-w-3xl" />
            </div>
          )}
        </div>
      </section>

      {/* Two audiences */}
      <section
        className={`${container} grid gap-10 py-16 sm:py-20 md:grid-cols-2 md:gap-0`}
      >
        <div className="md:border-e md:border-line md:pe-10">
          <h2 className="font-display text-2xl sm:text-3xl">
            {t("privateTitle")}
          </h2>
          <p className="mt-3 max-w-prose text-ink-muted">{t("privateBody")}</p>
          <Link
            href={localeHref(locale, pagePaths.catalog)}
            className={`${moreLink} mt-3`}
          >
            {t("toCatalog")}
          </Link>
        </div>
        <div className="md:ps-10">
          <h2 className="font-display text-2xl sm:text-3xl">{t("proTitle")}</h2>
          <p className="mt-3 max-w-prose text-ink-muted">{t("proBody")}</p>
          <Link
            href={localeHref(locale, pagePaths.professionals)}
            className={`${moreLink} mt-3`}
          >
            {t("proCta")}
          </Link>
        </div>
      </section>

      {/* Categories: a typographic index rather than identical cards */}
      <section
        aria-labelledby="home-categories"
        className={`${container} border-t border-line py-16`}
      >
        <h2 id="home-categories" className={sectionTitle}>
          {t("categoriesTitle")}
        </h2>
        <ul className="mt-8 grid border-t border-line md:grid-cols-2 md:gap-x-10">
          {tree.map((category) => {
            const count = productsInCategory(products, category).length;
            const name = localized(category.name, locale);
            return (
              <li key={category.id} className="border-b border-line">
                <Link
                  href={localeHref(locale, categoryPath(category.slug))}
                  className="group flex min-h-20 items-baseline justify-between gap-4 py-5"
                >
                  <span>
                    <span
                      className="block font-display text-2xl group-hover:text-brass-ink"
                      lang={name.isFallback ? "he" : undefined}
                    >
                      {name.value}
                    </span>
                    {category.children && (
                      <span className="mt-1 block text-sm text-ink-muted">
                        {category.children
                          .map((c) => localized(c.name, locale).value)
                          .join(", ")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-sm text-ink-muted tabular">
                    {t("productsCount", { count })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {featuredCards.length > 0 && (
        <section aria-labelledby="home-new" className={`${container} py-16`}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="home-new" className={sectionTitle}>
              {t("newTitle")}
            </h2>
            <Link
              href={localeHref(locale, pagePaths.catalog)}
              className={moreLink}
            >
              {t("allProducts")}
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid cards={featuredCards} />
          </div>
        </section>
      )}

      {/* Measuring guide teaser */}
      <section aria-labelledby="home-measure" className="bg-surface">
        <div
          className={`${container} grid items-center gap-8 py-14 lg:grid-cols-12`}
        >
          <div className="lg:col-span-6">
            <h2 id="home-measure" className="font-display text-2xl sm:text-3xl">
              {t("measureTitle")}
            </h2>
            <p className="mt-3 max-w-prose text-ink-muted">
              {t("measureBody")}
            </p>
            <Link
              href={localeHref(locale, pagePaths.measuringGuide)}
              className={buttonClass("solid", "md", "mt-6")}
            >
              {t("measureCta")}
            </Link>
          </div>
          <DimensionDrawing className="w-full max-w-xl lg:col-span-6" />
        </div>
      </section>

      {projects.length > 0 && (
        <section
          aria-labelledby="home-projects"
          className={`${container} py-16`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="home-projects" className={sectionTitle}>
              {t("projectsTitle")}
            </h2>
            <Link
              href={localeHref(locale, pagePaths.projects)}
              className={moreLink}
            >
              {t("allProjects")}
            </Link>
          </div>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  locale={locale}
                  sampleLabel={projectsT("sample")}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {shownBrands.length > 0 && (
        <section
          aria-labelledby="home-brands"
          className={`${container} border-t border-line py-12`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="home-brands" className="font-display text-2xl">
              {t("brandsTitle")}
            </h2>
            <Link
              href={localeHref(locale, pagePaths.brands)}
              className={moreLink}
            >
              {t("allBrands")}
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
            {shownBrands.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={localeHref(locale, `/brands/${brand.slug}`)}
                  className="inline-flex min-h-11 items-center"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo.src}
                      alt={brand.name}
                      width={140}
                      height={48}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-display text-xl">{brand.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {catalogFiles.length > 0 && (
        <section
          aria-labelledby="home-catalogs"
          className={`${container} border-t border-line py-12`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="home-catalogs" className="font-display text-2xl">
              {t("catalogsTitle")}
            </h2>
            <Link
              href={localeHref(locale, pagePaths.catalogs)}
              className={moreLink}
            >
              {t("allCatalogs")}
            </Link>
          </div>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {catalogFiles.slice(0, 3).map((file) => {
              const title = localized(file.title, locale).value;
              return (
                <li key={file.id}>
                  <a
                    href={`${file.url}?dl=`}
                    className="flex min-h-12 items-center justify-between gap-4 py-3 hover:underline"
                  >
                    <span>{title}</span>
                    <span className="shrink-0 text-sm text-ink-muted">
                      {catalogsT("fileInfo", {
                        size: file.size
                          ? formatFileSize(file.size, locale)
                          : "",
                      })}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="home-visit"
        className={`${container} border-t border-line py-16`}
      >
        <h2 id="home-visit" className={sectionTitle}>
          {t("visitTitle")}
        </h2>
        <div className="mt-8">
          <StoreVisit locale={locale} settings={settings} headingLevel={3} />
        </div>
      </section>

      <p className={`${container} text-sm text-ink-muted`}>
        {catalogT("priceNote")}
      </p>
    </>
  );
}
