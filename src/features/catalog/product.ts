import {
  priceRange,
  shekelsToAgorot,
  type Agorot,
  type PriceRange,
} from "@/commerce/money";
import {
  aggregateStock,
  isStockStatus,
  type StockStatus,
} from "@/commerce/stock";
import type { Localized } from "@/lib/i18n/locales";
import { toSiteImage, type RawImage, type SiteImage } from "@/lib/sanity/image";

/** Catalog domain types: what UI components receive (never raw CMS data). */
export interface Finish {
  id: string;
  slug: string;
  name: Localized;
  swatch: string | null;
}

export interface Variant {
  sku: string;
  finish: Finish | null;
  sizeLabel: Localized | null;
  holeToHoleMm: number | null;
  lengthMm: number | null;
  price: Agorot;
  stock: StockStatus;
  /** For future shipping rates. */
  shipping: {
    weightGrams: number | null;
    packageMm: [number, number, number] | null;
  };
}

export interface Product {
  id: string;
  slug: string;
  title: Localized;
  sku: string;
  shortDescription: Localized | null;
  description: Localized | null;
  categoryIds: string[];
  brand: { id: string; name: string; slug: string } | null;
  material: { id: string; name: Localized; slug: string } | null;
  images: SiteImage[];
  specs: { label: Localized; value: Localized }[];
  variants: Variant[];
  price: PriceRange;
  stock: StockStatus;
  relatedIds: string[];
  isNew: boolean;
  featured: boolean;
  isSample: boolean;
  createdAt: string;
  seoDescription: Localized | null;
}

type Maybe<T> = T | null | undefined;
interface RawVariant {
  sku?: Maybe<string>;
  sizeLabel?: Maybe<Localized>;
  holeToHoleMm?: Maybe<number>;
  lengthMm?: Maybe<number>;
  price?: Maybe<number>;
  stock?: Maybe<string>;
  weightGrams?: Maybe<number>;
  packageLengthMm?: Maybe<number>;
  packageWidthMm?: Maybe<number>;
  packageHeightMm?: Maybe<number>;
  finish?: Maybe<{
    _id: string;
    name?: Maybe<Localized>;
    slug?: Maybe<string>;
    swatch?: Maybe<string>;
  }>;
}
export interface RawProduct {
  _id: string;
  slug?: Maybe<string>;
  title?: Maybe<Localized>;
  sku?: Maybe<string>;
  shortDescription?: Maybe<Localized>;
  description?: Maybe<Localized>;
  isNew?: Maybe<boolean>;
  featured?: Maybe<boolean>;
  isSample?: Maybe<boolean>;
  _createdAt?: Maybe<string>;
  categoryIds?: Maybe<string[]>;
  brand?: Maybe<{ _id: string; name?: Maybe<string>; slug?: Maybe<string> }>;
  material?: Maybe<{
    _id: string;
    name?: Maybe<Localized>;
    slug?: Maybe<string>;
  }>;
  images?: Maybe<RawImage[]>;
  specs?: Maybe<{ label?: Maybe<Localized>; value?: Maybe<Localized> }[]>;
  variants?: Maybe<RawVariant[]>;
  relatedIds?: Maybe<string[]>;
  seoDescription?: Maybe<Localized>;
}

const hasHe = (v: Maybe<Localized>): v is Localized => Boolean(v?.he?.trim());

function mapVariant(raw: RawVariant): Variant | null {
  if (!raw.sku || typeof raw.price !== "number" || raw.price <= 0) return null;
  const pkg =
    raw.packageLengthMm && raw.packageWidthMm && raw.packageHeightMm
      ? ([raw.packageLengthMm, raw.packageWidthMm, raw.packageHeightMm] as [
          number,
          number,
          number,
        ])
      : null;
  return {
    sku: raw.sku,
    finish:
      raw.finish && raw.finish.slug && hasHe(raw.finish.name)
        ? {
            id: raw.finish._id,
            slug: raw.finish.slug,
            name: raw.finish.name,
            swatch: raw.finish.swatch ?? null,
          }
        : null,
    sizeLabel: hasHe(raw.sizeLabel) ? raw.sizeLabel : null,
    holeToHoleMm: raw.holeToHoleMm ?? null,
    lengthMm: raw.lengthMm ?? null,
    price: shekelsToAgorot(raw.price),
    stock: isStockStatus(raw.stock) ? raw.stock : "askUs",
    shipping: { weightGrams: raw.weightGrams ?? null, packageMm: pkg },
  };
}

/**
 * CMS → domain. Products without a Hebrew title, slug, SKU or at least one
 * priced variant are skipped (incomplete drafts never reach the site).
 */
export function mapProduct(raw: RawProduct): Product | null {
  if (!raw.slug || !raw.sku || !hasHe(raw.title)) return null;
  const variants = (raw.variants ?? [])
    .map(mapVariant)
    .filter((v): v is Variant => v !== null);
  const range = priceRange(variants.map((v) => v.price));
  if (!range) return null;
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    sku: raw.sku,
    shortDescription: hasHe(raw.shortDescription) ? raw.shortDescription : null,
    description: hasHe(raw.description) ? raw.description : null,
    categoryIds: raw.categoryIds ?? [],
    brand:
      raw.brand?.name && raw.brand.slug
        ? { id: raw.brand._id, name: raw.brand.name, slug: raw.brand.slug }
        : null,
    material:
      raw.material?.slug && hasHe(raw.material.name)
        ? {
            id: raw.material._id,
            name: raw.material.name,
            slug: raw.material.slug,
          }
        : null,
    images: (raw.images ?? [])
      .map(toSiteImage)
      .filter((i): i is SiteImage => i !== null),
    // Empty spec rows are hidden (never show "no information").
    specs: (raw.specs ?? [])
      .filter((s) => hasHe(s.label) && hasHe(s.value))
      .map((s) => ({ label: s.label!, value: s.value! })),
    variants,
    price: range,
    stock: aggregateStock(variants.map((v) => v.stock)),
    relatedIds: raw.relatedIds ?? [],
    isNew: Boolean(raw.isNew),
    featured: Boolean(raw.featured),
    isSample: Boolean(raw.isSample),
    createdAt: raw._createdAt ?? "",
    seoDescription: hasHe(raw.seoDescription) ? raw.seoDescription : null,
  };
}
