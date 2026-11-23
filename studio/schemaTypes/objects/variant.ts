import { defineField, defineType } from "sanity";
import { STOCK_STATUSES } from "../../lib/constants";

/**
 * One purchasable version of a product (finish × size). Variants live inside
 * the product document (not separate documents) to stay well within the
 * Sanity free plan's document limit.
 */
export const variant = defineType({
  name: "variant",
  title: "גרסה (גימור / מידה)",
  type: "object",
  fieldsets: [
    {
      name: "shipping",
      title: "משקל ואריזה (למשלוחים בעתיד, לא חובה)",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "sku",
      title: "מק״ט",
      description: "המק״ט של הגרסה הזו, כפי שמופיע אצל הספק או בקופה.",
      type: "string",
      validation: (r) => r.required().error("חובה למלא מק״ט"),
    }),
    defineField({
      name: "finish",
      title: "גימור / צבע",
      type: "reference",
      to: [{ type: "finish" }],
    }),
    defineField({
      name: "sizeLabel",
      title: "מידה (כמו שתופיע באתר)",
      description: "למשל: 128 מ״מ, 30 ס״מ, M8. אפשר להשאיר ריק אם יש מידה אחת.",
      type: "localeString",
    }),
    defineField({
      name: "holeToHoleMm",
      title: "מרחק בין חורים, מרכז-מרכז (מ״מ)",
      description: "לידיות בלבד. משמש לסינון באתר.",
      type: "number",
      validation: (r) => r.positive().integer(),
    }),
    defineField({
      name: "lengthMm",
      title: "אורך כולל (מ״מ)",
      type: "number",
      validation: (r) => r.positive(),
    }),
    defineField({
      name: "price",
      title: "מחיר כולל מע״מ (₪)",
      description: "המחיר לצרכן, כולל מע״מ. אפשר עם אגורות, למשל 89.90.",
      type: "number",
      validation: (r) =>
        r.required().positive().precision(2).error("חובה למלא מחיר חיובי"),
    }),
    defineField({
      name: "stock",
      title: "מלאי",
      type: "string",
      options: { list: [...STOCK_STATUSES], layout: "radio" },
      initialValue: "inStore",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "weightGrams",
      title: "משקל (גרם)",
      type: "number",
      fieldset: "shipping",
    }),
    defineField({
      name: "packageLengthMm",
      title: "אריזה: אורך (מ״מ)",
      type: "number",
      fieldset: "shipping",
    }),
    defineField({
      name: "packageWidthMm",
      title: "אריזה: רוחב (מ״מ)",
      type: "number",
      fieldset: "shipping",
    }),
    defineField({
      name: "packageHeightMm",
      title: "אריזה: גובה (מ״מ)",
      type: "number",
      fieldset: "shipping",
    }),
  ],
  preview: {
    select: {
      sku: "sku",
      finish: "finish.name.he",
      size: "sizeLabel.he",
      price: "price",
      stock: "stock",
    },
    prepare: ({ sku, finish, size, price, stock }) => ({
      title: [finish, size].filter(Boolean).join(" · ") || sku,
      subtitle: [
        sku,
        typeof price === "number" ? `₪${price.toFixed(2)}` : "",
        STOCK_STATUSES.find((s) => s.value === stock)?.title,
      ]
        .filter(Boolean)
        .join("  |  "),
    }),
  },
});

export const specRow = defineType({
  name: "specRow",
  title: "שורת מפרט",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "מאפיין (למשל: עובי)",
      type: "localeString",
    }),
    defineField({
      name: "value",
      title: "ערך (למשל: 12 מ״מ)",
      type: "localeString",
    }),
  ],
  preview: {
    select: { label: "label.he", value: "value.he" },
    prepare: ({ label, value }) => ({
      title: `${label ?? ""}: ${value ?? ""}`,
    }),
  },
});
