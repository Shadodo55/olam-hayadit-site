import { describe, expect, it } from "vitest";
import { switchLocalePath } from "@/lib/i18n/locales";
import { comingSoonSlugs, pageKeyForPath } from "./routes";

describe("routes", () => {
  it("pre-renders every planned page that isn't built yet", () => {
    const paths = comingSoonSlugs().map((s) => `/${s.join("/")}`);
    expect(paths).toContain("/visit");
    expect(paths).not.toContain("/catalog");
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
