import type { MetadataRoute } from "next";
import {
  allCategorySlugPaths,
  categoryPath,
} from "@/features/catalog/category-tree";
import { getCategoryTree, getProducts } from "@/features/catalog/data";
import { getBrands, getProjects } from "@/features/content/data";
import { localeHref } from "@/lib/i18n/locales";
import { pagePaths, productPath } from "@/lib/routes";
import { siteUrl } from "@/lib/seo/metadata";

export const dynamic = "force-static";

/** Every public page, in Hebrew with its English twin (hreflang). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tree, products, brands, projects] = await Promise.all([
    getCategoryTree(),
    getProducts(),
    getBrands(),
    getProjects(),
  ]);
  // Search and "my list" are per visitor, nothing to index.
  const pages = Object.entries(pagePaths)
    .filter(([key]) => key !== "search" && key !== "myList")
    .map(([, path]) => path);
  const paths = [
    "/",
    ...pages,
    ...allCategorySlugPaths(tree).map((slugs) => categoryPath(...slugs)),
    ...products.filter((p) => !p.isSample).map((p) => productPath(p.slug)),
    ...brands.filter((b) => !b.isSample).map((b) => `/brands/${b.slug}`),
    ...projects.filter((p) => !p.isSample).map((p) => `/projects/${p.slug}`),
  ];
  const url = (path: string) => new URL(path, siteUrl).href;
  return paths.map((path) => ({
    url: url(localeHref("he", path)),
    alternates: {
      languages: {
        he: url(localeHref("he", path)),
        en: url(localeHref("en", path)),
      },
    },
  }));
}
