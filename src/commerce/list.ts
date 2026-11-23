/**
 * "My list": products a visitor saves to plan a store visit. Stored only in
 * their browser. Line items identify a product VARIANT by SKU; names and prices
 * are always read fresh from the catalog (search index), never stored, so the
 * list can't show stale prices. The same LineItem shape will back a cart later.
 */
export interface LineItem {
  /** Variant SKU. */
  sku: string;
  /** Product slug, to link back to the product page. */
  slug: string;
  qty: number;
  addedAt: string;
}

export interface SavedList {
  version: 1;
  items: LineItem[];
}

export const MAX_QTY = 999;
export const emptyList: SavedList = { version: 1, items: [] };

const clampQty = (qty: number) =>
  Math.min(MAX_QTY, Math.max(1, Math.round(qty)));

export function addItem(
  list: SavedList,
  item: { sku: string; slug: string },
  qty = 1,
  now = new Date(),
): SavedList {
  const existing = list.items.find((i) => i.sku === item.sku);
  if (existing) {
    return {
      ...list,
      items: list.items.map((i) =>
        i.sku === item.sku ? { ...i, qty: clampQty(i.qty + qty) } : i,
      ),
    };
  }
  return {
    ...list,
    items: [
      ...list.items,
      {
        sku: item.sku,
        slug: item.slug,
        qty: clampQty(qty),
        addedAt: now.toISOString(),
      },
    ],
  };
}

export function setQty(list: SavedList, sku: string, qty: number): SavedList {
  if (!Number.isFinite(qty) || qty < 1) return removeItem(list, sku);
  return {
    ...list,
    items: list.items.map((i) =>
      i.sku === sku ? { ...i, qty: clampQty(qty) } : i,
    ),
  };
}

export function removeItem(list: SavedList, sku: string): SavedList {
  return { ...list, items: list.items.filter((i) => i.sku !== sku) };
}

export function totalQty(list: SavedList): number {
  return list.items.reduce((sum, i) => sum + i.qty, 0);
}

/** Parse stored JSON defensively: bad data means an empty list, never a crash. */
export function parseList(raw: string | null): SavedList {
  if (!raw) return emptyList;
  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data !== "object" ||
      data === null ||
      !Array.isArray((data as SavedList).items)
    )
      return emptyList;
    const items = (data as SavedList).items
      .filter(
        (i): i is LineItem =>
          typeof i === "object" &&
          i !== null &&
          typeof i.sku === "string" &&
          typeof i.slug === "string" &&
          typeof i.qty === "number" &&
          i.qty >= 1,
      )
      .map((i) => ({
        sku: i.sku,
        slug: i.slug,
        qty: clampQty(i.qty),
        addedAt: typeof i.addedAt === "string" ? i.addedAt : "",
      }));
    // De-duplicate by SKU (keep the first).
    const seen = new Set<string>();
    return {
      version: 1,
      items: items.filter((i) =>
        seen.has(i.sku) ? false : (seen.add(i.sku), true),
      ),
    };
  } catch {
    return emptyList;
  }
}
