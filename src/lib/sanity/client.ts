import { createClient, type QueryParams } from "@sanity/client";

/**
 * Build-time Sanity access. The dataset is public: no token is used or needed.
 * UI components never import this file directly: they go through the feature
 * data modules (src/features/x/data.ts, src/lib/site/settings.ts).
 */
export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "gntr6ikv",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2025-08-15",
} as const;

const client = createClient({
  ...sanityConfig,
  // Builds run right after a publish (webhook), so skip the CDN cache to
  // always get the latest published content.
  useCdn: false,
  perspective: "published",
});

/**
 * Each build worker fetches a given query once, however many pages use it.
 * Errors propagate: a failed fetch fails the build instead of deploying an
 * empty site.
 */
const memo = new Map<string, Promise<unknown>>();

export function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T> {
  const key = JSON.stringify([query, params]);
  let pending = memo.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = client.fetch<T>(query, params);
    memo.set(key, pending);
    pending.catch(() => memo.delete(key));
  }
  return pending;
}
