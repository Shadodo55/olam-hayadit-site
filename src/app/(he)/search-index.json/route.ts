import { getCategoryTree, getProducts } from "@/features/catalog/data";
import { buildSearchIndex } from "@/features/search/search-index";

/** Static /search-index.json, generated at build time (see search-index.ts). */
export const dynamic = "force-static";

export async function GET() {
  const [products, tree] = await Promise.all([
    getProducts(),
    getCategoryTree(),
  ]);
  return Response.json(buildSearchIndex(products, tree));
}
