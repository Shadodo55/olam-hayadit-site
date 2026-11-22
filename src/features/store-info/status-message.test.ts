import { describe, expect, it } from "vitest";
import { statusMessage } from "./status-message";

describe("statusMessage", () => {
  it("open", () => {
    expect(statusMessage({ state: "open", closesAt: "18:00" })).toEqual({
      key: "openUntil",
      time: "18:00",
    });
  });
  it("opens later today", () => {
    expect(
      statusMessage({
        state: "closed",
        opensNext: { dayIndex: 1, time: "07:30", daysAhead: 0 },
      }),
    ).toEqual({ key: "closedOpensToday", time: "07:30" });
  });
  it("opens tomorrow", () => {
    expect(
      statusMessage({
        state: "closed",
        opensNext: { dayIndex: 2, time: "07:30", daysAhead: 1 },
      }).key,
    ).toBe("closedOpensTomorrow");
  });
  it("opens on a named day after the weekend", () => {
    expect(
      statusMessage({
        state: "closed",
        opensNext: { dayIndex: 0, time: "07:30", daysAhead: 2 },
      }),
    ).toEqual({ key: "closedOpensOn", time: "07:30", dayIndex: 0 });
  });
  it("closed with no opening days", () => {
    expect(statusMessage({ state: "closed", opensNext: null })).toEqual({
      key: "closed",
    });
  });
});
