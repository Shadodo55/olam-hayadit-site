import { describe, expect, it } from "vitest";
import { switchLocalePath } from "@/lib/i18n/locales";
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
