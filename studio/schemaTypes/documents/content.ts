import { defineArrayMember, defineField, defineType } from "sanity";
import { slugify } from "../../lib/constants";
import { requireHebrew } from "../objects/localized";

export const project = defineType({
  name: "project",
  title: "פרויקט / השראה",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "שם הפרויקט",
      type: "localeString",
      validation: requireHebrew,
    }),
    defineField({
      name: "slug",
      title: "כתובת באתר",
      type: "slug",
      options: { source: "title.en", slugify },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cover",
      title: "תמונה ראשית",
      type: "altImage",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "gallery",
      title: "גלריה",
      type: "array",
      of: [defineArrayMember({ type: "altImage" })],
      options: { layout: "grid" },
      validation: (r) => r.max(12),
    }),
    defineField({ name: "description", title: "תיאור", type: "localeText" }),
    defineField({
      name: "products",
      title: "מוצרים שמופיעים בפרויקט",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({ name: "completedAt", title: "תאריך", type: "date" }),
    defineField({
      name: "isSample",
      title: "פרויקט לדוגמה",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: { select: { title: "title.he", media: "cover" } },
});

export const catalogFile = defineType({
  name: "catalogFile",
  title: "קטלוג להורדה",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "שם הקטלוג",
      type: "localeString",
      validation: requireHebrew,
    }),
    defineField({
      name: "file",
      title: "קובץ PDF",
      description: "רצוי עד 20MB. גודל הקובץ יוצג באתר אוטומטית.",
      type: "file",
      options: { accept: "application/pdf" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "cover", title: "תמונת שער", type: "altImage" }),
    defineField({
      name: "language",
      title: "שפת הקטלוג",
      type: "string",
      options: {
        list: [
          { title: "עברית", value: "he" },
          { title: "אנגלית", value: "en" },
          { title: "שפה אחרת / ללא טקסט", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "he",
    }),
    defineField({
      name: "brand",
      title: "מותג (לא חובה)",
      type: "reference",
      to: [{ type: "brand" }],
    }),
    defineField({
      name: "order",
      title: "סדר",
      type: "number",
      initialValue: 10,
    }),
  ],
  preview: { select: { title: "title.he", media: "cover" } },
});

export const faq = defineType({
  name: "faq",
  title: "שאלה נפוצה",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "שאלה",
      type: "localeString",
      validation: requireHebrew,
    }),
    defineField({
      name: "answer",
      title: "תשובה",
      type: "localeText",
      validation: requireHebrew,
    }),
    defineField({
      name: "order",
      title: "סדר",
      type: "number",
      initialValue: 10,
    }),
  ],
  orderings: [
    { title: "סדר", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "question.he" } },
});

export const page = defineType({
  name: "page",
  title: "עמוד תוכן",
  description: "אודות, הצהרת נגישות, מדיניות פרטיות, תנאי שימוש ועוד.",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "כותרת",
      type: "localeString",
      validation: requireHebrew,
    }),
    defineField({
      name: "slug",
      title: "מזהה העמוד",
      description:
        "אל תשנו עמודים קיימים (about, accessibility, privacy, terms, cookies).",
      type: "slug",
      options: { source: "title.en", slugify },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "תוכן",
      type: "localeBlocks",
      validation: requireHebrew,
    }),
    defineField({
      name: "legalDraft",
      title: "טיוטה משפטית שעדיין לא נבדקה ע״י עורך דין",
      description: "כל עוד מסומן, יוצג באתר שהעמוד בבדיקה משפטית.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "lastReviewed",
      title: "תאריך עדכון אחרון",
      type: "date",
    }),
  ],
  preview: { select: { title: "title.he", subtitle: "slug.current" } },
});
