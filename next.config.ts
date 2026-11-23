import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * The site is a fully static export served by Cloudflare Workers Static Assets.
 * See CLAUDE.md ("Rendering") for why there is no server rendering.
 */
const nextConfig: NextConfig = {
  output: "export",
  // Static export can't use the built-in optimizer: the Sanity image CDN
  // resizes and serves AVIF/WebP instead (see the loader file).
  images: {
    loader: "custom",
    loaderFile: "./src/lib/sanity/image-loader.ts",
  },
  experimental: {
    // Two root layouts (Hebrew and English) need a global 404 page.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
