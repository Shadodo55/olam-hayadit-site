/** Israeli phone numbers as typed in the CMS ("02-6749235", "052-3471766"). */
export interface Phone {
  /** As shown on the site. */
  display: string;
  /** For tel: links, e.g. "+97226749235". */
  e164: string;
  /** For wa.me links, e.g. "97226749235". */
  waId: string;
}

export function parseIsraeliPhone(
  input: string | null | undefined,
): Phone | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");
  const national = digits.startsWith("972") ? `0${digits.slice(3)}` : digits;
  if (!/^0\d{8,9}$/.test(national)) return null;
  const intl = `972${national.slice(1)}`;
  return { display: input.trim(), e164: `+${intl}`, waId: intl };
}
