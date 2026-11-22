import { describe, expect, it } from "vitest";
import { localeHref, localized } from "./locales";

describe("localeHref", () => {
  it("keeps Hebrew at the root", () => {
    expect(localeHref("he")).toBe("/");
    expect(localeHref("he", "/visit")).toBe("/visit");
  });
  it("prefixes English with /en", () => {
    expect(localeHref("en")).toBe("/en");
    expect(localeHref("en", "visit")).toBe("/en/visit");
  });
});

describe("localized", () => {
  it("returns the English value when present", () => {
    expect(localized({ he: "ידית", en: "Handle" }, "en")).toEqual({
      value: "Handle",
      lang: "en",
      isFallback: false,
    });
  });
  it("falls back to Hebrew and flags it, so the element can get lang=he", () => {
    expect(localized({ he: "ידית", en: "" }, "en")).toEqual({
      value: "ידית",
      lang: "he",
      isFallback: true,
    });
    expect(localized({ he: "ידית" }, "en").isFallback).toBe(true);
  });
  it("never flags Hebrew pages as fallback", () => {
    expect(localized({ he: "ידית", en: "Handle" }, "he").isFallback).toBe(
      false,
    );
  });
});
