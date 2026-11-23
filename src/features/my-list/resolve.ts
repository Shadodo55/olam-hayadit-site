import type { SavedList } from "@/commerce/list";
import { localized, type Locale } from "@/lib/i18n/locales";
import type {
  IndexProduct,
  IndexVariant,
  SearchIndex,
} from "@/features/search/search-index";

/** A saved line joined with current catalog data (or marked unavailable). */
export interface ResolvedLine {
  sku: string;
  slug: string;
  qty: number;
  product: IndexProduct | null;
  variant: IndexVariant | null;
}

export function resolveList(
  list: SavedList,
  index: SearchIndex,
): ResolvedLine[] {
  const bySku = new Map<
    string,
    { product: IndexProduct; variant: IndexVariant }
  >();
  for (const product of index.products) {
    for (const variant of product.variants)
      bySku.set(variant.sku, { product, variant });
  }
  return list.items.map((item) => {
    const hit = bySku.get(item.sku);
    return {
      ...item,
      product: hit?.product ?? null,
      variant: hit?.variant ?? null,
    };
  });
}

export function estimatedTotal(lines: readonly ResolvedLine[]): number {
  return lines.reduce(
    (sum, l) => sum + (l.variant ? l.variant.price * l.qty : 0),
    0,
  );
}

export function variantDetails(
  variant: IndexVariant | null,
  locale: Locale,
): string {
  if (!variant) return "";
  return [variant.finish, variant.size]
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map((x) => localized(x, locale).value)
    .join(", ");
}

/** WhatsApp text for the whole list, one numbered line per item. */
export function listMessage(
  lines: readonly ResolvedLine[],
  locale: Locale,
  t: {
    intro: string;
    outro: string;
    line: (v: {
      index: number;
      name: string;
      sku: string;
      details: string;
      qty: number;
    }) => string;
  },
): string {
  const body = lines
    .filter((l) => l.product)
    .map((l, i) => {
      const details = variantDetails(l.variant, locale);
      return t.line({
        index: i + 1,
        name: localized(l.product!.title, locale).value,
        sku: l.sku,
        details: details ? ` | ${details}` : "",
        qty: l.qty,
      });
    });
  return [t.intro, ...body, t.outro].join("\n");
}
