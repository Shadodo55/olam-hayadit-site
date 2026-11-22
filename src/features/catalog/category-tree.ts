import type { Localized } from "@/lib/i18n/locales";

/**
 * Starting category tree from the approved plan. TEMPORARY: in phase 3 the tree
 * comes from Sanity (editable by the store owner) and this file becomes the
 * seed data. Slugs are English so URLs are the same in both languages.
 */
export interface Category {
  slug: string;
  name: Localized;
  /** Label for the "all items in this category" link, e.g. "כל הידיות". */
  allLabel: Localized;
  children?: readonly Category[];
}

export const categoryTree: readonly Category[] = [
  {
    slug: "handles",
    name: { he: "ידיות", en: "Handles" },
    allLabel: { he: "כל הידיות", en: "All handles" },
    children: [
      {
        slug: "kitchen-furniture",
        name: { he: "ידיות למטבח ולרהיטים", en: "Kitchen & furniture handles" },
        allLabel: {
          he: "כל הידיות למטבח ולרהיטים",
          en: "All kitchen & furniture handles",
        },
      },
      {
        slug: "door",
        name: { he: "ידיות לדלתות", en: "Door handles" },
        allLabel: { he: "כל הידיות לדלתות", en: "All door handles" },
      },
      {
        slug: "knobs",
        name: { he: "כפתורים", en: "Knobs" },
        allLabel: { he: "כל הכפתורים", en: "All knobs" },
      },
      {
        slug: "fridge",
        name: { he: "ידיות למקרר", en: "Fridge handles" },
        allLabel: { he: "כל הידיות למקרר", en: "All fridge handles" },
      },
    ],
  },
  {
    slug: "technical",
    name: { he: "פרזול טכני", en: "Technical hardware" },
    allLabel: { he: "כל הפרזול הטכני", en: "All technical hardware" },
    children: [
      {
        slug: "hinges",
        name: { he: "צירים", en: "Hinges" },
        allLabel: { he: "כל הצירים", en: "All hinges" },
      },
      {
        slug: "drawer-systems",
        name: { he: "מערכות מגירות", en: "Drawer systems" },
        allLabel: { he: "כל מערכות המגירות", en: "All drawer systems" },
      },
      {
        slug: "legs",
        name: { he: "רגליים", en: "Legs" },
        allLabel: { he: "כל הרגליים", en: "All legs" },
      },
    ],
  },
  {
    slug: "bathroom",
    name: { he: "אביזרי אמבטיה", en: "Bathroom accessories" },
    allLabel: { he: "כל אביזרי האמבטיה", en: "All bathroom accessories" },
  },
  {
    slug: "kitchen-storage",
    name: { he: "אחסון למטבח", en: "Kitchen storage" },
    allLabel: { he: "כל פתרונות האחסון למטבח", en: "All kitchen storage" },
  },
  {
    slug: "home-decor",
    name: { he: "עיצוב הבית", en: "Home decor" },
    allLabel: { he: "כל מוצרי עיצוב הבית", en: "All home decor" },
  },
];

export function categoryPath(...slugs: string[]): string {
  return `/catalog/${slugs.join("/")}`;
}

/** Resolve a slug path (["handles", "door"]) to its chain of categories, or null. */
export function findCategoryChain(slugs: readonly string[]): Category[] | null {
  const chain: Category[] = [];
  let level: readonly Category[] | undefined = categoryTree;
  for (const slug of slugs) {
    const match: Category | undefined = level?.find((c) => c.slug === slug);
    if (!match) return null;
    chain.push(match);
    level = match.children;
  }
  return chain.length ? chain : null;
}

/** Every category as a slug path, depth-first. */
export function allCategorySlugPaths(): string[][] {
  const paths: string[][] = [];
  const walk = (nodes: readonly Category[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.slug];
      paths.push(path);
      if (node.children) walk(node.children, path);
    }
  };
  walk(categoryTree, []);
  return paths;
}
