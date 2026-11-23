import { describe, expect, it } from "vitest";
import { formatFileSize } from "./data";

describe("formatFileSize", () => {
  it("shows MB with one decimal and KB for small files", () => {
    expect(formatFileSize(2.45 * 1024 * 1024, "en")).toMatch(/2\.5\s?MB/);
    expect(formatFileSize(98_368, "en")).toMatch(/96\s?kB/i);
    expect(formatFileSize(10, "en")).toMatch(/1\s?kB/i);
  });
  it("works in Hebrew", () => {
    expect(formatFileSize(3 * 1024 * 1024, "he")).toMatch(/3/);
  });
});
