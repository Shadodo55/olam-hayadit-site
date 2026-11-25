import type { Agorot } from "@/commerce/money";
import type { StockStatus } from "@/commerce/stock";
import { localized, type Locale, type Localized } from "@/lib/i18n/locales";
import type { SiteImage } from "@/lib/sanity/image";
import type { Product } from "./product";

/**
 * Catalog listing logic: compact card data, URL <-> filter state, filtering,
 * sorting and facet counts. Pure functions (unit-tested); the UI only renders.
 */

export interface CardVariant {
  finish: string | null;
  size: string | null;
  cc: number | null;
  price: Agorot;
  stock: StockStatus;
}

/** Serializable product summary sent to the browser for listings. */
export interface ProductCardData {
  id: string;
  slug: string;
  title: Localized;
  sku: string;
  brand: { slug: string; name: string } | null;
  material: { slug: string; name: Localized } | null;
  image: SiteImage | null;
  hoverImage: SiteImage | null;
  priceMin: Agorot;
  priceMax: Agorot;
  stock: StockStatus;
  isNew: boolean;
  isSample: boolean;
  createdAt: string;
  finishes: { slug: string; name: Localized; swatch: string | null }[];
  sizes: { key: string; label: Localized }[];
  variants: CardVariant[];
}

export const sizeKey = (label: Localized | null): string | null =>
  label ? label.en?.trim() || label.he.trim() : null;

/** The first whole number in a size ("128 mm" → 128), or null. */
export function sizeMillimetres(size: string | null): number | null {
  const match = size?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/**
 * True when every size given is just the hole-to-hole distance, as with most
 * handles ("128 mm" = 128 mm between the screws). Then the product page calls
 * the choice what it is: hole spacing.
 */
export function sizesAreHoleSpacing(
  variants: readonly { size: string | null; cc: number | null }[],
): boolean {
  const sized = variants.filter((v) => v.size !== null);
  return (
    sized.length > 0 &&
    sized.every((v) => v.cc !== null && sizeMillimetres(v.size) === v.cc)
  );
}

export function toCardData(product: Product): ProductCardData {
  const finishes = new Map<string, ProductCardData["finishes"][number]>();
  const sizes = new Map<string, ProductCardData["sizes"][number]>();
  for (const v of product.variants) {
    if (v.finish)
      finishes.set(v.finish.slug, {
        slug: v.finish.slug,
        name: v.finish.name,
        swatch: v.finish.swatch,
      });
    const key = sizeKey(v.sizeLabel);
    if (key && v.sizeLabel) sizes.set(key, { key, label: v.sizeLabel });
  }
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    sku: product.sku,
    brand: product.brand
      ? { slug: product.brand.slug, name: product.brand.name }
      : null,
    material: product.material
      ? { slug: product.material.slug, name: product.material.name }
      : null,
    image: product.images[0] ?? null,
    hoverImage: product.images[1] ?? null,
    priceMin: product.price.min,
    priceMax: product.price.max,
    stock: product.stock,
    isNew: product.isNew,
    isSample: product.isSample,
    createdAt: product.createdAt,
    finishes: [...finishes.values()],
    sizes: [...sizes.values()],
    variants: product.variants.map((v) => ({
      finish: v.finish?.slug ?? null,
      size: sizeKey(v.sizeLabel),
      cc: v.holeToHoleMm,
      price: v.price,
      stock: v.stock,
    })),
  };
}

/* ---------- filter state <-> URL ---------- */

export const SORT_KEYS = ["newest", "price-asc", "price-desc", "name"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface FilterState {
  brand: string[];
  finish: string[];
  material: string[];
  size: string[];
  cc: number[];
  /** Shekels (whole numbers) as typed by the visitor. */
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  sort: SortKey;
}

export const emptyFilters: FilterState = {
  brand: [],
  finish: [],
  material: [],
  size: [],
  cc: [],
  priceMin: null,
  priceMax: null,
  inStock: false,
  sort: "newest",
};

const list = (value: string | null) =>
  value
    ? [
        ...new Set(
          value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ]
    : [];
const positiveInt = (value: string | undefined) => {
  if (value === undefined || value.trim() === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

export function parseFilters(params: URLSearchParams): FilterState {
  const [min, max] = (params.get("price") ?? "").split("-");
  const sort = params.get("sort");
  return {
    brand: list(params.get("brand")),
    finish: list(params.get("finish")),
    material: list(params.get("material")),
    size: list(params.get("size")),
    cc: list(params.get("cc"))
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0),
    priceMin: positiveInt(min),
    priceMax: positiveInt(max),
    inStock: params.get("stock") === "1",
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "newest",
  };
}

/** Stable, readable query string (empty values omitted). */
export function serializeFilters(state: FilterState): string {
  const params = new URLSearchParams();
  const put = (key: string, values: (string | number)[]) => {
    if (values.length) params.set(key, values.join(","));
  };
  put("brand", state.brand);
  put("finish", state.finish);
  put("material", state.material);
  put("size", state.size);
  put(
    "cc",
    [...state.cc].sort((a, b) => a - b),
  );
  if (state.priceMin !== null || state.priceMax !== null) {
    params.set("price", `${state.priceMin ?? ""}-${state.priceMax ?? ""}`);
  }
  if (state.inStock) params.set("stock", "1");
  if (state.sort !== "newest") params.set("sort", state.sort);
  return params.toString();
}

export function activeFilterCount(state: FilterState): number {
  return (
    state.brand.length +
    state.finish.length +
    state.material.length +
    state.size.length +
    state.cc.length +
    (state.priceMin !== null || state.priceMax !== null ? 1 : 0) +
    (state.inStock ? 1 : 0)
  );
}

/* ---------- filtering ---------- */

export type FacetKey =
  "brand" | "finish" | "material" | "size" | "cc" | "price" | "inStock";

/**
 * A product matches when its brand/material match AND at least one variant
 * matches every variant-level filter at once (e.g. "gold" + "128 mm" means a
 * gold 128 mm version exists, not gold in one size and 128 mm in another).
 */
export function matches(
  card: ProductCardData,
  state: FilterState,
  ignore?: FacetKey,
): boolean {
  const applies = (facet: FacetKey) => facet !== ignore;
  if (
    applies("brand") &&
    state.brand.length &&
    !state.brand.includes(card.brand?.slug ?? "")
  )
    return false;
  if (
    applies("material") &&
    state.material.length &&
    !state.material.includes(card.material?.slug ?? "")
  )
    return false;
  return card.variants.some(
    (v) =>
      (!applies("finish") ||
        !state.finish.length ||
        state.finish.includes(v.finish ?? "")) &&
      (!applies("size") ||
        !state.size.length ||
        state.size.includes(v.size ?? "")) &&
      (!applies("cc") ||
        !state.cc.length ||
        (v.cc !== null && state.cc.includes(v.cc))) &&
      (!applies("price") ||
        state.priceMin === null ||
        v.price >= state.priceMin * 100) &&
      (!applies("price") ||
        state.priceMax === null ||
        v.price <= state.priceMax * 100) &&
      (!applies("inStock") || !state.inStock || v.stock === "inStore"),
  );
}

export function applyFilters(
  cards: readonly ProductCardData[],
  state: FilterState,
): ProductCardData[] {
  return cards.filter((card) => matches(card, state));
}

export function sortCards(
  cards: readonly ProductCardData[],
  sort: SortKey,
  locale: Locale,
): ProductCardData[] {
  const collator = new Intl.Collator(locale === "he" ? "he" : "en");
  const byName = (a: ProductCardData, b: ProductCardData) =>
    collator.compare(
      localized(a.title, locale).value,
      localized(b.title, locale).value,
    );
  const sorted = [...cards];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceMin - b.priceMin || byName(a, b));
    case "price-desc":
      return sorted.sort((a, b) => b.priceMin - a.priceMin || byName(a, b));
    case "name":
      return sorted.sort(byName);
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isNew) - Number(a.isNew) ||
          b.createdAt.localeCompare(a.createdAt) ||
          byName(a, b),
      );
  }
}

/* ---------- facets ---------- */

export interface FacetOption {
  value: string;
  label: Localized;
  count: number;
  swatch?: string | null;
}

/**
 * Options for one facet, with how many products each option would show
 * given the OTHER active filters. Selected options are always kept.
 */
export function facetOptions(
  cards: readonly ProductCardData[],
  state: FilterState,
  facet: "brand" | "finish" | "material" | "size" | "cc",
): FacetOption[] {
  const pool = cards.filter((card) => matches(card, state, facet));
  const options = new Map<string, FacetOption>();
  const add = (value: string, label: Localized, swatch?: string | null) => {
    const existing = options.get(value);
    if (existing) existing.count++;
    else
      options.set(value, {
        value,
        label,
        count: 1,
        ...(swatch !== undefined ? { swatch } : {}),
      });
  };
  for (const card of pool) {
    const seen = new Set<string>();
    const once = (value: string, label: Localized, swatch?: string | null) => {
      if (seen.has(value)) return;
      seen.add(value);
      add(value, label, swatch);
    };
    if (facet === "brand" && card.brand)
      once(card.brand.slug, { he: card.brand.name });
    if (facet === "material" && card.material)
      once(card.material.slug, card.material.name);
    if (facet === "finish")
      card.finishes.forEach((f) => once(f.slug, f.name, f.swatch));
    if (facet === "size") card.sizes.forEach((s) => once(s.key, s.label));
    if (facet === "cc")
      card.variants.forEach((v) => {
        if (v.cc) once(String(v.cc), { he: `${v.cc} מ״מ`, en: `${v.cc} mm` });
      });
  }
  // Keep selected options visible even if they now have 0 results.
  const selected: string[] =
    facet === "cc" ? state.cc.map(String) : state[facet];
  for (const value of selected) {
    if (!options.has(value))
      options.set(value, { value, label: { he: value }, count: 0 });
  }
  const list = [...options.values()];
  return facet === "cc"
    ? list.sort((a, b) => Number(a.value) - Number(b.value))
    : list.sort((a, b) => a.label.he.localeCompare(b.label.he, "he"));
}

/** Price bounds (whole shekels) across cards, for the price inputs' placeholders. */
export function priceBounds(
  cards: readonly ProductCardData[],
): { min: number; max: number } | null {
  if (!cards.length) return null;
  return {
    min: Math.floor(Math.min(...cards.map((c) => c.priceMin)) / 100),
    max: Math.ceil(Math.max(...cards.map((c) => c.priceMax)) / 100),
  };
}

/**
 * Size options that only repeat a hole-to-hole distance (every variant with
 * that size has its screws exactly that far apart). Next to the hole-spacing
 * filter they'd be the same numbers twice, so the catalog leaves them out of
 * "size" and keeps the real sizes (a knob's diameter, a leg's length).
 */
export function holeSpacingSizes(
  cards: readonly ProductCardData[],
): Set<string> {
  const same = new Map<string, boolean>();
  for (const v of cards.flatMap((card) => card.variants)) {
    if (v.size === null) continue;
    const repeats = v.cc !== null && sizeMillimetres(v.size) === v.cc;
    same.set(v.size, (same.get(v.size) ?? true) && repeats);
  }
  return new Set(
    [...same].filter(([, repeats]) => repeats).map(([size]) => size),
  );
}
