import { describe, expect, it } from "vitest";
import {
  allCategorySlugPaths,
  buildCategoryTree,
  findCategoryChain,
  type RawCategory,
} from "./category-tree";
import { mapProduct, type RawProduct } from "./product";

const raw: RawCategory[] = [
  {
    _id: "c-door",
    slug: "door",
    title: { he: "ידיות לדלתות" },
    parent: "c-handles",
    order: 2,
  },
  {
    _id: "c-handles",
    slug: "handles",
    title: { he: "ידיות" },
    allLabel: { he: "כל הידיות" },
    order: 1,
  },
  {
    _id: "c-knobs",
    slug: "knobs",
    title: { he: "כפתורים" },
    parent: "c-handles",
    order: 1,
  },
  { _id: "c-bath", slug: "bathroom", title: { he: "אמבטיה" }, order: 2 },
  {
    _id: "c-orphan",
    slug: "orphan",
    title: { he: "יתום" },
    parent: "c-missing",
    order: 3,
  },
  { _id: "c-draft", slug: null, title: { he: "ללא כתובת" } },
];

describe("buildCategoryTree", () => {
  const tree = buildCategoryTree(raw);

  it("nests children under parents and sorts by order", () => {
    expect(tree.map((c) => c.slug)).toEqual(["handles", "bathroom", "orphan"]);
    expect(tree[0]?.children?.map((c) => c.slug)).toEqual(["knobs", "door"]);
  });

  it("falls back to the title for the 'all' label", () => {
    expect(tree[0]?.allLabel.he).toBe("כל הידיות");
    expect(tree[1]?.allLabel.he).toBe("אמבטיה");
  });

  it("finds chains and lists all paths", () => {
    expect(
      findCategoryChain(tree, ["handles", "door"])?.map((c) => c.id),
    ).toEqual(["c-handles", "c-door"]);
    expect(findCategoryChain(tree, ["door"])).toBeNull();
    expect(allCategorySlugPaths(tree)).toContainEqual(["handles", "knobs"]);
  });
});

const baseProduct: RawProduct = {
  _id: "p1",
  slug: "round-bar",
  sku: "BH01",
  title: { he: "ידית בר", en: "Bar handle" },
  variants: [
    { sku: "BH01-128-BK", price: 49.9, stock: "outOfStock", holeToHoleMm: 128 },
    { sku: "BH01-160-BK", price: 54.9, stock: "askUs", holeToHoleMm: 160 },
    { sku: "BH01-BAD", price: 0 },
  ],
  specs: [
    { label: { he: "קוטר" }, value: { he: "12 מ״מ" } },
    { label: { he: "משקל" }, value: { he: "" } },
  ],
};

describe("mapProduct", () => {
  it("converts prices to agorot and computes the range and stock", () => {
    const product = mapProduct(baseProduct)!;
    expect(product.variants.map((v) => v.price)).toEqual([4990, 5490]);
    expect(product.price).toEqual({ min: 4990, max: 5490 });
    expect(product.stock).toBe("askUs");
  });

  it("hides empty spec rows", () => {
    expect(mapProduct(baseProduct)!.specs).toHaveLength(1);
  });

  it("skips incomplete products", () => {
    expect(mapProduct({ ...baseProduct, slug: null })).toBeNull();
    expect(mapProduct({ ...baseProduct, title: { he: " " } })).toBeNull();
    expect(
      mapProduct({ ...baseProduct, variants: [{ sku: "x", price: null }] }),
    ).toBeNull();
  });

  it("defaults an unknown stock value to 'ask us'", () => {
    const product = mapProduct({
      ...baseProduct,
      variants: [{ sku: "a", price: 10, stock: "weird" }],
    })!;
    expect(product.variants[0]?.stock).toBe("askUs");
  });
});
