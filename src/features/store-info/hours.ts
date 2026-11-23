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

/** A date with different hours (holiday, holiday eve, closure). */
export interface SpecialDay {
  /** "YYYY-MM-DD" in Israel. */
  date: string;
  /** `null` = closed all day. */
  hours: DayHours | null;
}

/**
 * Day of week (0 = Sunday), minutes since midnight and calendar date
 * ("YYYY-MM-DD") in the store's time zone.
 */
export function storeLocalTime(now: Date): {
  dayIndex: number;
  minutes: number;
  date: string;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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
    date: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

/** "YYYY-MM-DD" plus `days` (calendar arithmetic, no time zone involved). */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function getOpenStatus(
  hours: WeeklyHours,
  now: Date,
  specialDays: readonly SpecialDay[] = [],
): OpenStatus {
  const local = storeLocalTime(now);
  const hoursOn = (offset: number): DayHours | null => {
    const special = specialDays.find(
      (s) => s.date === addDays(local.date, offset),
    );
    return special
      ? special.hours
      : (hours[(local.dayIndex + offset) % 7] ?? null);
  };

  const today = hoursOn(0);
  if (
    today &&
    local.minutes >= toMinutes(today.opens) &&
    local.minutes < toMinutes(today.closes)
  ) {
    return { state: "open", closesAt: today.closes };
  }
  if (today && local.minutes < toMinutes(today.opens)) {
    return {
      state: "closed",
      opensNext: { dayIndex: local.dayIndex, time: today.opens, daysAhead: 0 },
    };
  }
  for (let offset = 1; offset <= 14; offset++) {
    const next = hoursOn(offset);
    if (next) {
      return {
        state: "closed",
        opensNext: {
          dayIndex: (local.dayIndex + offset) % 7,
          time: next.opens,
          daysAhead: offset,
        },
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
