import type { StockStatus } from "@/commerce/stock";
import type { Product } from "@/features/catalog/product";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/seo/metadata";
import type { SiteSettings } from "@/lib/site/settings";

/**
 * Structured data (schema.org JSON-LD) so search engines can show the store's
 * address, hours and phone, and products' prices. Built only from confirmed
 * CMS facts: a missing fact is left out, never guessed.
 */

const absolute = (path: string) => new URL(path, siteUrl).href;

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** The showroom (home and visit pages). */
export function storeJsonLd(settings: SiteSettings, locale: Locale) {
  const text = (value: Parameters<typeof localized>[0] | null) =>
    value ? localized(value, locale).value : null;
  const street = [text(settings.address.street), text(settings.address.area)]
    .filter(Boolean)
    .join(", ");
  const city = text(settings.address.city);
  const phone = settings.phones.store ?? settings.phones.mobile;
  const sameAs = [settings.social.instagram, settings.social.facebook].filter(
    (url): url is string => Boolean(url),
  );
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": absolute("/#store"),
    name: localized(settings.name, locale).value,
    url: absolute(localeHref(locale, "/")),
    image: absolute("/og.png"),
    ...(phone ? { telephone: phone.e164 } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(street || city
      ? {
          address: {
            "@type": "PostalAddress",
            ...(street ? { streetAddress: street } : {}),
            ...(city ? { addressLocality: city } : {}),
            addressCountry: "IL",
          },
        }
      : {}),
    ...(settings.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.geo.lat,
            longitude: settings.geo.lng,
          },
        }
      : {}),
    openingHoursSpecification: settings.hours.flatMap((day, index) =>
      day
        ? [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: `https://schema.org/${DAYS[index]}`,
              opens: day.opens,
              closes: day.closes,
            },
          ]
        : [],
    ),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

const AVAILABILITY: Partial<Record<StockStatus, string>> = {
  inStore: "https://schema.org/InStock",
  specialOrder: "https://schema.org/BackOrder",
  outOfStock: "https://schema.org/OutOfStock",
  // askUs: no claim either way.
};

/** A product with one offer per variant (price in shekels, VAT included). */
export function productJsonLd(product: Product, locale: Locale) {
  const url = absolute(localeHref(locale, `/product/${product.slug}`));
  const description = product.shortDescription ?? product.seoDescription;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized(product.title, locale).value,
    sku: product.sku,
    url,
    ...(product.images.length
      ? { image: product.images.map((image) => image.src) }
      : {}),
    ...(description
      ? { description: localized(description, locale).value }
      : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand.name } }
      : {}),
    offers: product.variants.map((variant) => {
      const availability = AVAILABILITY[variant.stock];
      return {
        "@type": "Offer",
        sku: variant.sku,
        url: `${url}?sku=${encodeURIComponent(variant.sku)}`,
        price: (variant.price / 100).toFixed(2),
        priceCurrency: "ILS",
        ...(availability ? { availability } : {}),
      };
    }),
  };
}

/** The page's place in the site (from its visible breadcrumbs). */
export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}

/** Renders JSON-LD. `<` is escaped so CMS text can never close the tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
