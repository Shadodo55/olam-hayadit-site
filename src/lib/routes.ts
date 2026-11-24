/**
 * Every content page of the site (same paths in both languages; English adds
 * an /en prefix). Each one has a route folder in src/app/(he) and
 * src/app/(en)/en. Links come from here, never hard-coded strings.
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
