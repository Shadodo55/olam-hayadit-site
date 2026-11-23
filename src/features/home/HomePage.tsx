import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DimensionDrawing } from "@/components/brand/DimensionDrawing";
import { buttonClass } from "@/components/ui/button";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";
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
/** Lines a full-bleed block's text up with the centred container. */
const alignStart =
  "px-4 sm:px-6 lg:ps-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pe-12";
const moreLink =
  "inline-flex min-h-11 items-center font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink";

/**
 * Category tiles fill whole rows: 2 per row on phones and 3 on desktop
 * (6-column grid), with the first tiles widened when the count doesn't divide.
 */
function tileSpan(index: number, count: number) {
  const fullOnPhone = count % 2 === 1 && index === 0;
  const rest = count % 3;
  const half = rest === 2 && index < 2;
  const full = rest === 1 && index === 0;
  return {
    item: [
      fullOnPhone ? "col-span-2" : "",
      full ? "lg:col-span-6" : half ? "lg:col-span-3" : "lg:col-span-2",
    ].join(" "),
    image: [
      fullOnPhone ? "aspect-[16/9]" : "aspect-[4/3]",
      full ? "lg:aspect-[3/1]" : half ? "lg:aspect-[16/9]" : "lg:aspect-[4/3]",
    ].join(" "),
  };
}

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
  const slogan = settings.slogan ? localized(settings.slogan, locale) : null;
  const services = settings.services.map((s) => localized(s, locale));
  const phones = [
    { label: t("phoneStore"), phone: settings.phones.store },
    { label: t("phoneMobile"), phone: settings.phones.mobile },
  ].flatMap(({ label, phone }) => (phone ? [{ label, phone }] : []));

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
      {/* Hero: a colour block with the words beside (or above) the media,
          never text over the video. */}
      <section aria-labelledby="hero-title" className="grid lg:grid-cols-2">
        <div
          className={`${alignStart} flex flex-col items-start justify-center bg-accent py-12 text-on-accent sm:py-16 lg:py-20`}
        >
          {slogan && (
            <p
              className="mb-6 -rotate-1 rounded-sm bg-highlight px-3 py-1 font-display text-lg font-bold text-on-highlight sm:text-xl"
              lang={slogan.isFallback ? "he" : undefined}
            >
              {slogan.value}
            </p>
          )}
          <h1
            id="hero-title"
            className="text-5xl leading-[1.02] sm:text-6xl xl:text-7xl"
            lang={headline.isFallback ? "he" : undefined}
          >
            {headline.value}
          </h1>
          <p
            className="mt-5 max-w-xl text-lg"
            lang={intro.isFallback ? "he" : undefined}
          >
            {intro.value}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={localeHref(locale, pagePaths.catalog)}
              className={buttonClass("onAccent")}
            >
              {t("toCatalog")}
            </Link>
            <Link
              href={localeHref(locale, pagePaths.visit)}
              className={buttonClass("outlineOnAccent")}
            >
              {t("visitCta")}
            </Link>
          </div>
          {phones.length > 0 && (
            <ul
              aria-label={t("callTitle")}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-1"
            >
              {phones.map(({ label, phone }) => (
                <li key={label}>
                  <a
                    href={`tel:${phone.e164}`}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold underline-offset-4 hover:underline"
                  >
                    <PhoneIcon />
                    {label} <span dir="ltr">{phone.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden bg-surface lg:aspect-auto lg:min-h-[36rem]">
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
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: home.poster.objectPosition }}
            />
          ) : (
            <div className="flex size-full items-center justify-center p-8">
              <DimensionDrawing className="w-full max-w-2xl" />
            </div>
          )}
        </div>
      </section>

      {/* Services, as on the store's sign */}
      {services.length > 0 && (
        <div className="on-dark bg-band text-on-band">
          <ul
            aria-label={t("servicesTitle")}
            className={`${container} flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-5 lg:justify-between`}
          >
            {services.map((service) => (
              <li
                key={service.value}
                className="inline-flex items-center gap-2 font-display text-lg font-bold"
                lang={service.isFallback ? "he" : undefined}
              >
                <CheckIcon className="shrink-0 text-accent-on-band" />
                {service.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Two audiences: home owners on a light panel, professionals on a dark one */}
      <section
        className={`${container} grid gap-4 pt-16 sm:pt-20 md:grid-cols-2 md:gap-6`}
      >
        <div className="flex flex-col items-start rounded-sm bg-surface p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl">{t("privateTitle")}</h2>
          <p className="mt-3 mb-6 max-w-prose text-ink-muted">
            {t("privateBody")}
          </p>
          <Link
            href={localeHref(locale, pagePaths.catalog)}
            className={buttonClass("solid", "md", "mt-auto")}
          >
            {t("toCatalog")}
          </Link>
        </div>
        <div className="on-dark flex flex-col items-start rounded-sm bg-band p-8 text-on-band sm:p-10">
          <h2 className="text-2xl sm:text-3xl">{t("proTitle")}</h2>
          <p className="mt-3 mb-6 max-w-prose text-on-band/85">
            {t("proBody")}
          </p>
          <Link
            href={localeHref(locale, pagePaths.professionals)}
            className={buttonClass("onDark", "md", "mt-auto")}
          >
            {t("proCta")}
          </Link>
        </div>
      </section>

      {/* Categories: picture tiles (category image, else a product photo) */}
      <section
        aria-labelledby="home-categories"
        className={`${container} py-16 sm:py-20`}
      >
        <h2 id="home-categories" className="section-title">
          {t("categoriesTitle")}
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-6">
          {tree.map((category, index) => {
            const inCategory = productsInCategory(products, category);
            const image =
              category.image ??
              inCategory.find((p) => p.images[0])?.images[0] ??
              null;
            const name = localized(category.name, locale);
            const wide = tileSpan(index, tree.length);
            return (
              <li key={category.id} className={wide.item}>
                <Link
                  href={localeHref(locale, categoryPath(category.slug))}
                  className="group flex h-full flex-col overflow-hidden rounded-sm border border-line hover:border-accent"
                >
                  <span
                    className={`relative block overflow-hidden bg-surface ${wide.image}`}
                  >
                    {image ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{ objectPosition: image.objectPosition }}
                      />
                    ) : (
                      <DimensionDrawing className="absolute inset-0 m-auto w-3/4" />
                    )}
                  </span>
                  <span className="flex flex-1 flex-col gap-1 border-t-4 border-accent p-4">
                    <span
                      className="font-display text-xl font-bold sm:text-2xl"
                      lang={name.isFallback ? "he" : undefined}
                    >
                      {name.value}
                    </span>
                    <span className="text-sm text-ink-muted tabular">
                      {t("productsCount", { count: inCategory.length })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {featuredCards.length > 0 && (
        <section aria-labelledby="home-new" className={`${container} pb-16`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="home-new" className="section-title">
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
            <h2 id="home-measure" className="section-title">
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="home-projects" className="section-title">
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="home-brands" className="section-title">
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
                    <span className="font-display text-xl font-bold">
                      {brand.name}
                    </span>
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="home-catalogs" className="section-title">
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
        <h2 id="home-visit" className="section-title">
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
