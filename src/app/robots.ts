import type { MetadataRoute } from "next";
import { allowIndexing, siteUrl } from "@/lib/seo/metadata";

export const dynamic = "force-static";

/**
 * Until launch nothing is crawled (the pages are noindex too); at launch
 * (NEXT_PUBLIC_ALLOW_INDEXING=true) everything is, with the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return allowIndexing
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: new URL("/sitemap.xml", siteUrl).href,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
