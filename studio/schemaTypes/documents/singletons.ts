import { defineArrayMember, defineField, defineType } from "sanity";
import { requireHebrew } from "../objects/localized";

const PHONE = /^0\d{1,2}-?\d{7}$/;
const DAYS = [
  ["sunday", "יום ראשון"],
  ["monday", "יום שני"],
  ["tuesday", "יום שלישי"],
  ["wednesday", "יום רביעי"],
  ["thursday", "יום חמישי"],
  ["friday", "יום שישי"],
  ["saturday", "שבת"],
] as const;

export const siteSettings = defineType({
  name: "siteSettings",
  title: "פרטי העסק ושעות פתיחה",
  type: "document",
  groups: [
    { name: "hours", title: "שעות פתיחה", default: true },
    { name: "contact", title: "פרטי קשר וכתובת" },
    { name: "business", title: "פרטי העסק" },
  ],
  fields: [
    defineField({
      name: "hours",
      title: "שעות פתיחה קבועות",
      type: "object",
      group: "hours",
      fields: DAYS.map(([name, title]) =>
        defineField({ name, title, type: "dayHours" }),
      ),
    }),
    defineField({
      name: "specialDays",
      title: "ימים מיוחדים (חגים, סגירות)",
      description: "יחליפו את השעות הקבועות בתאריך הזה. ימים שעברו אפשר למחוק.",
      type: "array",
      group: "hours",
      of: [defineArrayMember({ type: "specialDay" })],
    }),
    defineField({
      name: "hoursNote",
      title: "הערה לשעות הפתיחה",
      type: "localeString",
      group: "hours",
    }),

    defineField({
      name: "street",
      title: "רחוב ומספר",
      type: "localeString",
      group: "contact",
      validation: requireHebrew,
    }),
    defineField({
      name: "area",
      title: "אזור",
      type: "localeString",
      group: "contact",
    }),
    defineField({
      name: "city",
      title: "עיר",
      type: "localeString",
      group: "contact",
      validation: requireHebrew,
    }),
    defineField({
      name: "parking",
      title: "מידע על חניה",
      type: "localeText",
      group: "contact",
    }),
    defineField({
      name: "geo",
      title: "מיקום במפה",
      description: "לחצו ימני על המיקום ב-Google Maps והעתיקו את המספרים.",
      type: "geopoint",
      group: "contact",
    }),
    defineField({
      name: "storePhone",
      title: "טלפון בחנות",
      type: "string",
      group: "contact",
      validation: (r) => r.regex(PHONE).error("כתבו מספר כמו 02-6749235"),
    }),
    defineField({
      name: "mobilePhone",
      title: "נייד (בדיקת מלאי ובעלי מקצוע)",
      type: "string",
      group: "contact",
      validation: (r) => r.regex(PHONE).error("כתבו מספר כמו 052-3471766"),
    }),
    defineField({
      name: "whatsapp",
      title: "מספר וואטסאפ",
      description: "המספר שאליו יישלחו הודעות מהאתר.",
      type: "string",
      group: "contact",
      validation: (r) => r.regex(PHONE).error("כתבו מספר כמו 052-3471766"),
    }),
    defineField({
      name: "email",
      title: "דוא״ל",
      type: "email",
      group: "contact",
    }),
    defineField({
      name: "instagram",
      title: "אינסטגרם (קישור)",
      type: "url",
      group: "contact",
    }),
    defineField({
      name: "facebook",
      title: "פייסבוק (קישור)",
      type: "url",
      group: "contact",
    }),

    defineField({
      name: "businessName",
      title: "שם העסק",
      type: "localeString",
      group: "business",
      validation: requireHebrew,
    }),
    defineField({
      name: "slogan",
      title: "סלוגן",
      description:
        "משפט קצר מהשלט, מוצג בראש דף הבית. למשל: איכות ושירות זה אנחנו!",
      type: "localeString",
      group: "business",
    }),
    defineField({
      name: "services",
      title: "מה עושים אצלנו (כמו בשלט)",
      description: "רשימה קצרה שמוצגת בדף הבית, עד 6 פריטים קצרים.",
      type: "array",
      group: "business",
      of: [defineArrayMember({ type: "localeString" })],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: "registrationNumber",
      title: "מספר עוסק / ח״פ",
      type: "string",
      group: "business",
    }),
    defineField({
      name: "accessibilityCoordinator",
      title: "רכז/ת נגישות: שם",
      type: "string",
      group: "business",
    }),
    defineField({
      name: "accessibilityContact",
      title: "רכז/ת נגישות: טלפון או דוא״ל",
      type: "string",
      group: "business",
    }),
  ],
  preview: { prepare: () => ({ title: "פרטי העסק ושעות פתיחה" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "דף הבית",
  type: "document",
  fields: [
    defineField({
      name: "heroPoster",
      title: "תמונה ראשית (מוצגת גם לפני הווידאו)",
      type: "altImage",
    }),
    defineField({
      name: "heroVideo",
      title: "וידאו רקע למחשב (MP4, עד 3MB)",
      description: "בלי מידע חשוב בתוך הווידאו: הוא מושתק ואפשר לעצור אותו.",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
    }),
    defineField({
      name: "heroVideoMobile",
      title: "וידאו רקע לטלפון (MP4, קטן יותר)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
    }),
    defineField({
      name: "headline",
      title: "כותרת ראשית",
      type: "localeString",
    }),
    defineField({ name: "intro", title: "משפט פתיחה", type: "localeText" }),
    defineField({
      name: "featuredProducts",
      title: "מוצרים נבחרים",
      description: "אם ריק, יוצגו מוצרים שסומנו ״להציג בדף הבית״.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (r) => r.max(12).unique(),
    }),
    defineField({
      name: "brands",
      title: "מותגים לרצועת המותגים",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "brand" }] })],
      validation: (r) => r.unique(),
    }),
  ],
  preview: { prepare: () => ({ title: "דף הבית" }) },
});
