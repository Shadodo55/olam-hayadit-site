// Relative import: the Worker bundles this file too (no "@/" alias there).
import { parseIsraeliPhone } from "../../lib/site/phone";

/**
 * Inquiry forms ("contact" and "professional"): one validator shared by the
 * browser (instant errors) and the Worker (the real check). Pure TypeScript,
 * no DOM: the Worker imports it too.
 *
 * Errors are codes, not text: each side turns them into words.
 * Personal data from these forms never goes to Sanity (see CLAUDE.md).
 */
export const inquiryKinds = ["contact", "professional"] as const;
export type InquiryKind = (typeof inquiryKinds)[number];

export const professions = [
  "designer",
  "architect",
  "carpenter",
  "kitchen",
  "contractor",
  "other",
] as const;
export type Profession = (typeof professions)[number];

export const inquiryFields = [
  "name",
  "phone",
  "email",
  "profession",
  "business",
  "message",
] as const;
export type InquiryField = (typeof inquiryFields)[number];
export type FieldError = "required" | "tooShort" | "tooLong" | "invalid";
export type InquiryErrors = Partial<Record<InquiryField, FieldError>>;

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  phoneMax: 20,
  emailMax: 120,
  businessMax: 80,
  messageMin: 5,
  messageMax: 2000,
} as const;

/** A validated inquiry, ready to send. */
export interface Inquiry {
  kind: InquiryKind;
  name: string;
  phone: string;
  email: string | null;
  profession: Profession | null;
  business: string | null;
  message: string | null;
  marketing: boolean;
  locale: "he" | "en";
}

export type ValidationResult =
  { ok: true; inquiry: Inquiry } | { ok: false; errors: InquiryErrors };

// Control characters: none in single-line fields; the message may keep
// line breaks and tabs.
const CONTROL_SINGLE = /[\u0000-\u001f\u007f]/;
const CONTROL_MULTI = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export function validateInquiry(raw: unknown): ValidationResult {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const kind: InquiryKind =
    input.kind === "professional" ? "professional" : "contact";
  const errors: InquiryErrors = {};

  const name = text(input.name);
  if (!name) errors.name = "required";
  else if (CONTROL_SINGLE.test(name)) errors.name = "invalid";
  else if (name.length < LIMITS.nameMin) errors.name = "tooShort";
  else if (name.length > LIMITS.nameMax) errors.name = "tooLong";

  const phoneText = text(input.phone);
  const phone = parseIsraeliPhone(phoneText);
  if (!phoneText) errors.phone = "required";
  else if (!phone || phoneText.length > LIMITS.phoneMax)
    errors.phone = "invalid";

  const email = text(input.email);
  if (email.length > LIMITS.emailMax) errors.email = "tooLong";
  else if (email && !EMAIL.test(email)) errors.email = "invalid";

  let profession: Profession | null = null;
  if (kind === "professional") {
    const value = text(input.profession);
    if (!value) errors.profession = "required";
    else if (!professions.includes(value as Profession))
      errors.profession = "invalid";
    else profession = value as Profession;
  }

  const business = kind === "professional" ? text(input.business) : "";
  if (CONTROL_SINGLE.test(business)) errors.business = "invalid";
  else if (business.length > LIMITS.businessMax) errors.business = "tooLong";

  const message = text(input.message);
  if (CONTROL_MULTI.test(message)) errors.message = "invalid";
  else if (message.length > LIMITS.messageMax) errors.message = "tooLong";
  else if (kind === "contact" && !message) errors.message = "required";
  else if (message && message.length < LIMITS.messageMin)
    errors.message = "tooShort";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    inquiry: {
      kind,
      name,
      phone: phoneText,
      email: email || null,
      profession,
      business: business || null,
      message: message || null,
      marketing: input.marketing === true,
      locale: input.locale === "en" ? "en" : "he",
    },
  };
}

/** Hebrew labels for the store's email (the store reads Hebrew). */
export const professionLabelsHe: Record<Profession, string> = {
  designer: "מעצב/ת פנים",
  architect: "אדריכל/ית",
  carpenter: "נגר/ית",
  kitchen: "מטבחן/ית",
  contractor: "קבלן/ית",
  other: "אחר",
};
