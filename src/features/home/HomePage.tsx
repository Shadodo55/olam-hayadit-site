import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DimensionDrawing } from "@/components/brand/DimensionDrawing";
import { buttonClass } from "@/components/ui/button";
import {
  ArrowIcon,
  ChatIcon,
  CheckIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/ui/icons";
import { categoryPath, type Category } from "@/features/catalog/category-tree";
import {
  getCategoryTree,
  getProducts,
  productsInCategory,
} from "@/features/catalog/data";
import { sortCards, toCardData } from "@/features/catalog/listing";
import type { Product } from "@/features/catalog/product";
import { ProductGrid } from "@/features/catalog/ui/ProductCard";
import {
  formatFileSize,
  getBrands,
  getCatalogFiles,
  getHomeContent,
  getProjects,
} from "@/features/content/data";
import { ProjectCard } from "@/features/content/ProjectCard";
import { OpenStatus } from "@/features/store-info/OpenStatus";
import { StoreVisit } from "@/features/store-info/StoreVisit";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import sanityImageLoader from "@/lib/sanity/image-loader";
import { pagePaths } from "@/lib/routes";
import {
  formatAddress,
  getSiteSettings,
  wazeUrl,
  whatsappUrl,
} from "@/lib/site/settings";
import { HeroVideo } from "./HeroVideo";
import { ServicesMarquee } from "./ServicesMarquee";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const moreLink =
  "inline-flex min-h-11 items-center font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink";

/**
 * Category tiles. With 5, 9, 13… categories the first one is a large tile
 * (2×2) beside the others ("bento"); otherwise all tiles are equal. Either way
 * the rows are always full, on phones (2 columns) and desktop.
 */
function tileLayout(index: number, count: number) {
  const bento = count >= 5 && (count - 5) % 4 === 0;
  const fullOnPhone = count % 2 === 1 && index === 0;
  const phoneImage = fullOnPhone ? "aspect-[16/9]" : "aspect-[4/3]";
  if (bento) {
    const big = index === 0;
    return {
      grid: "lg:grid-cols-4",
      item: `${fullOnPhone ? "col-span-2" : ""} ${big ? "lg:col-span-2 lg:row-span-2" : "lg:col-span-1"}`,
      image: `${phoneImage} ${big ? "lg:aspect-auto lg:min-h-80 lg:flex-1" : "lg:aspect-[4/3]"}`,
    };
  }
  const rest = count % 3;
  const half = rest === 2 && index < 2;
  const full = rest === 1 && index === 0;
  return {
    grid: "lg:grid-cols-6",
    item: `${fullOnPhone ? "col-span-2" : ""} ${full ? "lg:col-span-6" : half ? "lg:col-span-3" : "lg:col-span-2"}`,
    image: `${phoneImage} ${full ? "lg:aspect-[3/1]" : half ? "lg:aspect-[16/9]" : "lg:aspect-[4/3]"}`,
  };
}

function tileImage(category: Category, inCategory: readonly Product[]) {
  return (
    category.image ?? inCategory.find((p) => p.images[0])?.images[0] ?? null
  );
}

export async function HomePage({ locale }: { locale: Locale }) {
  const [
    t,
    catalogT,
    projectsT,
    catalogsT,
    header,
    common,
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
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "common" }),
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
  const address = formatAddress(settings, locale);
  const proPhone = settings.phones.mobile ?? settings.phones.store;
  const whatsapp = whatsappUrl(settings.whatsapp);

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

  const order = (i: number) => ({ "--i": i }) as CSSProperties;
  const words = headline.value.split(" ");
  const years = settings.yearsExperience;
  const trust = [
    { title: t("familyTitle"), body: t("familyBody") },
    { title: t("showroomTitle"), body: t("showroomBody") },
    { title: t("stockTitle"), body: t("stockBody") },
  ];
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;
  const newTab = <span className="sr-only"> {common("opensInNewTab")}</span>;
  const steps = [
    {
      title: t("how1Title"),
      body: t("how1Body"),
      action: (
        <Link
          href={localeHref(locale, pagePaths.catalog)}
          className={buttonClass("outline", "sm", "mt-5 bg-paper")}
        >
          {t("how1Cta")}
        </Link>
      ),
    },
    {
      title: t("how2Title"),
      body: t("how2Body"),
      action: whatsapp && (
        <a
          href={whatsapp}
          {...external}
          className={buttonClass("solid", "sm", "mt-5")}
        >
          <ChatIcon />
          {t("how2Cta")}
          {newTab}
        </a>
      ),
    },
    {
      title: t("how3Title"),
      body: t("how3Body"),
      action: (
        <a
          href={wazeUrl(settings)}
          {...external}
          className={buttonClass("outline", "sm", "mt-5 bg-paper")}
        >
          <PinIcon />
          {t("how3Cta")}
          {newTab}
        </a>
      ),
    },
  ];

  return (
    <>
      {/* Hero: full-width media; the words sit on a solid panel that overlaps
          its lower edge on desktop (never text over the video itself). The
          panel's content rises in on load; the picture drifts on scroll. */}
      <section aria-labelledby="hero-title">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface sm:aspect-[16/9] lg:aspect-auto lg:h-[min(80vh,48rem)]">
          {home.video ? (
            <HeroVideo
              src={home.video.src}
              type={home.video.type}
              mobileSrc={home.videoMobile?.src ?? null}
              mobileType={home.videoMobile?.type ?? null}
              mediaClassName="parallax"
              poster={
                home.poster
                  ? sanityImageLoader({ src: home.poster.src, width: 1920 })
                  : null
              }
            />
          ) : home.poster ? (
            <div className="parallax absolute inset-0">
              <div className="ken-burns absolute inset-0">
                <Image
                  src={home.poster.src}
                  alt={localized(home.poster.alt, locale).value}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: home.poster.objectPosition }}
                />
              </div>
            </div>
          ) : (
            <div className="flex size-full items-center justify-center p-8">
              <DimensionDrawing className="w-full max-w-3xl" />
            </div>
          )}
        </div>

        <div
          className={`${container} relative lg:grid lg:grid-cols-12 lg:gap-12`}
        >
          <div className="on-dark -mx-4 bg-band px-6 py-10 text-on-band sm:-mx-6 sm:px-10 sm:py-12 lg:relative lg:z-10 lg:col-span-7 lg:mx-0 lg:-mt-72 lg:px-12 lg:py-14 xl:col-span-6">
            <p
              className="rise inline-flex items-center gap-2 rounded-full border border-on-band/25 px-3 py-1.5 text-sm"
              style={order(0)}
            >
              <OpenStatus
                hours={settings.hours}
                specialDays={settings.specialDays}
              />
            </p>
            {slogan && (
              <p
                className="rise mt-6 flex items-center gap-3 font-display text-lg font-medium text-accent-on-band"
                style={order(1)}
                lang={slogan.isFallback ? "he" : undefined}
              >
                <span
                  aria-hidden="true"
                  className="grow-line h-px w-10 shrink-0 bg-accent-on-band"
                />
                {slogan.value}
              </p>
            )}
            <h1
              id="hero-title"
              className="mt-5 text-5xl leading-[1.05] sm:text-6xl xl:text-[4.25rem]"
              lang={headline.isFallback ? "he" : undefined}
            >
              {words.map((word, index) => (
                <Fragment key={index}>
                  <span className="mask-word">
                    <span style={order(index + 2)}>{word}</span>
                  </span>
                  {index < words.length - 1 && " "}
                </Fragment>
              ))}
            </h1>
            <p
              className="rise mt-6 max-w-xl text-lg text-on-band/85"
              style={order(words.length + 2)}
              lang={intro.isFallback ? "he" : undefined}
            >
              {intro.value}
            </p>
            <div
              className="rise mt-8 flex flex-wrap gap-3"
              style={order(words.length + 3)}
            >
              <Link
                href={localeHref(locale, pagePaths.catalog)}
                className={buttonClass("highlight")}
              >
                {t("toCatalog")}
              </Link>
              {whatsapp && (
                <a
                  href={whatsapp}
                  {...external}
                  className={buttonClass("onDark")}
                >
                  <ChatIcon />
                  {t("whatsappCta")}
                  {newTab}
                </a>
              )}
            </div>
            {address && (
              <p
                className="rise mt-8 border-t border-on-band/15 pt-6"
                style={order(words.length + 4)}
              >
                <Link
                  href={localeHref(locale, pagePaths.visit)}
                  className="inline-flex items-start gap-2 text-on-band/85 underline-offset-4 hover:text-on-band hover:underline"
                >
                  <PinIcon className="mt-0.5 shrink-0 text-accent-on-band" />
                  {address}
                </Link>
              </p>
            )}
          </div>

          {/* Why buy here: confirmed facts only (years come from the CMS). */}
          <ul
            aria-label={t("trustTitle")}
            data-reveal="children"
            className="mt-10 grid grid-cols-2 border-s border-t border-line lg:col-span-5 lg:mt-12 lg:self-start xl:col-span-6"
          >
            {years && (
              <li className="border-e border-b border-line p-5 sm:p-7">
                <p className="display-title text-5xl text-accent-ink sm:text-6xl">
                  <span className="sr-only">{years}+</span>
                  <span aria-hidden="true" dir="ltr">
                    <span
                      className="count-up tabular"
                      style={{ "--to": years } as CSSProperties}
                    />
                    +
                  </span>
                </p>
                <p className="mt-2 font-display text-lg font-medium">
                  {t("yearsLabel")}
                </p>
              </li>
            )}
            {trust.map((item) => (
              <li
                key={item.title}
                className="border-e border-b border-line p-5 sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full border border-accent text-accent-ink"
                >
                  <CheckIcon width={16} height={16} />
                </span>
                <p className="mt-3 font-display text-xl font-medium">
                  {item.title}
                </p>
                <p className="mt-1 text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The sign's services, as a slow band (static with reduced motion) */}
      {services.length > 0 && (
        <div className="mt-16 sm:mt-20">
          <ServicesMarquee
            items={services}
            labels={{
              list: t("servicesTitle"),
              pause: t("marqueePause"),
              play: t("marqueePlay"),
            }}
          />
        </div>
      )}

      {/* Categories */}
      <section
        aria-labelledby="home-categories"
        className={`${container} py-16 sm:py-24`}
      >
        <div
          className="flex flex-wrap items-end justify-between gap-4"
          data-reveal="self"
        >
          <h2 id="home-categories" className="section-title">
            {t("categoriesTitle")}
          </h2>
          <Link
            href={localeHref(locale, pagePaths.catalog)}
            className={moreLink}
          >
            {t("allProducts")}
          </Link>
        </div>
        <ul
          data-reveal="children"
          className={`mt-10 grid grid-cols-2 gap-3 sm:gap-5 ${tileLayout(0, tree.length).grid}`}
        >
          {tree.map((category, index) => {
            const inCategory = productsInCategory(products, category);
            const image = tileImage(category, inCategory);
            const name = localized(category.name, locale);
            const layout = tileLayout(index, tree.length);
            return (
              <li key={category.id} className={`flex ${layout.item}`}>
                <Link
                  href={localeHref(locale, categoryPath(category.slug))}
                  className="group flex w-full flex-col"
                >
                  <span
                    className={`relative block overflow-hidden rounded-sm bg-surface ${layout.image}`}
                  >
                    {image ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 40vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ objectPosition: image.objectPosition }}
                      />
                    ) : (
                      <DimensionDrawing className="absolute inset-0 m-auto w-3/4" />
                    )}
                  </span>
                  <span className="flex flex-col gap-0.5 pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                    <span
                      className="inline-flex items-center gap-2 font-display text-xl font-medium sm:text-2xl"
                      lang={name.isFallback ? "he" : undefined}
                    >
                      {name.value}
                      <ArrowIcon className="text-accent-ink opacity-0 transition duration-300 group-hover:opacity-100 ltr:group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                    </span>
                    <span className="shrink-0 text-sm text-ink-muted tabular">
                      {t("productsCount", { count: inCategory.length })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works: a real sequence, each step with its action */}
      <section aria-labelledby="home-how" className="page-band py-16 sm:py-24">
        <div className={container}>
          <h2 id="home-how" className="section-title" data-reveal="self">
            {t("howTitle")}
          </h2>
          <div className="relative mt-12">
            <span
              aria-hidden="true"
              className="grow-on-view absolute inset-x-0 top-7 hidden h-px bg-accent md:block"
            />
            <ol
              data-reveal="children"
              className="relative grid gap-10 md:grid-cols-3 md:gap-8"
            >
              {steps.map((step, index) => (
                <li key={step.title} className="flex flex-col items-start">
                  <span
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full border-2 border-accent bg-surface display-title text-2xl text-accent-ink"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-ink-muted">{step.body}</p>
                  {step.action}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {featuredCards.length > 0 && (
        <section
          aria-labelledby="home-new"
          className="border-t border-line py-16 sm:py-24"
        >
          <div className={container}>
            <div
              className="flex flex-wrap items-end justify-between gap-4"
              data-reveal="self"
            >
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
            <div className="mt-10">
              <ProductGrid cards={featuredCards} scroller />
            </div>
          </div>
        </section>
      )}

      {/* Professionals: the brand colour as a full-width band */}
      <section aria-labelledby="home-pro" className="bg-accent text-on-accent">
        <div
          className={`${container} grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:items-center`}
        >
          <div className="lg:col-span-7" data-reveal="self">
            <h2 id="home-pro" className="display-title text-4xl sm:text-5xl">
              {t("proTitle")}
            </h2>
            <p className="mt-5 max-w-xl text-lg">{t("proBody")}</p>
            <Link
              href={localeHref(locale, pagePaths.professionals)}
              className={buttonClass("onAccent", "md", "mt-8")}
            >
              {t("proCta")}
            </Link>
          </div>
          {proPhone && (
            <div className="border-on-accent/30 lg:col-span-5 lg:border-s lg:ps-12">
              <p className="text-lg">{t("proPhoneLabel")}</p>
              <a
                href={`tel:${proPhone.e164}`}
                className="mt-2 inline-flex min-h-11 items-center gap-3 display-title text-3xl underline-offset-8 hover:underline sm:text-4xl"
              >
                <PhoneIcon width={28} height={28} />
                <span dir="ltr" className="tabular">
                  {proPhone.display}
                </span>
              </a>
              {whatsapp && (
                <div>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("outlineOnAccent", "md", "mt-6")}
                  >
                    <ChatIcon />
                    {header("whatsapp")}
                    <span className="sr-only"> {common("opensInNewTab")}</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Measuring guide: the technical drawing is the visual */}
      <section
        aria-labelledby="home-measure"
        className="page-band py-16 sm:py-24"
      >
        <div
          className={`${container} grid items-center gap-10 lg:grid-cols-12`}
        >
          <div className="lg:col-span-5" data-reveal="self">
            <h2 id="home-measure" className="section-title">
              {t("measureTitle")}
            </h2>
            <p className="mt-4 max-w-prose text-lg text-ink-muted">
              {t("measureBody")}
            </p>
            <Link
              href={localeHref(locale, pagePaths.measuringGuide)}
              className={buttonClass("solid", "md", "mt-8")}
            >
              {t("measureCta")}
            </Link>
          </div>
          <div className="rounded-sm border border-line bg-paper p-6 sm:p-10 lg:col-span-7">
            <DimensionDrawing className="w-full" />
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section
          aria-labelledby="home-projects"
          className={`${container} border-t border-line py-16 sm:py-24`}
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
          <ul
            data-reveal="children"
            className={`mt-10 grid gap-8 ${projects.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}
          >
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

      {(shownBrands.length > 0 || catalogFiles.length > 0) && (
        <div
          className={`${container} grid gap-14 border-t border-line py-16 lg:grid-cols-2`}
        >
          {shownBrands.length > 0 && (
            <section aria-labelledby="home-brands">
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
              <ul className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
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
                        <span className="font-display text-xl font-medium">
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
            <section aria-labelledby="home-catalogs">
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
              <ul className="mt-8 divide-y divide-line border-y border-line">
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
        </div>
      )}

      <section
        aria-labelledby="home-visit"
        className="border-t border-line pt-16 sm:pt-24"
      >
        <div className={container}>
          <h2 id="home-visit" className="section-title" data-reveal="self">
            {t("visitTitle")}
          </h2>
          <div className="mt-10">
            <StoreVisit locale={locale} settings={settings} headingLevel={3} />
          </div>
          <p className="mt-12 text-sm text-ink-muted">
            {catalogT("priceNote")}
          </p>
        </div>
      </section>
    </>
  );
}
