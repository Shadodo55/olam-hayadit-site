import type { Localized } from "@/lib/i18n/locales";
import { toSiteImage, type RawImage, type SiteImage } from "@/lib/sanity/image";

/**
 * Category tree types and pure helpers. The data comes from Sanity
 * (see ./data.ts → getCategoryTree). Slugs are English, so URLs are the same
 * in both languages.
 */
export interface Category {
  id: string;
  slug: string;
  name: Localized;
  /** Label for the "all items in this category" link, e.g. "כל הידיות". */
  allLabel: Localized;
  description: Localized | null;
  filters: string[];
  /** Tile image on the home page (falls back to a product image there). */
  image?: SiteImage;
  children?: readonly Category[];
}

export interface RawCategory {
  _id: string;
  slug?: string | null;
  title?: Localized | null;
  allLabel?: Localized | null;
  description?: Localized | null;
  filters?: string[] | null;
  image?: RawImage | null;
  parent?: string | null;
  order?: number | null;
}

/** Build the nested tree from flat CMS documents (max 3 levels, sorted by `order`). */
export function buildCategoryTree(raw: readonly RawCategory[]): Category[] {
  const valid = raw.filter((c) => c.slug && c.title?.he);
  const byParent = new Map<string | null, RawCategory[]>();
  for (const c of valid) {
    const parent =
      c.parent && valid.some((p) => p._id === c.parent) ? c.parent : null;
    byParent.set(parent, [...(byParent.get(parent) ?? []), c]);
  }
  const build = (parent: string | null, depth: number): Category[] =>
    (byParent.get(parent) ?? [])
      .sort(
        (a, b) =>
          (a.order ?? 99) - (b.order ?? 99) || a.slug!.localeCompare(b.slug!),
      )
      .map((c) => {
        const children = depth < 3 ? build(c._id, depth + 1) : [];
        const image = toSiteImage(c.image);
        return {
          id: c._id,
          slug: c.slug!,
          name: c.title!,
          allLabel: c.allLabel?.he ? c.allLabel : c.title!,
          description: c.description?.he ? c.description : null,
          filters: c.filters ?? [],
          ...(image ? { image } : {}),
          ...(children.length ? { children } : {}),
        };
      });
  return build(null, 1);
}

export function categoryPath(...slugs: string[]): string {
  return `/catalog/${slugs.join("/")}`;
}

/** Resolve a slug path (["handles", "door"]) to its chain of categories, or null. */
export function findCategoryChain(
  tree: readonly Category[],
  slugs: readonly string[],
): Category[] | null {
  const chain: Category[] = [];
  let level: readonly Category[] | undefined = tree;
  for (const slug of slugs) {
    const match: Category | undefined = level?.find((c) => c.slug === slug);
    if (!match) return null;
    chain.push(match);
    level = match.children;
  }
  return chain.length ? chain : null;
}

/** Every category as a slug path, depth-first. */
export function allCategorySlugPaths(tree: readonly Category[]): string[][] {
  const paths: string[][] = [];
  const walk = (nodes: readonly Category[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.slug];
      paths.push(path);
      if (node.children) walk(node.children, path);
    }
  };
  walk(tree, []);
  return paths;
}
