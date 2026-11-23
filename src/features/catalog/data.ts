import { sanityFetch } from "@/lib/sanity/client";
import { IMAGE_PROJECTION } from "@/lib/sanity/image";
import {
  buildCategoryTree,
  type Category,
  type RawCategory,
} from "./category-tree";
import { mapProduct, type Product, type RawProduct } from "./product";

const CATEGORIES_QUERY = `*[_type == "category"]{
  _id, "slug": slug.current, title, allLabel, description, filters,
  "parent": parent._ref, order
}`;

export async function getCategoryTree(): Promise<Category[]> {
  return buildCategoryTree(await sanityFetch<RawCategory[]>(CATEGORIES_QUERY));
}

export const PRODUCT_PROJECTION = `{
  _id,
  "slug": slug.current,
  title,
  sku,
  shortDescription,
  description,
  isNew,
  featured,
  isSample,
  _createdAt,
  "categoryIds": categories[]._ref,
  "brand": brand->{ _id, name, "slug": slug.current },
  "material": material->{ _id, name, "slug": slug.current },
  "images": images[] ${IMAGE_PROJECTION},
  "specs": specs[]{ label, value },
  "variants": variants[]{
    sku, sizeLabel, holeToHoleMm, lengthMm, price, stock,
    weightGrams, packageLengthMm, packageWidthMm, packageHeightMm,
    "finish": finish->{ _id, name, "slug": slug.current, swatch }
  },
  "relatedIds": related[]._ref,
  seoDescription
}`;

/** All products (used for listings, search index and product pages). */
export async function getProducts(): Promise<Product[]> {
  const raw = await sanityFetch<RawProduct[]>(
    `*[_type == "product" && defined(slug.current)] ${PRODUCT_PROJECTION}`,
  );
  return raw.map(mapProduct).filter((p): p is Product => p !== null);
}
