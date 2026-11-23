import { describe, expect, it } from "vitest";
import type { SearchIndex } from "@/features/search/search-index";
import { estimatedTotal, listMessage, resolveList } from "./resolve";

const index: SearchIndex = {
  version: 1,
  categories: [],
  products: [
    {
      id: "p1",
      slug: "bar",
      title: { he: "ידית בר", en: "Bar handle" },
      sku: "KH01",
      brand: null,
      categories: [],
      image: null,
      priceMin: 4990,
      priceMax: 5490,
      isSample: false,
      variants: [
        {
          sku: "KH01-128-BL",
          finish: { he: "שחור", en: "Black" },
          size: { he: "128 מ״מ", en: "128 mm" },
          price: 4990,
          stock: "inStore",
        },
        {
          sku: "KH01-160-BL",
          finish: { he: "שחור", en: "Black" },
          size: null,
          price: 5490,
          stock: "askUs",
        },
      ],
    },
  ],
};

const list = {
  version: 1 as const,
  items: [
    { sku: "KH01-128-BL", slug: "bar", qty: 3, addedAt: "" },
    { sku: "GONE-1", slug: "gone", qty: 1, addedAt: "" },
    { sku: "KH01-160-BL", slug: "bar", qty: 1, addedAt: "" },
  ],
};

describe("my list resolution", () => {
  const lines = resolveList(list, index);

  it("joins saved SKUs with current catalog data and flags removed products", () => {
    expect(lines.map((l) => [l.sku, Boolean(l.product)])).toEqual([
      ["KH01-128-BL", true],
      ["GONE-1", false],
      ["KH01-160-BL", true],
    ]);
  });

  it("totals only available lines, using current prices", () => {
    expect(estimatedTotal(lines)).toBe(4990 * 3 + 5490);
  });

  it("builds a numbered WhatsApp message without unavailable items", () => {
    const text = listMessage(lines, "he", {
      intro: "שלום",
      outro: "תודה",
      line: ({ index, name, sku, details, qty }) =>
        `${index}. ${name} | ${sku}${details} | ${qty}`,
    });
    expect(text).toBe(
      [
        "שלום",
        "1. ידית בר | KH01-128-BL | שחור, 128 מ״מ | 3",
        "2. ידית בר | KH01-160-BL | שחור | 1",
        "תודה",
      ].join("\n"),
    );
  });
});
