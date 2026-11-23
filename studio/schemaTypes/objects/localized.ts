import { defineField, defineType, type Rule } from "sanity";
import { LtrInput, RtlInput } from "../../components/DirectionInput";

/**
 * Bilingual fields. Hebrew is the main language (required where the field is
 * required); English is optional and the site falls back to Hebrew.
 */
export const localeString = defineType({
  name: "localeString",
  title: "טקסט קצר (עברית + אנגלית)",
  type: "object",
  options: { columns: 1 },
  fields: [
    defineField({
      name: "he",
      title: "עברית",
      type: "string",
      components: { input: RtlInput },
    }),
    defineField({
      name: "en",
      title: "English (לא חובה)",
      type: "string",
      components: { input: LtrInput },
    }),
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "טקסט (עברית + אנגלית)",
  type: "object",
  fields: [
    defineField({
      name: "he",
      title: "עברית",
      type: "text",
      rows: 4,
      components: { input: RtlInput },
    }),
    defineField({
      name: "en",
      title: "English (לא חובה)",
      type: "text",
      rows: 4,
      components: { input: LtrInput },
    }),
  ],
});

const blockContent = {
  type: "array" as const,
  of: [
    {
      type: "block",
      styles: [
        { title: "פסקה", value: "normal" },
        { title: "כותרת", value: "h2" },
        { title: "כותרת משנה", value: "h3" },
      ],
      lists: [
        { title: "רשימה", value: "bullet" },
        { title: "רשימה ממוספרת", value: "number" },
      ],
      marks: {
        decorators: [{ title: "מודגש", value: "strong" }],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "קישור",
            fields: [{ name: "href", type: "url", title: "כתובת" }],
          },
        ],
      },
    },
  ],
};

export const localeBlocks = defineType({
  name: "localeBlocks",
  title: "תוכן עשיר (עברית + אנגלית)",
  type: "object",
  fields: [
    defineField({
      name: "he",
      title: "עברית",
      ...blockContent,
      components: { input: RtlInput },
    }),
    defineField({
      name: "en",
      title: "English (לא חובה)",
      ...blockContent,
      components: { input: LtrInput },
    }),
  ],
});

/** Validation for a required bilingual field: Hebrew must be filled. */
export function requireHebrew(rule: Rule) {
  return rule.custom((value: { he?: unknown } | undefined) => {
    const he = value?.he;
    const filled = Array.isArray(he)
      ? he.length > 0
      : typeof he === "string" && he.trim() !== "";
    return filled ? true : "חובה למלא את הטקסט בעברית";
  });
}
