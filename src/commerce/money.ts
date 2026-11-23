/**
 * Money is always an integer number of agorot (1 ₪ = 100 agorot), INCLUDING
 * VAT. Never do arithmetic on floating-point shekels. The CMS stores shekels
 * with 2 decimals for the owner's convenience; convert at the data boundary.
 */
export type Agorot = number;

/** Israeli VAT rate (18% since 1 January 2025). */
export const VAT_RATE = 0.18;

export function shekelsToAgorot(shekels: number): Agorot {
  if (!Number.isFinite(shekels) || shekels < 0)
    throw new Error(`Invalid price: ${shekels}`);
  return Math.round(shekels * 100);
}

/** Price before VAT, for future trade/professional pricing. */
export function excludingVat(priceIncVat: Agorot): Agorot {
  return Math.round(priceIncVat / (1 + VAT_RATE));
}

export function formatPrice(agorot: Agorot, locale: "he" | "en"): string {
  const whole = agorot % 100 === 0;
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(agorot / 100);
}

export interface PriceRange {
  min: Agorot;
  max: Agorot;
}

export function priceRange(prices: readonly Agorot[]): PriceRange | null {
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
