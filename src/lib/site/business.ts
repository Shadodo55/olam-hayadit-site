import type { WeeklyHours } from "@/features/store-info/hours";

/**
 * Business details. Values below were confirmed by the store (2026-11-23).
 * In phase 3 these move to the Sanity `siteSettings` document so the owner can
 * edit them; this file then becomes the typed fallback.
 *
 * NEVER invent facts here. Unknown values stay `null` and render as a visible
 * "[להשלמה]" placeholder.
 */
export const business = {
  name: { he: "עולם הידית והפרזול", en: "Olam HaYadit" },
  address: {
    street: { he: "יד חרוצים 16", en: "16 Yad Harutsim St." },
    area: { he: "אזור התעשייה תלפיות", en: "Talpiot Industrial Area" },
    city: { he: "ירושלים", en: "Jerusalem" },
  },
  phones: {
    store: { display: "02-6749235", e164: "+97226749235" },
    mobile: { display: "052-3471766", e164: "+972523471766" },
  },
  /** Temporary: the mobile number, until a business WhatsApp number exists. */
  whatsapp: { display: "052-3471766", waId: "972523471766" },
  email: null as string | null,
  registrationNumber: null as string | null,
  hours: [
    { opens: "07:30", closes: "18:00" },
    { opens: "07:30", closes: "18:00" },
    { opens: "07:30", closes: "18:00" },
    { opens: "07:30", closes: "18:00" },
    { opens: "07:30", closes: "18:00" },
    { opens: "07:30", closes: "13:00" },
    null,
  ] satisfies WeeklyHours,
} as const;

export function wazeUrl(): string {
  const query = encodeURIComponent("יד חרוצים 16 ירושלים");
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${business.whatsapp.waId}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
