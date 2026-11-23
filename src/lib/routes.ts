/**
 * Every content page of the site (same paths in both languages; English adds
 * an /en prefix). Pages that are not built yet are served by the catch-all
 * "coming soon" route, so navigation never leads to a 404 while we build.
 *
 * When a page gets its own route folder, add its key to `builtPages`.
 */
export const pagePaths = {
  catalog: "/catalog",
  search: "/search",
  myList: "/my-list",
  brands: "/brands",
  professionals: "/professionals",
  projects: "/projects",
  catalogs: "/catalogs",
  visit: "/visit",
  about: "/about",
  faq: "/faq",
  contact: "/contact",
  measuringGuide: "/measuring-guide",
  accessibility: "/accessibility",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
} as const;

export type PageKey = keyof typeof pagePaths;

/** Product page path (same slug in both languages). */
export function productPath(slug: string): string {
  return `/product/${slug}`;
}

/** Pages that have their own route folder (not served by the catch-all). */
export const builtPages: readonly PageKey[] = ["catalog"];

export function pageKeyForPath(path: string): PageKey | null {
  const entry = Object.entries(pagePaths).find(([, value]) => value === path);
  return entry ? (entry[0] as PageKey) : null;
}

/** Slug arrays the catch-all "coming soon" route must pre-render. */
export function comingSoonSlugs(): string[][] {
  return (Object.keys(pagePaths) as PageKey[])
    .filter((key) => !builtPages.includes(key))
    .map((key) => pagePaths[key].slice(1).split("/"));
}
