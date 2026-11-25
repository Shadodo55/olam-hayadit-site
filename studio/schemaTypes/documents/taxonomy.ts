import { defineArrayMember, defineField, defineType } from "sanity";
import { CATEGORY_FILTERS, SCENES, slugify } from "../../lib/constants";
import { requireHebrew } from "../objects/localized";

const slugField = (source: string, description?: string) =>
  defineField({
    name: "slug",
    title: "כתובת באתר",
    description: description ?? "באותיות באנגלית. לחצו Generate.",
    type: "slug",
    options: { source, slugify },
    validation: (r) => r.required(),
  });

export const category = defineType({
  name: "category",
  title: "קטגוריה",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "שם הקטגוריה",
      type: "localeString",
      validation: requireHebrew,
    }),
    slugField("title.en"),
    defineField({
      name: "parent",
      title: "קטגוריית אב",
      description:
        "השאירו ריק לקטגוריה ראשית. למשל ״ידיות לדלתות״ שייכת ל״ידיות״.",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: ({ document }) => ({
          filter: "_id != $id && !defined(parent->parent)",
          params: { id: document._id.replace(/^drafts\./, "") },
        }),
      },
    }),
    defineField({
      name: "allLabel",
      title: "כיתוב לקישור ״הכל״ בתפריט",
      description: "למשל ״כל הידיות״. אם ריק, יוצג שם הקטגוריה.",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "תיאור קצר",
      type: "localeText",
    }),
    defineField({
      name: "image",
      title: "תמונה לאריח בדף הבית",
      type: "altImage",
    }),
    defineField({
      name: "order",
      title: "סדר בתפריט",
      description: "מספר קטן מופיע קודם.",
      type: "number",
      initialValue: 10,
    }),
    defineField({
      name: "filters",
      title: "מסננים בעמוד הקטגוריה",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...CATEGORY_FILTERS], layout: "grid" },
    }),
    defineField({
      name: "scene",
      title: "הדמיה במקום",
      description:
        "בעמוד המוצר: איך המוצרים בקטגוריה הזו ייראו במקום (על ארון, דלת, קיר אמבטיה…), בגודל אמיתי ובגימור שהלקוח בוחר. תת-קטגוריה בלי בחירה מקבלת את הבחירה של הקטגוריה שמעליה.",
      type: "string",
      options: { list: [...SCENES] },
    }),
  ],
  orderings: [
    {
      title: "סדר בתפריט",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.he", parent: "parent.title.he", media: "image" },
    prepare: ({ title, parent, media }) => ({
      title,
      subtitle: parent ? `תחת: ${parent}` : "קטגוריה ראשית",
      media,
    }),
  },
});

export const brand = defineType({
  name: "brand",
  title: "מותג",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "שם המותג",
      type: "string",
      validation: (r) => r.required(),
    }),
    slugField("name"),
    defineField({ name: "logo", title: "לוגו", type: "altImage" }),
    defineField({ name: "description", title: "תיאור", type: "localeText" }),
    defineField({ name: "website", title: "אתר היצרן", type: "url" }),
    defineField({
      name: "isSample",
      title: "מותג לדוגמה",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", media: "logo", isSample: "isSample" },
    prepare: ({ title, media, isSample }) => ({
      title: `${isSample ? "[דוגמה] " : ""}${title}`,
      media,
    }),
  },
});

export const finish = defineType({
  name: "finish",
  title: "גימור / צבע",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "שם הגימור",
      type: "localeString",
      validation: requireHebrew,
    }),
    slugField("name.en"),
    defineField({
      name: "swatch",
      title: "צבע לדוגמית (קוד HEX)",
      description: "למשל #C9A24B לזהב. מוצג כעיגול צבע במסננים.",
      type: "string",
      validation: (r) =>
        r.regex(/^#[0-9a-fA-F]{6}$/).error("כתבו צבע כמו #C9A24B"),
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
  preview: { select: { title: "name.he", subtitle: "swatch" } },
});

export const material = defineType({
  name: "material",
  title: "חומר",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "שם החומר",
      type: "localeString",
      validation: requireHebrew,
    }),
    slugField("name.en"),
  ],
  preview: { select: { title: "name.he" } },
});
