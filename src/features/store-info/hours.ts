/**
 * Opening hours logic. Pure functions, no React: used by the footer, the
 * "visit the store" page and the "open now" status, and by JSON-LD.
 */

/** Index 0 = Sunday … 6 = Saturday (Israeli week). `null` = closed all day. */
export type WeeklyHours = readonly (DayHours | null)[];

export interface DayHours {
  /** "HH:MM", 24h, Israel local time */
  opens: string;
  closes: string;
}

export type OpenStatus =
  | { state: "open"; closesAt: string }
  | {
      state: "closed";
      /** daysAhead: 0 = later today, 1 = tomorrow, … */
      opensNext: { dayIndex: number; time: string; daysAhead: number } | null;
    };

const STORE_TIME_ZONE = "Asia/Jerusalem";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function toMinutes(hhmm: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) throw new Error(`Invalid time "${hhmm}", expected HH:MM`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error(`Invalid time "${hhmm}"`);
  return hours * 60 + minutes;
}

/** Day of week (0 = Sunday) and minutes since midnight in the store's time zone. */
export function storeLocalTime(now: Date): {
  dayIndex: number;
  minutes: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const dayIndex = WEEKDAYS.indexOf(
    get("weekday") as (typeof WEEKDAYS)[number],
  );
  return {
    dayIndex,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function getOpenStatus(hours: WeeklyHours, now: Date): OpenStatus {
  const { dayIndex, minutes } = storeLocalTime(now);
  const today = hours[dayIndex] ?? null;

  if (
    today &&
    minutes >= toMinutes(today.opens) &&
    minutes < toMinutes(today.closes)
  ) {
    return { state: "open", closesAt: today.closes };
  }
  if (today && minutes < toMinutes(today.opens)) {
    return {
      state: "closed",
      opensNext: { dayIndex, time: today.opens, daysAhead: 0 },
    };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const nextIndex = (dayIndex + offset) % 7;
    const next = hours[nextIndex];
    if (next) {
      return {
        state: "closed",
        opensNext: { dayIndex: nextIndex, time: next.opens, daysAhead: offset },
      };
    }
  }
  return { state: "closed", opensNext: null };
}

export interface HoursGroup {
  /** First and last day index of a run of consecutive days with the same hours. */
  from: number;
  to: number;
  hours: DayHours | null;
}

/** Collapse a week into runs, e.g. Sun–Thu 07:30–18:00, Fri 07:30–13:00, Sat closed. */
export function groupHours(hours: WeeklyHours): HoursGroup[] {
  const groups: HoursGroup[] = [];
  hours.forEach((day, index) => {
    const last = groups.at(-1);
    const same =
      last &&
      ((last.hours === null && day === null) ||
        (last.hours !== null &&
          day !== null &&
          last.hours.opens === day.opens &&
          last.hours.closes === day.closes));
    if (last && same) last.to = index;
    else groups.push({ from: index, to: index, hours: day });
  });
  return groups;
}
