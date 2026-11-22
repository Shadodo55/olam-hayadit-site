import type { NextConfig } from "next";

/**
 * The site is a fully static export served by Cloudflare Workers Static Assets.
 * See CLAUDE.md ("Rendering") for why there is no server rendering.
 */
const nextConfig: NextConfig = {
  output: "export",
  // Static export cannot use the default image optimizer. Phase 3 switches to a
  // custom loader backed by the Sanity image CDN (AVIF/WebP, responsive sizes).
  images: { unoptimized: true },
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

export default nextConfig;
