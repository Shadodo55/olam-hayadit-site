import { describe, expect, it } from "vitest";
import { buildCategoryTree } from "@/features/catalog/category-tree";
import { switchLocalePath } from "@/lib/i18n/locales";
import { comingSoonSlugs, pageKeyForPath } from "./routes";

const tree = buildCategoryTree([
  { _id: "h", slug: "handles", title: { he: "ידיות" }, order: 1 },
  {
    _id: "d",
    slug: "door",
    title: { he: "ידיות לדלתות" },
    parent: "h",
    order: 1,
  },
]);

describe("routes", () => {
  it("pre-renders every planned page and category", () => {
    const paths = comingSoonSlugs(tree).map((s) => `/${s.join("/")}`);
    expect(paths).toContain("/visit");
    expect(paths).toContain("/catalog");
    expect(paths).toContain("/catalog/handles");
    expect(paths).toContain("/catalog/handles/door");
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("maps a path back to its page key", () => {
    expect(pageKeyForPath("/measuring-guide")).toBe("measuringGuide");
    expect(pageKeyForPath("/nope")).toBeNull();
  });
});

describe("switchLocalePath", () => {
  it("maps Hebrew pages to English and back", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/visit", "en")).toBe("/en/visit");
    expect(switchLocalePath("/en", "he")).toBe("/");
    expect(switchLocalePath("/en/catalog/handles", "he")).toBe(
      "/catalog/handles",
    );
  });
  it("does not confuse Hebrew paths that start with 'en'", () => {
    expect(switchLocalePath("/entrance", "en")).toBe("/en/entrance");
  });
});
