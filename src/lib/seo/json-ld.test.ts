import { describe, expect, it } from "vitest";
import type { Product } from "@/features/catalog/product";
import { fallbackSettings } from "@/lib/site/settings";
import { breadcrumbJsonLd, productJsonLd, storeJsonLd } from "./json-ld";

describe("store structured data", () => {
  it("uses the confirmed address, phone and weekly hours", () => {
    const data = storeJsonLd(fallbackSettings, "he");
    expect(data["@type"]).toBe("HardwareStore");
    expect(data.address).toMatchObject({
      streetAddress: "יד חרוצים 16, אזור התעשייה תלפיות",
      addressLocality: "ירושלים",
      addressCountry: "IL",
    });
    expect(data.telephone).toBe("+97226749235");
    // Six open days; Saturday (closed) is left out.
    expect(data.openingHoursSpecification).toHaveLength(6);
    expect(data.openingHoursSpecification[5]).toMatchObject({
      dayOfWeek: "https://schema.org/Friday",
      opens: "07:30",
      closes: "13:00",
    });
    // Unknown facts are left out, never guessed.
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("geo");
  });
});

describe("product structured data", () => {
  const product = {
    slug: "bar",
    title: { he: "ידית בר", en: "Bar handle" },
    sku: "B1",
    shortDescription: null,
    seoDescription: null,
    brand: { id: "b", name: "Brand", slug: "brand" },
    images: [],
    variants: [
      { sku: "B1-128", price: 4990, stock: "inStore" },
      { sku: "B1-160", price: 5990, stock: "askUs" },
    ],
  } as unknown as Product;

  it("lists one offer per variant, in shekels", () => {
    const data = productJsonLd(product, "en");
    expect(data.name).toBe("Bar handle");
    expect(data.offers).toEqual([
      expect.objectContaining({
        sku: "B1-128",
        price: "49.90",
        priceCurrency: "ILS",
        availability: "https://schema.org/InStock",
      }),
      expect.not.objectContaining({ availability: expect.anything() }),
    ]);
    expect(data.offers[0]?.url).toMatch(/\/en\/product\/bar\?sku=B1-128$/);
  });
});

describe("breadcrumb structured data", () => {
  it("numbers the trail and links all but the current page", () => {
    const data = breadcrumbJsonLd([
      { label: "Home", href: "/" },
      { label: "Handles" },
    ]);
    expect(data.itemListElement).toEqual([
      expect.objectContaining({
        position: 1,
        name: "Home",
        item: expect.stringMatching(/\/$/),
      }),
      { "@type": "ListItem", position: 2, name: "Handles" },
    ]);
  });
});
