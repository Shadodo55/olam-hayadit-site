import { describe, expect, it } from "vitest";
import { createSearcher, normalizeTerm } from "./search";
import type { IndexProduct, SearchIndex } from "./search-index";

function product(
  id: string,
  he: string,
  en: string,
  sku: string,
  extra: Partial<IndexProduct> = {},
): IndexProduct {
  return {
    id,
    slug: id,
    title: { he, en },
    sku,
    brand: null,
    categories: [{ he: "ידיות למטבח", en: "Kitchen handles" }],
    image: null,
    priceMin: 1000,
    priceMax: 1000,
    isSample: false,
    variants: [
      {
        sku: `${sku}-128-BL`,
        finish: { he: "שחור", en: "Black" },
        size: { he: "128 מ״מ", en: "128 mm" },
        price: 1000,
        stock: "inStore",
      },
    ],
    ...extra,
  };
}

const index: SearchIndex = {
  version: 1,
  products: [
    product("bar", "ידית בר עגולה", "Round bar handle", "KH01"),
    product("knob", "כפתור פליז", "Brass knob", "KN02", {
      categories: [{ he: "כפתורים", en: "Knobs" }],
      variants: [
        {
          sku: "KN02-GO",
          finish: { he: "זהב", en: "Gold" },
          size: null,
          price: 4490,
          stock: "askUs",
        },
      ],
    }),
    product("hinge", "ציר כוס טריקה שקטה", "Soft-close cup hinge", "HG01", {
      categories: [{ he: "צירים", en: "Hinges" }],
    }),
  ],
  categories: [
    {
      path: "/catalog/handles",
      title: { he: "ידיות", en: "Handles" },
      parent: null,
    },
    {
      path: "/catalog/technical/hinges",
      title: { he: "צירים", en: "Hinges" },
      parent: { he: "פרזול טכני", en: "Technical hardware" },
    },
  ],
};

const searcher = createSearcher(index);
const ids = (q: string) => searcher.search(q).products.map((p) => p.id);

describe("normalizeTerm", () => {
  it("removes vowel marks, gershayim and final letters", () => {
    expect(normalizeTerm("ידיוֹת")).toBe("ידיות");
    expect(normalizeTerm("מ״מ")).toBe("ממ");
    expect(normalizeTerm("שלום")).toBe("שלומ");
    expect(normalizeTerm("KH01")).toBe("kh01");
  });
});

describe("search", () => {
  it("finds products by Hebrew prefix", () => {
    expect(ids("ידי")).toContain("bar");
  });

  it("matches across final letters (typing in progress)", () => {
    // "עגולה" typed as "עגול" still matches
    expect(ids("עגול")).toEqual(["bar"]);
  });

  it("finds products by English name", () => {
    expect(ids("brass")).toEqual(["knob"]);
  });

  it("finds by main SKU and by variant SKU, case-insensitive", () => {
    expect(ids("kh01")).toEqual(["bar"]);
    expect(ids("KN02-GO")).toEqual(["knob"]);
  });

  it("finds by finish and category words", () => {
    expect(ids("זהב")).toEqual(["knob"]);
    expect(ids("צירים")).toEqual(["hinge"]);
  });

  it("requires all words (AND)", () => {
    expect(ids("ידית שחור")).toEqual(["bar"]);
    expect(ids("ידית זהב")).toEqual([]);
  });

  it("returns matching categories too", () => {
    expect(searcher.search("ציר").categories.map((c) => c.path)).toContain(
      "/catalog/technical/hinges",
    );
  });

  it("returns nothing for an empty query", () => {
    expect(searcher.search("   ")).toEqual({ products: [], categories: [] });
  });
});
