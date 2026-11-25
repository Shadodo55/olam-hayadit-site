import { localized, type Locale, type Localized } from "@/lib/i18n/locales";
import type { Variant } from "./product";
import { sizeKey, sizeMillimetres, sizesAreHoleSpacing } from "./listing";

/** Selection by finish slug and size key; `null` means "no such dimension". */
export interface Selection {
  finish: string | null;
  size: string | null;
}

export const finishOf = (v: Variant) => v.finish?.slug ?? null;
export const sizeOf = (v: Variant) => sizeKey(v.sizeLabel);

export function findVariant(
  variants: readonly Variant[],
  sel: Selection,
): Variant | undefined {
  return variants.find(
    (v) => finishOf(v) === sel.finish && sizeOf(v) === sel.size,
  );
}

/** Default: the first in-store variant, else the first one. */
export function defaultSelection(variants: readonly Variant[]): Selection {
  const v = variants.find((x) => x.stock === "inStore") ?? variants[0];
  return v
    ? { finish: finishOf(v), size: sizeOf(v) }
    : { finish: null, size: null };
}

/** Selection from a SKU (e.g. the ?sku= URL parameter), if it exists. */
export function selectionForSku(
  variants: readonly Variant[],
  sku: string | null,
): Selection | null {
  const v = sku ? variants.find((x) => x.sku === sku) : undefined;
  return v ? { finish: finishOf(v), size: sizeOf(v) } : null;
}

/**
 * Change one dimension. If the combination doesn't exist (e.g. the new finish
 * has no 320 mm), keep the new value and pick the closest valid other value.
 */
export function selectFinish(
  variants: readonly Variant[],
  current: Selection,
  finish: string | null,
): Selection {
  const next = { ...current, finish };
  if (findVariant(variants, next)) return next;
  const fallback = variants.find((v) => finishOf(v) === finish);
  return fallback ? { finish, size: sizeOf(fallback) } : current;
}

export function selectSize(
  variants: readonly Variant[],
  current: Selection,
  size: string | null,
): Selection {
  const next = { ...current, size };
  if (findVariant(variants, next)) return next;
  const fallback = variants.find((v) => sizeOf(v) === size);
  return fallback ? { finish: finishOf(fallback), size } : current;
}

/** This product's sizes are hole-to-hole distances (see listing.ts). */
export const sizesAreHoleSpacingFor = (variants: readonly Variant[]) =>
  sizesAreHoleSpacing(
    variants.map((v) => ({ size: sizeOf(v), cc: v.holeToHoleMm })),
  );

/** Overall length (mm) for a size, when the CMS gives one that differs. */
export function lengthForSize(
  variants: readonly Variant[],
  size: string,
): number | null {
  const own = sizeMillimetres(size);
  const match = variants.find(
    (v) => sizeOf(v) === size && v.lengthMm !== null && v.lengthMm !== own,
  );
  return match?.lengthMm ?? null;
}

/** Distinct finishes and sizes, in the order they appear in the CMS. */
export function variantOptions(variants: readonly Variant[]) {
  const finishes = new Map<string, NonNullable<Variant["finish"]>>();
  const sizes = new Map<string, Localized>();
  for (const v of variants) {
    if (v.finish) finishes.set(v.finish.slug, v.finish);
    const key = sizeOf(v);
    if (key && v.sizeLabel) sizes.set(key, v.sizeLabel);
  }
  return {
    finishes: [...finishes.values()],
    sizes: [...sizes.entries()].map(([key, label]) => ({ key, label })),
  };
}

/** WhatsApp text: product name, SKU, finish and size, and a link back. */
export function whatsappText(
  template: (values: {
    name: string;
    sku: string;
    details: string;
    url: string;
  }) => string,
  parts: {
    name: string;
    sku: string;
    url: string;
    finishLine?: string;
    sizeLine?: string;
  },
): string {
  return template({
    name: parts.name,
    sku: parts.sku,
    details: `${parts.finishLine ?? ""}${parts.sizeLine ?? ""}`,
    url: parts.url,
  });
}

export function variantSummary(variant: Variant, locale: Locale): string {
  return [
    variant.finish ? localized(variant.finish.name, locale).value : null,
    variant.sizeLabel ? localized(variant.sizeLabel, locale).value : null,
  ]
    .filter(Boolean)
    .join(", ");
}
