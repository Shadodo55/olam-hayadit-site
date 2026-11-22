import { describe, expect, it } from "vitest";
import { parseConsent } from "./consent-store";

describe("parseConsent", () => {
  it("accepts a valid stored decision", () => {
    expect(
      parseConsent(
        '{"analytics":false,"media":true,"decidedAt":"2026-11-23T10:00:00.000Z"}',
      ),
    ).toEqual({
      analytics: false,
      media: true,
      decidedAt: "2026-11-23T10:00:00.000Z",
    });
  });

  it("treats missing or corrupted values as 'not decided yet'", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("not json")).toBeNull();
    expect(
      parseConsent('{"analytics":"yes","media":true,"decidedAt":"x"}'),
    ).toBeNull();
    expect(parseConsent('{"analytics":true}')).toBeNull();
  });

  it("drops unknown fields", () => {
    expect(
      parseConsent(
        '{"analytics":true,"media":false,"decidedAt":"d","marketing":true}',
      ),
    ).toEqual({ analytics: true, media: false, decidedAt: "d" });
  });
});
