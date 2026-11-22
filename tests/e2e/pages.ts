/**
 * Pages the a11y suite must cover: one of each page type, in both languages.
 * Add new page types here as they are built.
 */
export const pages = [
  { path: "/", lang: "he", dir: "rtl" },
  { path: "/en", lang: "en", dir: "ltr" },
  // "coming soon" content page
  { path: "/visit", lang: "he", dir: "rtl" },
  { path: "/en/visit", lang: "en", dir: "ltr" },
  // catalog category (placeholder until phase 4)
  { path: "/catalog/handles/door", lang: "he", dir: "rtl" },
  { path: "/en/catalog/handles", lang: "en", dir: "ltr" },
] as const;
