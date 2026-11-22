import { describe, expect, it } from "vitest";
import {
  getOpenStatus,
  storeLocalTime,
  toMinutes,
  type WeeklyHours,
} from "./hours";

const HOURS: WeeklyHours = [
  { opens: "07:30", closes: "18:00" },
  { opens: "07:30", closes: "18:00" },
  { opens: "07:30", closes: "18:00" },
  { opens: "07:30", closes: "18:00" },
  { opens: "07:30", closes: "18:00" },
  { opens: "07:30", closes: "13:00" },
  null,
];

// Israel is UTC+2 in winter (no DST in late November).
const israelWinter = (isoLocal: string) => new Date(`${isoLocal}+02:00`);

describe("toMinutes", () => {
  it("parses HH:MM", () => {
    expect(toMinutes("07:30")).toBe(450);
    expect(toMinutes("18:00")).toBe(1080);
  });
  it("rejects invalid input", () => {
    expect(() => toMinutes("7:30")).toThrow();
    expect(() => toMinutes("25:00")).toThrow();
  });
});

describe("storeLocalTime", () => {
  it("uses the store time zone, not the visitor's", () => {
    // 23:30 UTC on Saturday is already 01:30 Sunday in Jerusalem.
    expect(storeLocalTime(new Date("2026-11-28T23:30:00Z"))).toEqual({
      dayIndex: 0,
      minutes: 90,
    });
  });
});

describe("getOpenStatus", () => {
  it("is open during opening hours", () => {
    // Monday 2026-11-23 10:00
    expect(getOpenStatus(HOURS, israelWinter("2026-11-23T10:00:00"))).toEqual({
      state: "open",
      closesAt: "18:00",
    });
  });

  it("closes exactly at closing time", () => {
    expect(getOpenStatus(HOURS, israelWinter("2026-11-23T18:00:00"))).toEqual({
      state: "closed",
      opensNext: { dayIndex: 2, time: "07:30", isToday: false },
    });
  });

  it("opens later today before opening time", () => {
    expect(getOpenStatus(HOURS, israelWinter("2026-11-23T06:00:00"))).toEqual({
      state: "closed",
      opensNext: { dayIndex: 1, time: "07:30", isToday: true },
    });
  });

  it("uses short Friday hours", () => {
    expect(
      getOpenStatus(HOURS, israelWinter("2026-11-27T13:30:00")).state,
    ).toBe("closed");
  });

  it("skips Saturday and reopens on Sunday", () => {
    expect(getOpenStatus(HOURS, israelWinter("2026-11-28T12:00:00"))).toEqual({
      state: "closed",
      opensNext: { dayIndex: 0, time: "07:30", isToday: false },
    });
  });

  it("handles a week with no opening days", () => {
    expect(
      getOpenStatus([null, null, null, null, null, null, null], new Date()),
    ).toEqual({
      state: "closed",
      opensNext: null,
    });
  });
});
