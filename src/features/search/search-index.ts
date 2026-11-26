import type { Agorot } from "@/commerce/money";
import type { StockStatus } from "@/commerce/stock";
import { categoryPath, type Category } from "@/features/catalog/category-tree";
import type { Product } from "@/features/catalog/product";
import type { Localized } from "@/lib/i18n/locales";

/**
 * The search index: one static JSON file (/search-index.json) generated at
 * build time and loaded by the browser only when search or "My list" is used.
 * It also carries variant data so "My list" can show current names/prices.
 */
export interface IndexVariant {
  sku: string;
  finish: Localized | null;
  size: Localized | null;
  price: Agorot;
  stock: StockStatus;
}

export interface IndexProduct {
  id: string;
  slug: string;
  title: Localized;
  sku: string;
  brand: string | null;
  categories: Localized[];
  image: string | null;
  priceMin: Agorot;
  priceMax: Agorot;
  isSample: boolean;
  variants: IndexVariant[];
}

export interface IndexCategory {
  path: string;
  title: Localized;
  parent: Localized | null;
}

export interface SearchIndex {
  version: 1;
  products: IndexProduct[];
  categories: IndexCategory[];
}

function flattenCategories(
  tree: readonly Category[],
): (IndexCategory & { id: string })[] {
  const out: (IndexCategory & { id: string })[] = [];
  const walk = (
    nodes: readonly Category[],
    prefix: string[],
    parent: Localized | null,
  ) => {
    for (const n of nodes) {
      const slugs = [...prefix, n.slug];
      out.push({
        id: n.id,
        path: categoryPath(...slugs),
        title: n.name,
        parent,
      });
      if (n.children) walk(n.children, slugs, n.name);
    }
  };
  walk(tree, [], null);
  return out;
}

export function buildSearchIndex(
  products: readonly Product[],
  tree: readonly Category[],
): SearchIndex {
  const categories = flattenCategories(tree);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return {
    version: 1,
    categories: categories.map(({ path, title, parent }) => ({
      path,
      title,
      parent,
    })),
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      sku: p.sku,
      brand: p.brand?.name ?? null,
      categories: p.categoryIds
        .map((id) => byId.get(id)?.title)
        .filter((t): t is Localized => Boolean(t)),
      image: p.images[0]?.src ?? null,
      priceMin: p.price.min,
      priceMax: p.price.max,
      isSample: p.isSample,
      variants: p.variants.map((v) => ({
        sku: v.sku,
        finish: v.finish?.name ?? null,
        size: v.sizeLabel,
        price: v.price,
        stock: v.stock,
      })),
    })),
  };
}
