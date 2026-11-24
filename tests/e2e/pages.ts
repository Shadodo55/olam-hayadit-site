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
  // forms
  { path: "/contact", lang: "he", dir: "rtl" },
  { path: "/en/contact", lang: "en", dir: "ltr" },
  { path: "/professionals", lang: "he", dir: "rtl" },
  { path: "/en/professionals", lang: "en", dir: "ltr" },
  // legal pages
  { path: "/accessibility", lang: "he", dir: "rtl" },
  { path: "/en/accessibility", lang: "en", dir: "ltr" },
  { path: "/privacy", lang: "he", dir: "rtl" },
  { path: "/en/privacy", lang: "en", dir: "ltr" },
  { path: "/terms", lang: "he", dir: "rtl" },
  { path: "/en/terms", lang: "en", dir: "ltr" },
  { path: "/cookies", lang: "he", dir: "rtl" },
  { path: "/en/cookies", lang: "en", dir: "ltr" },
  // catalog
  { path: "/catalog", lang: "he", dir: "rtl" },
  { path: "/catalog/handles/door", lang: "he", dir: "rtl" },
  { path: "/en/catalog/handles", lang: "en", dir: "ltr" },
  // search & my list
  { path: "/search", lang: "he", dir: "rtl" },
  { path: "/en/my-list", lang: "en", dir: "ltr" },
] as const;
