import type { PortableTextBlock } from "@portabletext/react";
import type { Localized } from "@/lib/i18n/locales";
import { sanityFetch } from "@/lib/sanity/client";
import {
  IMAGE_PROJECTION,
  toSiteImage,
  type RawImage,
  type SiteImage,
} from "@/lib/sanity/image";

/** Content documents (home, pages, FAQ, brands, projects, catalogs): CMS -> domain. */

type Maybe<T> = T | null | undefined;
const hasHe = (v: Maybe<Localized>): v is Localized => Boolean(v?.he?.trim());

/* ---------- home page ---------- */

export interface HomeContent {
  headline: Localized | null;
  intro: Localized | null;
  poster: SiteImage | null;
  video: { src: string; type: string } | null;
  videoMobile: { src: string; type: string } | null;
  featuredProductIds: string[];
  brandIds: string[];
}

interface RawFile {
  url?: Maybe<string>;
  mimeType?: Maybe<string>;
}

const fileOf = (raw: Maybe<RawFile>) =>
  raw?.url ? { src: raw.url, type: raw.mimeType || "video/mp4" } : null;

export async function getHomeContent(): Promise<HomeContent> {
  const raw = await sanityFetch<{
    headline?: Maybe<Localized>;
    intro?: Maybe<Localized>;
    poster?: Maybe<RawImage>;
    video?: Maybe<RawFile>;
    videoMobile?: Maybe<RawFile>;
    featuredProductIds?: Maybe<string[]>;
    brandIds?: Maybe<string[]>;
  } | null>(`*[_id == "homePage"][0]{
    headline, intro,
    "poster": heroPoster ${IMAGE_PROJECTION},
    "video": heroVideo.asset->{url, mimeType},
    "videoMobile": heroVideoMobile.asset->{url, mimeType},
    "featuredProductIds": featuredProducts[]._ref,
    "brandIds": brands[]._ref
  }`);
  return {
    headline: hasHe(raw?.headline) ? raw.headline : null,
    intro: hasHe(raw?.intro) ? raw.intro : null,
    poster: toSiteImage(raw?.poster),
    video: fileOf(raw?.video),
    videoMobile: fileOf(raw?.videoMobile),
    featuredProductIds: raw?.featuredProductIds ?? [],
    brandIds: raw?.brandIds ?? [],
  };
}

/* ---------- pages (about, legal) ---------- */

export interface ContentPage {
  title: Localized;
  body: { he: PortableTextBlock[]; en: PortableTextBlock[] | null };
  legalDraft: boolean;
  lastReviewed: string | null;
}

export async function getPage(slug: string): Promise<ContentPage | null> {
  const raw = await sanityFetch<{
    title?: Maybe<Localized>;
    body?: Maybe<{
      he?: Maybe<PortableTextBlock[]>;
      en?: Maybe<PortableTextBlock[]>;
    }>;
    legalDraft?: Maybe<boolean>;
    lastReviewed?: Maybe<string>;
  } | null>(
    `*[_type == "page" && slug.current == $slug][0]{title, body, legalDraft, lastReviewed}`,
    { slug },
  );
  if (!raw || !hasHe(raw.title) || !raw.body?.he?.length) return null;
  return {
    title: raw.title,
    body: { he: raw.body.he, en: raw.body.en?.length ? raw.body.en : null },
    legalDraft: Boolean(raw.legalDraft),
    lastReviewed: raw.lastReviewed ?? null,
  };
}

/* ---------- FAQ ---------- */

export interface Faq {
  id: string;
  question: Localized;
  answer: Localized;
}

export async function getFaqs(): Promise<Faq[]> {
  const raw = await sanityFetch<
    { _id: string; question?: Maybe<Localized>; answer?: Maybe<Localized> }[]
  >(
    `*[_type == "faq"] | order(order asc, _createdAt asc){_id, question, answer}`,
  );
  return raw
    .filter((f) => hasHe(f.question) && hasHe(f.answer))
    .map((f) => ({ id: f._id, question: f.question!, answer: f.answer! }));
}

/* ---------- brands ---------- */

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: SiteImage | null;
  description: Localized | null;
  website: string | null;
  isSample: boolean;
}

export async function getBrands(): Promise<Brand[]> {
  const raw = await sanityFetch<
    {
      _id: string;
      slug?: Maybe<string>;
      name?: Maybe<string>;
      logo?: Maybe<RawImage>;
      description?: Maybe<Localized>;
      website?: Maybe<string>;
      isSample?: Maybe<boolean>;
    }[]
  >(`*[_type == "brand" && defined(slug.current)] | order(name asc){
    _id, "slug": slug.current, name, "logo": logo ${IMAGE_PROJECTION}, description, website, isSample
  }`);
  return raw
    .filter((b) => b.slug && b.name)
    .map((b) => ({
      id: b._id,
      slug: b.slug!,
      name: b.name!,
      logo: toSiteImage(b.logo),
      description: hasHe(b.description) ? b.description : null,
      website: b.website ?? null,
      isSample: Boolean(b.isSample),
    }));
}

/* ---------- projects ---------- */

export interface Project {
  id: string;
  slug: string;
  title: Localized;
  cover: SiteImage | null;
  gallery: SiteImage[];
  description: Localized | null;
  productIds: string[];
  completedAt: string | null;
  isSample: boolean;
}

export async function getProjects(): Promise<Project[]> {
  const raw = await sanityFetch<
    {
      _id: string;
      slug?: Maybe<string>;
      title?: Maybe<Localized>;
      cover?: Maybe<RawImage>;
      gallery?: Maybe<RawImage[]>;
      description?: Maybe<Localized>;
      productIds?: Maybe<string[]>;
      completedAt?: Maybe<string>;
      isSample?: Maybe<boolean>;
    }[]
  >(`*[_type == "project" && defined(slug.current)] | order(coalesce(completedAt, _createdAt) desc){
    _id, "slug": slug.current, title,
    "cover": cover ${IMAGE_PROJECTION},
    "gallery": gallery[] ${IMAGE_PROJECTION},
    description, "productIds": products[]._ref, completedAt, isSample
  }`);
  return raw
    .filter((p) => p.slug && hasHe(p.title))
    .map((p) => ({
      id: p._id,
      slug: p.slug!,
      title: p.title!,
      cover: toSiteImage(p.cover),
      gallery: (p.gallery ?? [])
        .map(toSiteImage)
        .filter((i): i is SiteImage => i !== null),
      description: hasHe(p.description) ? p.description : null,
      productIds: p.productIds ?? [],
      completedAt: p.completedAt ?? null,
      isSample: Boolean(p.isSample),
    }));
}

/* ---------- catalogs (PDF) ---------- */

export interface CatalogFile {
  id: string;
  title: Localized;
  url: string;
  /** Bytes. */
  size: number | null;
  language: "he" | "en" | "other";
  cover: SiteImage | null;
  isSample: boolean;
}

export async function getCatalogFiles(): Promise<CatalogFile[]> {
  const raw = await sanityFetch<
    {
      _id: string;
      title?: Maybe<Localized>;
      url?: Maybe<string>;
      size?: Maybe<number>;
      language?: Maybe<string>;
      cover?: Maybe<RawImage>;
      isSample?: Maybe<boolean>;
    }[]
  >(`*[_type == "catalogFile"] | order(order asc, _createdAt desc){
    _id, title, "url": file.asset->url, "size": file.asset->size, language,
    "cover": cover ${IMAGE_PROJECTION}, isSample
  }`);
  return raw
    .filter((c) => c.url && hasHe(c.title))
    .map((c) => ({
      id: c._id,
      title: c.title!,
      url: c.url!,
      size: c.size ?? null,
      language:
        c.language === "en" || c.language === "other" ? c.language : "he",
      cover: toSiteImage(c.cover),
      isSample: Boolean(c.isSample),
    }));
}

/** "2.4 MB" / "830 KB" in the page language. */
export function formatFileSize(bytes: number, locale: "he" | "en"): string {
  const fmt = (n: number, unit: "megabyte" | "kilobyte") =>
    new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-GB", {
      style: "unit",
      unit,
      unitDisplay: "short",
      maximumFractionDigits: unit === "megabyte" ? 1 : 0,
    }).format(n);
  return bytes >= 1024 * 1024
    ? fmt(bytes / (1024 * 1024), "megabyte")
    : fmt(Math.max(1, bytes / 1024), "kilobyte");
}
