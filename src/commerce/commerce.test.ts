import { describe, expect, it } from "vitest";
import {
  excludingVat,
  formatPrice,
  priceRange,
  shekelsToAgorot,
} from "./money";
import { aggregateStock, isAvailable, isStockStatus } from "./stock";

describe("money", () => {
  it("converts shekels to integer agorot without float drift", () => {
    expect(shekelsToAgorot(89.9)).toBe(8990);
    expect(shekelsToAgorot(0.1 + 0.2)).toBe(30);
    expect(shekelsToAgorot(1234)).toBe(123400);
  });

  it("rejects invalid prices", () => {
    expect(() => shekelsToAgorot(-1)).toThrow();
    expect(() => shekelsToAgorot(Number.NaN)).toThrow();
  });

  it("removes 18% VAT", () => {
    expect(excludingVat(11800)).toBe(10000);
  });

  it("formats prices in both languages", () => {
    const he = formatPrice(8990, "he");
    expect(he).toContain("89.90");
    expect(he).toContain("₪");
    expect(formatPrice(12000, "en")).toMatch(/₪\s?120$/);
  });

  it("computes a price range", () => {
    expect(priceRange([4990, 2990, 8990])).toEqual({ min: 2990, max: 8990 });
    expect(priceRange([])).toBeNull();
  });
});

describe("stock", () => {
  it("validates statuses", () => {
    expect(isStockStatus("inStore")).toBe(true);
    expect(isStockStatus("soldOut")).toBe(false);
  });

  it("picks the best availability across variants", () => {
    expect(aggregateStock(["outOfStock", "askUs", "inStore"])).toBe("inStore");
    expect(aggregateStock(["outOfStock", "specialOrder"])).toBe("specialOrder");
    expect(aggregateStock(["outOfStock"])).toBe("outOfStock");
    expect(aggregateStock([])).toBe("askUs");
  });

  it("treats only out-of-stock as unavailable", () => {
    expect(isAvailable("askUs")).toBe(true);
    expect(isAvailable("outOfStock")).toBe(false);
  });
});
