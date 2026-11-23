"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { addDays, storeLocalTime, type SpecialDay } from "./hours";

const noop = () => () => {};
const todaySnapshot = () => storeLocalTime(new Date()).date;
const serverSnapshot = () => null;

/**
 * Special opening hours (holidays) in the next 30 days. Computed in the
 * browser so past dates disappear without a rebuild.
 */
export function UpcomingSpecialDays({
  specialDays,
  tone = "dark",
}: {
  specialDays: readonly SpecialDay[];
  /** "dark" = on the graphite footer, "light" = on the paper background. */
  tone?: "dark" | "light";
}) {
  const locale = useLocale();
  const t = useTranslations("status");
  const today = useSyncExternalStore(noop, todaySnapshot, serverSnapshot);
  if (!today || specialDays.length === 0) return null;

  const until = addDays(today, 30);
  const upcoming = specialDays
    .filter((d) => d.date >= today && d.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (upcoming.length === 0) return null;

  const format = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mt-4">
      <p
        className={`font-semibold ${tone === "dark" ? "text-on-band" : "text-ink"}`}
      >
        {t("specialHours")}
      </p>
      <ul
        className={`mt-1 ${tone === "dark" ? "text-on-band/80" : "text-ink-muted"}`}
      >
        {upcoming.map((day) => (
          <li key={day.date}>
            {format.format(new Date(`${day.date}T00:00:00Z`))}:{" "}
            {day.hours ? (
              <span dir="ltr" className="tabular">
                {day.hours.opens}–{day.hours.closes}
              </span>
            ) : (
              t("closed")
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
