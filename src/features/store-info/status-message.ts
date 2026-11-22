import type { OpenStatus } from "./hours";

/** Which message (and values) describes the current open/closed status. */
export type StatusMessage =
  | { key: "openUntil"; time: string }
  | { key: "closedOpensToday"; time: string }
  | { key: "closedOpensTomorrow"; time: string }
  | { key: "closedOpensOn"; time: string; dayIndex: number }
  | { key: "closed" };

export function statusMessage(status: OpenStatus): StatusMessage {
  if (status.state === "open")
    return { key: "openUntil", time: status.closesAt };
  const next = status.opensNext;
  if (!next) return { key: "closed" };
  if (next.daysAhead === 0) return { key: "closedOpensToday", time: next.time };
  if (next.daysAhead === 1)
    return { key: "closedOpensTomorrow", time: next.time };
  return { key: "closedOpensOn", time: next.time, dayIndex: next.dayIndex };
}
