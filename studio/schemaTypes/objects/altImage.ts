import { defineField, defineType } from "sanity";
import { requireHebrew } from "./localized";

/**
 * Image with a required description (alt text) for blind and low-vision
 * visitors. Required by Israeli accessibility law (IS 5568).
 */
export const altImage = defineType({
  name: "altImage",
  title: "תמונה",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "תיאור התמונה (לעיוורים ולקוראי מסך)",
      description:
        "תארו במשפט קצר מה רואים, למשל: ״ידית בר שחורה מט באורך 160 מ״מ על מגירה לבנה״. חובה.",
      type: "localeString",
      validation: requireHebrew,
    }),
    defineField({
      name: "finish",
      title: "הגימור שבתמונה",
      description:
        "כשהלקוח בוחר את הגימור הזה בעמוד המוצר, התמונה הזו תוצג. אפשר להשאיר ריק.",
      type: "reference",
      to: [{ type: "finish" }],
      // Only product photos have a finish.
      hidden: ({ document }) => document?._type !== "product",
    }),
  ],
});

/** Purely decorative image (e.g. background texture): no alt text, hidden from screen readers. */
export const decorativeImage = defineType({
  name: "decorativeImage",
  title: "תמונה דקורטיבית",
  description: "תמונת רקע בלבד, בלי מידע. קוראי מסך מדלגים עליה.",
  type: "image",
  options: { hotspot: true },
});
