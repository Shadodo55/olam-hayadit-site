import { describe, expect, it } from "vitest";
import type { Variant } from "./product";
import {
  defaultSelection,
  findVariant,
  lengthForSize,
  selectFinish,
  selectionForSku,
  selectSize,
  sizesAreHoleSpacingFor,
  variantOptions,
  variantSummary,
  whatsappText,
} from "./variants";

const finish = (slug: string, he: string, en: string) => ({
  id: slug,
  slug,
  name: { he, en },
  swatch: null,
});
const gold = finish("gold", "זהב", "Gold");
const black = finish("black", "שחור", "Black");

function v(
  sku: string,
  f: typeof gold,
  size: string,
  stock: Variant["stock"] = "inStore",
): Variant {
  return {
    sku,
    finish: f,
    sizeLabel: { he: `${size} מ״מ`, en: `${size} mm` },
    holeToHoleMm: Number(size),
    lengthMm: null,
    price: 1000,
    stock,
    shipping: { weightGrams: null, packageMm: null },
  };
}

const variants = [
  v("G128", gold, "128", "outOfStock"),
  v("G160", gold, "160"),
  v("B128", black, "128"),
  v("B320", black, "320"),
];

describe("variant selection", () => {
  it("defaults to the first variant in store", () => {
    expect(defaultSelection(variants)).toEqual({
      finish: "gold",
      size: "160 mm",
    });
  });

  it("keeps the size when the new finish has it", () => {
    const sel = selectFinish(
      variants,
      { finish: "gold", size: "128 mm" },
      "black",
    );
    expect(findVariant(variants, sel)?.sku).toBe("B128");
  });

  it("falls back to a valid size when the new finish lacks it", () => {
    const sel = selectFinish(
      variants,
      { finish: "black", size: "320 mm" },
      "gold",
    );
    expect(findVariant(variants, sel)?.sku).toBe("G128");
  });

  it("switches finish when a size only exists in another finish", () => {
    const sel = selectSize(
      variants,
      { finish: "gold", size: "160 mm" },
      "320 mm",
    );
    expect(findVariant(variants, sel)?.sku).toBe("B320");
  });

  it("selects from a SKU in the URL", () => {
    expect(selectionForSku(variants, "B320")).toEqual({
      finish: "black",
      size: "320 mm",
    });
    expect(selectionForSku(variants, "NOPE")).toBeNull();
  });

  it("lists distinct options in CMS order", () => {
    const { finishes, sizes } = variantOptions(variants);
    expect(finishes.map((f) => f.slug)).toEqual(["gold", "black"]);
    expect(sizes.map((s) => s.key)).toEqual(["128 mm", "160 mm", "320 mm"]);
  });

  it("summarises a variant in the page language", () => {
    expect(variantSummary(variants[2]!, "he")).toBe("שחור, 128 מ״מ");
    expect(variantSummary(variants[2]!, "en")).toBe("Black, 128 mm");
  });
});

describe("whatsappText", () => {
  it("fills name, SKU, details and link", () => {
    const text = whatsappText(
      ({ name, sku, details, url }) => `${name}|${sku}${details}|${url}`,
      {
        name: "ידית",
        sku: "B128",
        url: "https://x/p",
        finishLine: "\nגימור: שחור",
      },
    );
    expect(text).toBe("ידית|B128\nגימור: שחור|https://x/p");
  });
});

describe("hole-spacing sizes", () => {
  it("recognises sizes that are hole-to-hole distances", () => {
    expect(sizesAreHoleSpacingFor(variants)).toBe(true);
    const lengths = [{ ...v("L1", gold, "128"), holeToHoleMm: 96 }];
    expect(sizesAreHoleSpacingFor(lengths)).toBe(false);
  });

  it("gives the overall length for a size, when it differs", () => {
    const withLength = [
      { ...v("G128", gold, "128"), lengthMm: 152 },
      { ...v("G160", gold, "160"), lengthMm: 160 },
    ];
    expect(lengthForSize(withLength, "128 mm")).toBe(152);
    expect(lengthForSize(withLength, "160 mm")).toBeNull();
    expect(lengthForSize(variants, "128 mm")).toBeNull();
  });
});
