import { defineArrayMember, defineField, defineType } from "sanity";
import { API_VERSION, slugify } from "../../lib/constants";
import { requireHebrew } from "../objects/localized";

const MAX_IMAGES = 4;

export const product = defineType({
  name: "product",
  title: "מוצר",
  type: "document",
  groups: [
    { name: "main", title: "פרטים", default: true },
    { name: "variants", title: "גרסאות ומחירים" },
    { name: "media", title: "תמונות" },
    { name: "specs", title: "מפרט" },
    { name: "more", title: "עוד" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "שם המוצר",
      type: "localeString",
      group: "main",
      validation: requireHebrew,
    }),
    defineField({
      name: "sku",
      title: "מק״ט ראשי",
      description:
        "מק״ט הדגם. לכל גרסה (גימור/מידה) יש בנוסף מק״ט משלה, בלשונית ״גרסאות ומחירים״.",
      type: "string",
      group: "main",
      validation: (rule) =>
        rule.required().custom(async (sku, context) => {
          if (!sku) return true;
          const id = context.document?._id.replace(/^drafts\./, "") ?? "";
          const count = await context
            .getClient({ apiVersion: API_VERSION })
            .fetch<number>(
              `count(*[_type == "product" && sku == $sku && !(_id in [$id, "drafts." + $id])])`,
              { sku, id },
            );
          return count === 0 ? true : "המק״ט הזה כבר קיים במוצר אחר";
        }),
    }),
    defineField({
      name: "slug",
      title: "כתובת באתר",
      description: "נוצרת אוטומטית מהשם באנגלית או מהמק״ט. לחצו Generate.",
      type: "slug",
      group: "main",
      options: {
        source: (doc) => {
          const d = doc as { title?: { en?: string }; sku?: string };
          return d.title?.en || d.sku || "";
        },
        slugify,
      },
      validation: (r) => r.required().error("לחצו Generate כדי ליצור כתובת"),
    }),
    defineField({
      name: "categories",
      title: "קטגוריות",
      description:
        "אפשר לשייך לכמה קטגוריות. בחרו את הקטגוריה המדויקת ביותר (למשל ״ידיות לדלתות״).",
      type: "array",
      group: "main",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "category" }] }),
      ],
      validation: (r) =>
        r.required().min(1).unique().error("בחרו לפחות קטגוריה אחת"),
    }),
    defineField({
      name: "brand",
      title: "מותג",
      type: "reference",
      to: [{ type: "brand" }],
      group: "main",
    }),
    defineField({
      name: "shortDescription",
      title: "תיאור קצר",
      description: "משפט אחד או שניים שיופיעו ליד המחיר.",
      type: "localeText",
      group: "main",
    }),
    defineField({
      name: "isNew",
      title: "חדש בחנות",
      type: "boolean",
      initialValue: false,
      group: "main",
    }),
    defineField({
      name: "featured",
      title: "להציג בדף הבית",
      type: "boolean",
      initialValue: false,
      group: "main",
    }),

    defineField({
      name: "variants",
      title: "גרסאות ומחירים",
      description:
        "לכל גימור ומידה, גרסה נפרדת עם מחיר ומלאי. גם למוצר עם גרסה אחת צריך למלא כאן.",
      type: "array",
      group: "variants",
      of: [defineArrayMember({ type: "variant" })],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("הוסיפו לפחות גרסה אחת עם מחיר")
          .custom((variants: { sku?: string }[] | undefined) => {
            const skus = (variants ?? []).map((v) => v.sku).filter(Boolean);
            return new Set(skus).size === skus.length
              ? true
              : "יש שתי גרסאות עם אותו מק״ט";
          }),
    }),

    defineField({
      name: "images",
      title: "תמונות",
      description: `עד ${MAX_IMAGES} תמונות. הראשונה היא התמונה הראשית. רצוי רקע אחיד ובהיר.`,
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "altImage" })],
      options: { layout: "grid" },
      validation: (r) =>
        r.max(MAX_IMAGES).error(`אפשר עד ${MAX_IMAGES} תמונות למוצר`),
    }),

    defineField({
      name: "material",
      title: "חומר",
      type: "reference",
      to: [{ type: "material" }],
      group: "specs",
    }),
    defineField({
      name: "specs",
      title: "מפרט טכני",
      description: "שורות כמו ״עובי: 12 מ״מ״. שורות ריקות לא יוצגו באתר.",
      type: "array",
      group: "specs",
      of: [defineArrayMember({ type: "specRow" })],
    }),
    defineField({
      name: "description",
      title: "תיאור מלא",
      type: "localeText",
      group: "specs",
    }),

    defineField({
      name: "related",
      title: "מוצרים קשורים",
      type: "array",
      group: "more",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (r) => r.max(8).unique(),
    }),
    defineField({
      name: "seoDescription",
      title: "תיאור לגוגל (לא חובה)",
      type: "localeText",
      group: "more",
    }),
    defineField({
      name: "isSample",
      title: "מוצר לדוגמה",
      description: "מוצרים לדוגמה יימחקו לפני ההשקה. אל תסמנו מוצרים אמיתיים.",
      type: "boolean",
      initialValue: false,
      group: "more",
    }),
  ],
  orderings: [
    {
      title: "שם",
      name: "titleAsc",
      by: [{ field: "title.he", direction: "asc" }],
    },
    {
      title: "חדשים קודם",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title.he",
      sku: "sku",
      media: "images.0",
      isSample: "isSample",
      price: "variants.0.price",
    },
    prepare: ({ title, sku, media, isSample, price }) => ({
      title: `${isSample ? "[דוגמה] " : ""}${title ?? "ללא שם"}`,
      subtitle: [sku, typeof price === "number" ? `מ-₪${price}` : ""]
        .filter(Boolean)
        .join("  |  "),
      media,
    }),
  },
});
