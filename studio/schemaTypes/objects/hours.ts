import { defineField, defineType } from "sanity";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeRule = (rule: import("sanity").StringRule) =>
  rule
    .regex(TIME, { name: "שעה", invert: false })
    .error("כתבו שעה בפורמט 07:30");

export const dayHours = defineType({
  name: "dayHours",
  title: "שעות ביום",
  type: "object",
  options: { columns: 3 },
  fields: [
    defineField({
      name: "closed",
      title: "סגור ביום הזה",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "opens",
      title: "פתיחה",
      type: "string",
      placeholder: "07:30",
      hidden: ({ parent }) => Boolean(parent?.closed),
      validation: (rule) =>
        timeRule(rule).custom((value, ctx) => {
          const parent = ctx.parent as { closed?: boolean } | undefined;
          return parent?.closed || value ? true : "חובה למלא שעת פתיחה";
        }),
    }),
    defineField({
      name: "closes",
      title: "סגירה",
      type: "string",
      placeholder: "18:00",
      hidden: ({ parent }) => Boolean(parent?.closed),
      validation: (rule) =>
        timeRule(rule).custom((value, ctx) => {
          const parent = ctx.parent as
            { closed?: boolean; opens?: string } | undefined;
          if (parent?.closed) return true;
          if (!value) return "חובה למלא שעת סגירה";
          if (parent?.opens && value <= parent.opens)
            return "שעת הסגירה צריכה להיות אחרי הפתיחה";
          return true;
        }),
    }),
  ],
});

export const specialDay = defineType({
  name: "specialDay",
  title: "יום מיוחד (חג, ערב חג, סגירה)",
  type: "object",
  fields: [
    defineField({
      name: "date",
      title: "תאריך",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "note",
      title: "סיבה (למשל: ערב פסח)",
      type: "localeString",
    }),
    defineField({ name: "hours", title: "שעות", type: "dayHours" }),
  ],
  preview: {
    select: {
      date: "date",
      note: "note.he",
      closed: "hours.closed",
      opens: "hours.opens",
      closes: "hours.closes",
    },
    prepare: ({ date, note, closed, opens, closes }) => ({
      title: `${date ?? ""} ${note ?? ""}`.trim(),
      subtitle: closed ? "סגור" : opens && closes ? `${opens}–${closes}` : "",
    }),
  },
});
