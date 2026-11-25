import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  facetOptions,
  holeSpacingSizes,
  parseFilters,
  serializeFilters,
  sizeMillimetres,
  sizesAreHoleSpacing,
  sortCards,
  type ProductCardData,
} from "./listing";

function card(
  partial: Partial<ProductCardData> & Pick<ProductCardData, "id">,
): ProductCardData {
  return {
    slug: partial.id,
    title: { he: partial.id },
    sku: partial.id.toUpperCase(),
    brand: null,
    material: null,
    image: null,
    hoverImage: null,
    priceMin: 1000,
    priceMax: 1000,
    stock: "inStore",
    isNew: false,
    isSample: true,
    createdAt: "2026-01-01",
    finishes: [],
    sizes: [],
    variants: [
      { finish: null, size: null, cc: null, price: 1000, stock: "inStore" },
    ],
    ...partial,
  };
}

const gold = {
  slug: "gold",
  name: { he: "זהב", en: "Gold" },
  swatch: "#C9A24B",
};
const black = {
  slug: "black",
  name: { he: "שחור", en: "Black" },
  swatch: "#2B2A28",
};

const cards = [
  card({
    id: "bar",
    title: { he: "ידית בר", en: "Bar handle" },
    brand: { slug: "a", name: "A" },
    finishes: [gold, black],
    priceMin: 4990,
    priceMax: 6990,
    createdAt: "2026-03-01",
    variants: [
      { finish: "gold", size: "128 mm", cc: 128, price: 4990, stock: "askUs" },
      {
        finish: "black",
        size: "160 mm",
        cc: 160,
        price: 6990,
        stock: "inStore",
      },
    ],
  }),
  card({
    id: "knob",
    title: { he: "כפתור", en: "Knob" },
    brand: { slug: "b", name: "B" },
    finishes: [black],
    priceMin: 1990,
    priceMax: 1990,
    isNew: true,
    variants: [
      {
        finish: "black",
        size: null,
        cc: null,
        price: 1990,
        stock: "outOfStock",
      },
    ],
  }),
];

describe("URL state", () => {
  it("round-trips filters through the query string", () => {
    const state = {
      ...emptyFilters,
      finish: ["gold", "black"],
      cc: [160, 128],
      priceMin: 20,
      priceMax: null,
      inStock: true,
      sort: "price-asc" as const,
    };
    const query = serializeFilters(state);
    expect(query).toBe(
      "finish=gold%2Cblack&cc=128%2C160&price=20-&stock=1&sort=price-asc",
    );
    expect(parseFilters(new URLSearchParams(query))).toEqual({
      ...state,
      cc: [128, 160],
    });
  });

  it("ignores junk values", () => {
    const state = parseFilters(
      new URLSearchParams("cc=abc,-5,96&sort=evil&price=x-y&stock=yes"),
    );
    expect(state.cc).toEqual([96]);
    expect(state.sort).toBe("newest");
    expect(state.priceMin).toBeNull();
    expect(state.inStock).toBe(false);
  });

  it("counts active filters", () => {
    expect(activeFilterCount(emptyFilters)).toBe(0);
    expect(
      activeFilterCount({ ...emptyFilters, finish: ["gold"], priceMax: 50 }),
    ).toBe(2);
  });
});

describe("applyFilters", () => {
  it("requires one variant to match all variant filters together", () => {
    const goldAnd160 = { ...emptyFilters, finish: ["gold"], cc: [160] };
    expect(applyFilters(cards, goldAnd160)).toHaveLength(0);
    const goldAnd128 = { ...emptyFilters, finish: ["gold"], cc: [128] };
    expect(applyFilters(cards, goldAnd128).map((c) => c.id)).toEqual(["bar"]);
  });

  it("filters by price range in shekels", () => {
    expect(
      applyFilters(cards, { ...emptyFilters, priceMax: 30 }).map((c) => c.id),
    ).toEqual(["knob"]);
    expect(
      applyFilters(cards, { ...emptyFilters, priceMin: 60 }).map((c) => c.id),
    ).toEqual(["bar"]);
  });

  it("'in stock' means available in the store now", () => {
    expect(
      applyFilters(cards, { ...emptyFilters, inStock: true }).map((c) => c.id),
    ).toEqual(["bar"]);
  });

  it("filters by brand", () => {
    expect(
      applyFilters(cards, { ...emptyFilters, brand: ["b"] }).map((c) => c.id),
    ).toEqual(["knob"]);
  });
});

describe("sortCards", () => {
  it("sorts by price and by newest (new items first)", () => {
    expect(sortCards(cards, "price-asc", "he").map((c) => c.id)).toEqual([
      "knob",
      "bar",
    ]);
    expect(sortCards(cards, "price-desc", "he").map((c) => c.id)).toEqual([
      "bar",
      "knob",
    ]);
    expect(sortCards(cards, "newest", "he").map((c) => c.id)).toEqual([
      "knob",
      "bar",
    ]);
  });
  it("sorts by name in the page language", () => {
    expect(sortCards(cards, "name", "en").map((c) => c.id)).toEqual([
      "bar",
      "knob",
    ]);
  });
});

describe("facetOptions", () => {
  it("counts each option against the other active filters", () => {
    const state = { ...emptyFilters, brand: ["a"] };
    const finishes = facetOptions(cards, state, "finish");
    expect(finishes.map((o) => [o.value, o.count])).toEqual([
      ["gold", 1],
      ["black", 1],
    ]);
    // brand facet ignores the brand filter itself
    expect(facetOptions(cards, state, "brand").map((o) => o.value)).toEqual([
      "a",
      "b",
    ]);
  });

  it("lists hole-to-hole distances numerically and keeps selected ones", () => {
    const state = { ...emptyFilters, cc: [96] };
    expect(
      facetOptions(cards, state, "cc").map((o) => [o.value, o.count]),
    ).toEqual([
      ["96", 0],
      ["128", 1],
      ["160", 1],
    ]);
  });
});

describe("sizes vs hole spacing", () => {
  it("reads the millimetres from a size label", () => {
    expect(sizeMillimetres("128 mm")).toBe(128);
    expect(sizeMillimetres("Large")).toBeNull();
    expect(sizeMillimetres(null)).toBeNull();
  });

  it("knows when sizes only repeat the hole spacing", () => {
    const v = (size: string | null, cc: number | null) => ({ size, cc });
    expect(sizesAreHoleSpacing([v("128 mm", 128), v(null, 96)])).toBe(true);
    expect(sizesAreHoleSpacing([v("128 mm", 128), v("600 mm", null)])).toBe(
      false,
    );
    expect(sizesAreHoleSpacing([v("Large", 128)])).toBe(false);
    expect(sizesAreHoleSpacing([v(null, 128)])).toBe(false);
  });
});

describe("hole-spacing sizes in the catalog", () => {
  it("lists the sizes that only repeat a hole spacing", () => {
    const variant = (size: string | null, cc: number | null) => ({
      finish: null,
      size,
      cc,
      price: 1000,
      stock: "inStore" as const,
    });
    const cards = [
      card({
        id: "bar",
        variants: [variant("128 mm", 128), variant("160 mm", 160)],
      }),
      card({ id: "knob", variants: [variant("Ø25 mm", null)] }),
      card({ id: "odd", variants: [variant("160 mm", 96)] }),
    ];
    expect([...holeSpacingSizes(cards)]).toEqual(["128 mm"]);
  });
});
