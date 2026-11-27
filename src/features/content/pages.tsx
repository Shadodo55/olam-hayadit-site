import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DimensionDrawing } from "@/components/brand/DimensionDrawing";
import { RichText } from "@/components/content/RichText";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClass } from "@/components/ui/button";
import { getProducts } from "@/features/catalog/data";
import { sortCards, toCardData } from "@/features/catalog/listing";
import { ProductGallery } from "@/features/catalog/ui/ProductGallery";
import { ProductGrid } from "@/features/catalog/ui/ProductCard";
import { StoreVisit } from "@/features/store-info/StoreVisit";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { IntlProvider } from "@/lib/i18n/IntlProvider";
import { clientMessagesWith, messagesFor } from "@/lib/i18n/messages";
import { pagePaths, type PageKey } from "@/lib/routes";
import { JsonLd, storeJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSiteSettings, whatsappUrl } from "@/lib/site/settings";
import {
  formatFileSize,
  getBrands,
  getCatalogFiles,
  getFaqs,
  getPage,
  getProjects,
} from "./data";
import { ProjectCard } from "./ProjectCard";

const container = "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8";

/** Metadata for a fixed page: its title from the messages, canonical, hreflang. */
export function staticPageMetadata(locale: Locale, key: PageKey): Metadata {
  const messages = messagesFor(locale);
  return pageMetadata(
    locale,
    pagePaths[key],
    messages.pages[key],
    messages.meta.pages[key],
  );
}

/* ---------- visit the store ---------- */

export async function VisitPage({ locale }: { locale: Locale }) {
  const [pages, t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "visit" }),
    getSiteSettings(),
  ]);
  return (
    <div className={container}>
      <JsonLd data={storeJsonLd(settings, locale)} />
      <PageHeader locale={locale} title={pages("visit")} intro={t("intro")} />
      <div className="mt-10">
        <StoreVisit locale={locale} settings={settings} showParking />
      </div>
    </div>
  );
}

/* ---------- measuring guide ---------- */

const COMMON_SIZES = [64, 96, 128, 160, 192, 224, 256, 320];

export async function MeasuringGuidePage({ locale }: { locale: Locale }) {
  const [pages, t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "guide" }),
    getSiteSettings(),
  ]);
  const whatsapp = whatsappUrl(settings.whatsapp);
  const steps = [
    { title: t("step1Title"), body: t("step1") },
    { title: t("step2Title"), body: t("step2") },
    { title: t("step3Title"), body: t("step3") },
  ];
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={pages("measuringGuide")}
        intro={t("intro")}
      />

      <figure className="mt-10 border border-line bg-surface p-6 sm:p-10">
        <DimensionDrawing
          mm={128}
          title={t("diagramLabel")}
          className="mx-auto w-full max-w-2xl"
        />
      </figure>

      <section aria-labelledby="steps" className="mt-14">
        <h2 id="steps" className="text-3xl">
          {t("stepsTitle")}
        </h2>
        {/* A real sequence, so numbered steps are appropriate here. */}
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ink pt-4">
              <span
                className="font-display text-3xl text-accent-ink tabular"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="mt-2 text-xl">{step.title}</h3>
              <p className="mt-2 text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="common-sizes" className="mt-14">
        <h2 id="common-sizes" className="text-3xl">
          {t("commonTitle")}
        </h2>
        <p className="mt-3 max-w-prose text-ink-muted">{t("commonBody")}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {COMMON_SIZES.map((mm) => (
            <li key={mm}>
              <Link
                href={`${localeHref(locale, "/catalog/handles")}?cc=${mm}`}
                className="inline-flex min-h-11 items-center rounded-sm border border-line-strong px-4 tabular hover:bg-surface"
              >
                {t("browseBy", { mm })}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <aside
        aria-labelledby="tip"
        className="mt-14 max-w-prose border-s-4 border-accent ps-5"
      >
        <h2 id="tip" className="text-xl">
          {t("tipTitle")}
        </h2>
        <p className="mt-2">{t("tip")}</p>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("outline", "md", "mt-4")}
          >
            {(await getTranslations({ locale, namespace: "header" }))(
              "whatsapp",
            )}
            <span className="sr-only">
              {" "}
              {(await getTranslations({ locale, namespace: "common" }))(
                "opensInNewTab",
              )}
            </span>
          </a>
        )}
      </aside>
    </div>
  );
}

/* ---------- CMS page (about; legal pages in phase 7) ---------- */

export async function cmsPageMetadata(
  locale: Locale,
  slug: string,
  key: PageKey,
): Promise<Metadata> {
  const page = await getPage(slug);
  const title = page
    ? localized(page.title, locale).value
    : messagesFor(locale).pages[key];
  return pageMetadata(
    locale,
    pagePaths[key],
    title,
    messagesFor(locale).meta.pages[key],
  );
}

export async function CmsPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const page = await getPage(slug);
  if (!page) notFound();
  const extra = await getTranslations({ locale, namespace: "pagesExtra" });
  const title = localized(page.title, locale);
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={title.value}
        titleLang={title.isFallback ? "he" : undefined}
      />
      {page.legalDraft && (
        <p
          role="note"
          className="mt-6 max-w-prose border-s-4 border-ink bg-surface px-4 py-3"
        >
          {extra("draftNotice")}
        </p>
      )}
      <div className="mt-8">
        <RichText value={page.body} locale={locale} />
      </div>
      {page.lastReviewed && (
        <p className="mt-10 text-sm text-ink-muted">
          {extra("lastReviewed", {
            date: new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
              dateStyle: "long",
            }).format(new Date(`${page.lastReviewed}T00:00:00Z`)),
          })}
        </p>
      )}
    </div>
  );
}

/* ---------- FAQ ---------- */

export async function FaqPage({ locale }: { locale: Locale }) {
  const [pages, t, faqs] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "faq" }),
    getFaqs(),
  ]);
  return (
    <div className={container}>
      <PageHeader locale={locale} title={pages("faq")} intro={t("intro")} />
      {faqs.length === 0 ? (
        <p className="mt-8">{t("empty")}</p>
      ) : (
        <div className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {faqs.map((faq) => {
            const q = localized(faq.question, locale);
            const a = localized(faq.answer, locale);
            return (
              <details key={faq.id} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  <span lang={q.isFallback ? "he" : undefined}>{q.value}</span>
                  <span
                    aria-hidden="true"
                    className="text-2xl leading-none text-ink-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p
                  className="max-w-prose pb-5 text-ink-muted"
                  lang={a.isFallback ? "he" : undefined}
                >
                  {a.value}
                </p>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- brands ---------- */

export async function BrandsPage({ locale }: { locale: Locale }) {
  const [pages, t, brands, products] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "brands" }),
    getBrands(),
    getProducts(),
  ]);
  return (
    <div className={container}>
      <PageHeader locale={locale} title={pages("brands")} intro={t("intro")} />
      {brands.length === 0 ? (
        <p className="mt-8">{t("empty")}</p>
      ) : (
        <ul className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {brands.map((brand) => {
            const count = products.filter(
              (p) => p.brand?.id === brand.id,
            ).length;
            return (
              <li key={brand.id} className="border-b border-line">
                <Link
                  href={localeHref(locale, `/brands/${brand.slug}`)}
                  className="group flex min-h-20 items-center justify-between gap-4 py-4"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo.src}
                      alt={brand.name}
                      width={160}
                      height={56}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-display text-2xl group-hover:text-accent-ink">
                      {brand.name}
                    </span>
                  )}
                  <span className="flex shrink-0 items-center gap-2 text-sm text-ink-muted tabular">
                    {brand.isSample && (
                      <span className="bg-ink px-1.5 py-0.5 text-xs text-paper">
                        {t("sample")}
                      </span>
                    )}
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export async function brandStaticParams() {
  const brands = await getBrands();
  // Static export needs at least one path; "_none" renders a 404.
  return brands.length
    ? brands.map((b) => ({ slug: b.slug }))
    : [{ slug: "_none" }];
}

export async function brandMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const brand = (await getBrands()).find((b) => b.slug === slug);
  return brand
    ? pageMetadata(
        locale,
        `/brands/${slug}`,
        brand.name,
        messagesFor(locale).meta.brandDescription.replace("{name}", brand.name),
      )
    : {};
}

export async function BrandPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const [pages, t, brands, products] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "brands" }),
    getBrands(),
    getProducts(),
  ]);
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();
  const cards = sortCards(
    products.filter((p) => p.brand?.id === brand.id).map(toCardData),
    "newest",
    locale,
  );
  const description = brand.description
    ? localized(brand.description, locale)
    : null;
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={brand.name}
        trail={[
          {
            label: pages("brands"),
            href: localeHref(locale, pagePaths.brands),
          },
        ]}
        {...(description ? { intro: description.value } : {})}
      >
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {t("website")}
            <span className="sr-only">
              {" "}
              {(await getTranslations({ locale, namespace: "common" }))(
                "opensInNewTab",
              )}
            </span>
          </a>
        )}
      </PageHeader>
      <section aria-labelledby="brand-products" className="mt-12">
        <h2 id="brand-products" className="text-2xl">
          {t("productsTitle", { brand: brand.name })}
        </h2>
        <div className="mt-8">
          {cards.length ? (
            <ProductGrid cards={cards} />
          ) : (
            <p>{t("noProducts")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- projects ---------- */

export async function ProjectsPage({ locale }: { locale: Locale }) {
  const [pages, t, projects] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "projects" }),
    getProjects(),
  ]);
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={pages("projects")}
        intro={t("intro")}
      />
      {projects.length === 0 ? (
        <p className="mt-8">{t("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                locale={locale}
                sampleLabel={t("sample")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function projectStaticParams() {
  const projects = await getProjects();
  return projects.length
    ? projects.map((p) => ({ slug: p.slug }))
    : [{ slug: "_none" }];
}

export async function projectMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const project = (await getProjects()).find((p) => p.slug === slug);
  return project
    ? pageMetadata(
        locale,
        `/projects/${slug}`,
        localized(project.title, locale).value,
        messagesFor(locale).meta.projectDescription.replace(
          "{name}",
          localized(project.title, locale).value,
        ),
      )
    : {};
}

export async function ProjectPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const [pages, t, projects, products] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "projects" }),
    getProjects(),
    getProducts(),
  ]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const title = localized(project.title, locale);
  const description = project.description
    ? localized(project.description, locale)
    : null;
  const images = [project.cover, ...project.gallery].filter((i) => i !== null);
  const cards = project.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .map(toCardData);
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={title.value}
        titleLang={title.isFallback ? "he" : undefined}
        trail={[
          {
            label: pages("projects"),
            href: localeHref(locale, pagePaths.projects),
          },
        ]}
        {...(description ? { intro: description.value } : {})}
      />
      <div className="mt-10 max-w-4xl">
        <IntlProvider
          locale={locale}
          messages={clientMessagesWith(locale, ["product"])}
          timeZone="Asia/Jerusalem"
        >
          <ProductGallery images={images} name={title.value} />
        </IntlProvider>
      </div>
      {cards.length > 0 && (
        <section aria-labelledby="project-products" className="mt-14">
          <h2 id="project-products" className="text-2xl">
            {t("productsTitle")}
          </h2>
          <div className="mt-8">
            <ProductGrid cards={cards} />
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- catalogs (PDF) ---------- */

export async function CatalogsPage({ locale }: { locale: Locale }) {
  const [pages, t, files] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "catalogs" }),
    getCatalogFiles(),
  ]);
  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={pages("catalogs")}
        intro={t("intro")}
      />
      {files.length === 0 ? (
        <p className="mt-8">{t("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const title = localized(file.title, locale);
            const size = file.size ? formatFileSize(file.size, locale) : "";
            const language = t(`language_${file.language}`);
            return (
              <li key={file.id} className="flex flex-col border border-line">
                <div className="relative aspect-[4/3] bg-surface">
                  {file.cover && (
                    <Image
                      src={file.cover.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-contain"
                    />
                  )}
                  {file.isSample && (
                    <span className="absolute start-2 top-2 bg-ink px-2 py-0.5 text-xs font-semibold text-paper">
                      {t("sample")}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2
                    className="font-display text-xl"
                    lang={title.isFallback ? "he" : undefined}
                  >
                    {title.value}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t("fileInfo", { size })}
                    {language && ` ${language}`}
                  </p>
                  <a
                    href={`${file.url}?dl=`}
                    className={buttonClass(
                      "outline",
                      "md",
                      "mt-auto self-start",
                    )}
                    download
                  >
                    {t("download")}
                    <span className="sr-only">
                      {" "}
                      {title.value} ({t("fileInfo", { size })})
                    </span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
