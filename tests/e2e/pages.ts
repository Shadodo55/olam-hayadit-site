/**
 * Pages the a11y suite must cover: one of each page type, in both languages.
 * Add new page types here as they are built.
 */
export const pages = [
  { path: "/", lang: "he", dir: "rtl" },
  { path: "/en", lang: "en", dir: "ltr" },
  // content pages
  { path: "/visit", lang: "he", dir: "rtl" },
  { path: "/en/visit", lang: "en", dir: "ltr" },
  { path: "/measuring-guide", lang: "he", dir: "rtl" },
  { path: "/about", lang: "he", dir: "rtl" },
  { path: "/en/faq", lang: "en", dir: "ltr" },
  { path: "/brands", lang: "he", dir: "rtl" },
  { path: "/projects", lang: "he", dir: "rtl" },
  { path: "/catalogs", lang: "he", dir: "rtl" },
  // still "coming soon"
  { path: "/contact", lang: "he", dir: "rtl" },
  // catalog
  { path: "/catalog", lang: "he", dir: "rtl" },
  { path: "/catalog/handles/door", lang: "he", dir: "rtl" },
  { path: "/en/catalog/handles", lang: "en", dir: "ltr" },
  // search & my list
  { path: "/search", lang: "he", dir: "rtl" },
  { path: "/en/my-list", lang: "en", dir: "ltr" },
] as const;
