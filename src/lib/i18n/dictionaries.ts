import type { Locale } from "./locales";

/** Temporary UI strings for the phase-1 holding page. Replaced by next-intl in phase 2. */
const he = {
  skipToContent: "דילוג לתוכן",
  siteTitle: "עולם הידית והפרזול",
  metaDescription:
    "ידיות, פרזול ואביזרי אמבטיה. אולם תצוגה ביד חרוצים 16, תלפיות, ירושלים. קטלוג אונליין בקרוב.",
  tagline: "ידיות ופרזול. בוחרים ביד.",
  underConstruction:
    "הקטלוג המלא באתר נמצא בבנייה. בינתיים, מוזמנים להגיע לאולם התצוגה או לפנות אלינו.",
  visitHeading: "ביקור באולם התצוגה",
  hoursHeading: "שעות פתיחה",
  contactHeading: "יצירת קשר",
  storePhone: "טלפון בחנות",
  mobilePhone: "נייד ובדיקת מלאי",
  whatsapp: "וואטסאפ",
  navigate: "ניווט ב-Waze",
  closed: "סגור",
  days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  holidayNote: "בחגים ובערבי חג השעות עשויות להשתנות.",
  languageSwitch: { label: "English", href: "/en", lang: "en" as Locale },
  opensInNewTab: "(נפתח בחלון חדש)",
};

type Dictionary = typeof he;

const en: Dictionary = {
  skipToContent: "Skip to content",
  siteTitle: "Olam HaYadit – handles & hardware",
  metaDescription:
    "Handles, hardware and bathroom accessories. Showroom at 16 Yad Harutsim St., Talpiot, Jerusalem. Online catalog coming soon.",
  tagline: "Handles and hardware. Chosen by hand.",
  underConstruction:
    "Our full online catalog is under construction. In the meantime, visit our showroom or get in touch.",
  visitHeading: "Visit the showroom",
  hoursHeading: "Opening hours",
  contactHeading: "Contact",
  storePhone: "Store phone",
  mobilePhone: "Mobile & stock checks",
  whatsapp: "WhatsApp",
  navigate: "Navigate with Waze",
  closed: "Closed",
  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  holidayNote: "Hours may change on holidays and holiday eves.",
  languageSwitch: { label: "עברית", href: "/", lang: "he" },
  opensInNewTab: "(opens in a new tab)",
};

const dictionaries: Record<Locale, Dictionary> = { he, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
