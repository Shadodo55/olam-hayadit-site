import type {
  DayHours,
  SpecialDay,
  WeeklyHours,
} from "@/features/store-info/hours";
import { localized, type Locale, type Localized } from "@/lib/i18n/locales";
import { sanityFetch } from "@/lib/sanity/client";
import { parseIsraeliPhone, type Phone } from "./phone";

/**
 * Store details, edited by the owner in Sanity ("פרטי העסק ושעות פתיחה").
 * Missing values are `null` and render as a visible placeholder: never invent.
 */
export interface SiteSettings {
  name: Localized;
  /** Short line from the store's sign, e.g. "איכות ושירות זה אנחנו!". */
  slogan: Localized | null;
  /** What the store does, as on the sign (shown as a strip on the home page). */
  services: Localized[];
  address: {
    street: Localized | null;
    area: Localized | null;
    city: Localized | null;
  };
  geo: { lat: number; lng: number } | null;
  parking: Localized | null;
  phones: { store: Phone | null; mobile: Phone | null };
  whatsapp: Phone | null;
  email: string | null;
  registrationNumber: string | null;
  hours: WeeklyHours;
  specialDays: SpecialDay[];
  hoursNote: Localized | null;
  social: { instagram: string | null; facebook: string | null };
  accessibility: { coordinator: string | null; contact: string | null };
}

type RawDay =
  { closed?: boolean; opens?: string; closes?: string } | null | undefined;
interface RawSettings {
  businessName?: Localized | null;
  slogan?: Localized | null;
  services?: (Localized | null)[] | null;
  street?: Localized | null;
  area?: Localized | null;
  city?: Localized | null;
  parking?: Localized | null;
  geo?: { lat: number; lng: number } | null;
  storePhone?: string | null;
  mobilePhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  registrationNumber?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  accessibilityCoordinator?: string | null;
  accessibilityContact?: string | null;
  hours?: Record<string, RawDay> | null;
  specialDays?: { date?: string; hours?: RawDay }[] | null;
  hoursNote?: Localized | null;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function toDayHours(day: RawDay): DayHours | null {
  if (!day || day.closed || !day.opens || !day.closes) return null;
  return { opens: day.opens, closes: day.closes };
}

const filled = (value: Localized | null | undefined): Localized | null =>
  value?.he?.trim() ? value : null;

export function mapSettings(raw: RawSettings): SiteSettings {
  return {
    name: filled(raw.businessName) ?? FALLBACK_NAME,
    slogan: filled(raw.slogan),
    services: (raw.services ?? [])
      .map(filled)
      .filter((v): v is Localized => v !== null),
    address: {
      street: filled(raw.street),
      area: filled(raw.area),
      city: filled(raw.city),
    },
    geo:
      raw.geo?.lat != null && raw.geo?.lng != null
        ? { lat: raw.geo.lat, lng: raw.geo.lng }
        : null,
    parking: filled(raw.parking),
    phones: {
      store: parseIsraeliPhone(raw.storePhone),
      mobile: parseIsraeliPhone(raw.mobilePhone),
    },
    whatsapp: parseIsraeliPhone(raw.whatsapp),
    email: raw.email?.trim() || null,
    registrationNumber: raw.registrationNumber?.trim() || null,
    hours: DAY_KEYS.map((key) => toDayHours(raw.hours?.[key])),
    specialDays: (raw.specialDays ?? [])
      .filter((s): s is { date: string; hours?: RawDay } => Boolean(s.date))
      .map((s) => ({ date: s.date, hours: toDayHours(s.hours) })),
    hoursNote: filled(raw.hoursNote),
    social: {
      instagram: raw.instagram || null,
      facebook: raw.facebook || null,
    },
    accessibility: {
      coordinator: raw.accessibilityCoordinator || null,
      contact: raw.accessibilityContact || null,
    },
  };
}

const FALLBACK_NAME: Localized = {
  he: "עולם הידית והפרזול",
  en: "Olam HaYadit",
};

/**
 * Used ONLY if the settings document doesn't exist at all (e.g. an empty
 * dataset). These values were confirmed by the store on 2026-11-23.
 */
export const fallbackSettings: SiteSettings = mapSettings({
  businessName: FALLBACK_NAME,
  // Slogan and services as written on the store's sign.
  slogan: {
    he: "איכות ושירות זה אנחנו!",
    en: "Quality and service: that's us!",
  },
  services: [
    { he: "פרזול למטבחים", en: "Kitchen hardware" },
    { he: "כל סוגי הידיות", en: "Every kind of handle" },
    { he: "אביזרי אמבטיה", en: "Bathroom accessories" },
    { he: "עבודות אלומיניום ופרזול", en: "Aluminium and hardware work" },
  ],
  street: { he: "יד חרוצים 16", en: "16 Yad Harutsim St." },
  area: { he: "אזור התעשייה תלפיות", en: "Talpiot Industrial Area" },
  city: { he: "ירושלים", en: "Jerusalem" },
  storePhone: "02-6749235",
  mobilePhone: "052-3471766",
  whatsapp: "052-3471766",
  hours: {
    sunday: { opens: "07:30", closes: "18:00" },
    monday: { opens: "07:30", closes: "18:00" },
    tuesday: { opens: "07:30", closes: "18:00" },
    wednesday: { opens: "07:30", closes: "18:00" },
    thursday: { opens: "07:30", closes: "18:00" },
    friday: { opens: "07:30", closes: "13:00" },
    saturday: { closed: true },
  },
});

const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  businessName, slogan, services, street, area, city, parking, geo, storePhone, mobilePhone, whatsapp,
  email, registrationNumber, instagram, facebook, accessibilityCoordinator,
  accessibilityContact, hours, specialDays[]{date, hours}, hoursNote
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await sanityFetch<RawSettings | null>(SETTINGS_QUERY);
  if (!raw) {
    console.warn(
      "[settings] siteSettings document missing in Sanity: using fallback values",
    );
    return fallbackSettings;
  }
  return mapSettings(raw);
}

export function wazeUrl(settings: SiteSettings): string {
  const { street, city } = settings.address;
  const query = [street?.he, city?.he].filter(Boolean).join(" ");
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}

export function whatsappUrl(
  phone: Phone | null,
  message?: string,
): string | null {
  if (!phone) return null;
  const base = `https://wa.me/${phone.waId}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "Street, area, city" in the page's language; "" when nothing is set. */
export function formatAddress(settings: SiteSettings, locale: Locale): string {
  const { street, area, city } = settings.address;
  return [street, area, city]
    .flatMap((part) => (part ? [localized(part, locale).value] : []))
    .join(", ");
}
