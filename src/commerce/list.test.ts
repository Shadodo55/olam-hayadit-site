import { describe, expect, it } from "vitest";
import {
  addItem,
  emptyList,
  MAX_QTY,
  parseList,
  removeItem,
  setQty,
  totalQty,
} from "./list";

const now = new Date("2026-11-23T10:00:00Z");
const a = { sku: "A-1", slug: "a" };
const b = { sku: "B-1", slug: "b" };

describe("my list", () => {
  it("adds items and increases quantity for the same SKU", () => {
    let list = addItem(emptyList, a, 1, now);
    list = addItem(list, b, 2, now);
    list = addItem(list, a, 1, now);
    expect(list.items.map((i) => [i.sku, i.qty])).toEqual([
      ["A-1", 2],
      ["B-1", 2],
    ]);
    expect(totalQty(list)).toBe(4);
  });

  it("clamps quantities and removes on zero", () => {
    let list = addItem(emptyList, a, 1, now);
    list = setQty(list, "A-1", 5000);
    expect(list.items[0]?.qty).toBe(MAX_QTY);
    list = setQty(list, "A-1", 0);
    expect(list.items).toHaveLength(0);
  });

  it("removes by SKU", () => {
    const list = removeItem(
      addItem(addItem(emptyList, a, 1, now), b, 1, now),
      "A-1",
    );
    expect(list.items.map((i) => i.sku)).toEqual(["B-1"]);
  });

  it("parses stored data defensively", () => {
    expect(parseList(null)).toEqual(emptyList);
    expect(parseList("not json")).toEqual(emptyList);
    expect(parseList('{"items": "nope"}')).toEqual(emptyList);
    const parsed = parseList(
      JSON.stringify({
        version: 1,
        items: [
          { sku: "A-1", slug: "a", qty: 2, addedAt: "x" },
          { sku: "A-1", slug: "a", qty: 9, addedAt: "y" },
          { sku: 5, slug: "bad", qty: 1 },
          { sku: "C-1", slug: "c", qty: 0 },
        ],
      }),
    );
    expect(parsed.items).toEqual([
      { sku: "A-1", slug: "a", qty: 2, addedAt: "x" },
    ]);
  });
});
