import { describe, expect, it } from "vitest";
import { parseIsraeliPhone } from "./phone";
import {
  fallbackSettings,
  mapSettings,
  wazeUrl,
  whatsappUrl,
} from "./settings";

describe("parseIsraeliPhone", () => {
  it("handles landlines and mobiles in common formats", () => {
    expect(parseIsraeliPhone("02-6749235")).toEqual({
      display: "02-6749235",
      e164: "+97226749235",
      waId: "97226749235",
    });
    expect(parseIsraeliPhone("052 347 1766")?.e164).toBe("+972523471766");
    expect(parseIsraeliPhone("+972-52-3471766")?.waId).toBe("972523471766");
  });
  it("rejects junk", () => {
    expect(parseIsraeliPhone("")).toBeNull();
    expect(parseIsraeliPhone("12345")).toBeNull();
    expect(parseIsraeliPhone(null)).toBeNull();
  });
});

describe("mapSettings", () => {
  it("maps weekly hours, closed days and special days", () => {
    const settings = mapSettings({
      hours: {
        sunday: { opens: "08:00", closes: "17:00" },
        saturday: { closed: true, opens: "09:00", closes: "10:00" },
      },
      specialDays: [
        { date: "2027-04-21", hours: { closed: true } },
        { hours: {} },
      ],
    });
    expect(settings.hours[0]).toEqual({ opens: "08:00", closes: "17:00" });
    expect(settings.hours[1]).toBeNull(); // missing day = closed
    expect(settings.hours[6]).toBeNull();
    expect(settings.specialDays).toEqual([{ date: "2027-04-21", hours: null }]);
  });

  it("leaves unknown business details empty instead of inventing them", () => {
    const settings = mapSettings({
      businessName: { he: "עולם הידית והפרזול" },
    });
    expect(settings.email).toBeNull();
    expect(settings.registrationNumber).toBeNull();
    expect(settings.phones.store).toBeNull();
    expect(settings.address.street).toBeNull();
  });
});

describe("links", () => {
  it("builds Waze and WhatsApp links", () => {
    expect(wazeUrl(fallbackSettings)).toContain(
      encodeURIComponent("יד חרוצים 16"),
    );
    expect(whatsappUrl(fallbackSettings.whatsapp, "שלום")).toBe(
      `https://wa.me/972523471766?text=${encodeURIComponent("שלום")}`,
    );
    expect(whatsappUrl(null)).toBeNull();
  });
});
