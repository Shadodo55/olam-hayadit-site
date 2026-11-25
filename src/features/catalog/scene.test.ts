import { describe, expect, it } from "vitest";
import type { Category } from "./category-tree";
import { resolveScene, toSceneSetting } from "./scene";

const cat = (
  id: string,
  scene: Category["scene"],
  children?: Category[],
): Category => ({
  id,
  slug: id,
  name: { he: id },
  allLabel: { he: id },
  description: null,
  filters: [],
  scene,
  ...(children ? { children } : {}),
});

const tree = [
  cat("handles", "kitchenBar", [cat("door", "doorLever"), cat("knobs", null)]),
  cat("bath", "towelBar"),
  cat("technical", null, [cat("hinges", null)]),
];

describe("resolveScene", () => {
  it("uses the category's own scene", () => {
    expect(resolveScene({ scene: null, categoryIds: ["door"] }, tree)).toBe(
      "doorLever",
    );
  });
  it("inherits from the parent category", () => {
    expect(resolveScene({ scene: null, categoryIds: ["knobs"] }, tree)).toBe(
      "kitchenBar",
    );
  });
  it("lets the product override, including switching it off", () => {
    expect(
      resolveScene({ scene: "wallHook", categoryIds: ["bath"] }, tree),
    ).toBe("wallHook");
    expect(resolveScene({ scene: "none", categoryIds: ["bath"] }, tree)).toBe(
      null,
    );
  });
  it("has no scene where no category sets one", () => {
    expect(resolveScene({ scene: null, categoryIds: ["hinges"] }, tree)).toBe(
      null,
    );
    expect(resolveScene({ scene: null, categoryIds: ["missing"] }, tree)).toBe(
      null,
    );
  });
  it("accepts only known values from the CMS", () => {
    expect(toSceneSetting("towelBar")).toBe("towelBar");
    expect(toSceneSetting("none")).toBe("none");
    expect(toSceneSetting("spaceship")).toBe(null);
    expect(toSceneSetting(undefined)).toBe(null);
  });
});
