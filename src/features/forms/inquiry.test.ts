import { describe, expect, it } from "vitest";
import { validateInquiry } from "./inquiry";

const contact = {
  kind: "contact",
  name: "דנה כהן",
  phone: "052-1234567",
  email: "",
  message: "יש לכם ידית בר 128 מ״מ בשחור?",
  locale: "he",
};

describe("validateInquiry", () => {
  it("accepts a complete contact inquiry and trims it", () => {
    const result = validateInquiry({ ...contact, name: "  דנה כהן " });
    expect(result).toEqual({
      ok: true,
      inquiry: {
        kind: "contact",
        name: "דנה כהן",
        phone: "052-1234567",
        email: null,
        profession: null,
        business: null,
        message: "יש לכם ידית בר 128 מ״מ בשחור?",
        marketing: false,
        locale: "he",
      },
    });
  });

  it("requires name, phone and (for contact) a message", () => {
    const result = validateInquiry({ kind: "contact" });
    expect(result).toEqual({
      ok: false,
      errors: { name: "required", phone: "required", message: "required" },
    });
  });

  it("rejects a phone number that isn't Israeli", () => {
    const result = validateInquiry({ ...contact, phone: "12345" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBe("invalid");
  });

  it("checks the email only when one is given", () => {
    const bad = validateInquiry({ ...contact, email: "not-an-email" });
    expect(!bad.ok && bad.errors.email).toBe("invalid");
    const good = validateInquiry({ ...contact, email: "dana@example.com" });
    expect(good.ok && good.inquiry.email).toBe("dana@example.com");
  });

  it("needs a known profession from professionals, but no message", () => {
    const missing = validateInquiry({
      ...contact,
      kind: "professional",
      message: "",
    });
    expect(!missing.ok && missing.errors).toEqual({ profession: "required" });
    const unknown = validateInquiry({
      ...contact,
      kind: "professional",
      profession: "astronaut",
    });
    expect(!unknown.ok && unknown.errors.profession).toBe("invalid");
    const ok = validateInquiry({
      ...contact,
      kind: "professional",
      profession: "carpenter",
      business: "נגרות לוי",
      message: "",
      marketing: true,
    });
    expect(ok.ok && ok.inquiry).toMatchObject({
      profession: "carpenter",
      business: "נגרות לוי",
      message: null,
      marketing: true,
    });
  });

  it("rejects control characters in single-line fields (no header injection)", () => {
    const result = validateInquiry({ ...contact, name: "Dana\r\nBcc: x@y.z" });
    expect(!result.ok && result.errors.name).toBe("invalid");
  });

  it("keeps line breaks in the message and enforces its length", () => {
    const multi = validateInquiry({
      ...contact,
      message: "שורה אחת\nשורה שתיים",
    });
    expect(multi.ok).toBe(true);
    const long = validateInquiry({ ...contact, message: "א".repeat(2001) });
    expect(!long.ok && long.errors.message).toBe("tooLong");
    const short = validateInquiry({ ...contact, message: "הי" });
    expect(!short.ok && short.errors.message).toBe("tooShort");
  });

  it("ignores profession and business on a plain contact inquiry", () => {
    const result = validateInquiry({
      ...contact,
      profession: "carpenter",
      business: "x",
    });
    expect(result.ok && result.inquiry).toMatchObject({
      profession: null,
      business: null,
    });
  });
});
