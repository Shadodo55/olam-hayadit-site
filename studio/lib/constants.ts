export const API_VERSION = "2025-08-15";

/** Documents that exist exactly once (fixed IDs). */
export const SINGLETONS = ["siteSettings", "homePage"] as const;

export const STOCK_STATUSES = [
  { title: "במלאי בחנות", value: "inStore" },
  { title: "לבירור מול החנות", value: "askUs" },
  { title: "בהזמנה מיוחדת", value: "specialOrder" },
  { title: "אזל מהמלאי", value: "outOfStock" },
] as const;

/** Filters a category page can show (phase 4). */
export const CATEGORY_FILTERS = [
  { title: "מותג", value: "brand" },
  { title: "גימור / צבע", value: "finish" },
  { title: "חומר", value: "material" },
  { title: "מידה", value: "size" },
  { title: "מרחק בין חורים (מרכז-מרכז)", value: "holeToHole" },
  { title: "טווח מחירים", value: "price" },
  { title: "במלאי בלבד", value: "inStock" },
] as const;

/** URL-safe slug from English text or SKU (Hebrew titles don't make good URLs). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
