"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { getOpenStatus, type SpecialDay, type WeeklyHours } from "./hours";
import { statusMessage } from "./status-message";

/** A clock that ticks once a minute. `null` while pre-rendering (no "now" at build time). */
const MINUTE = 60_000;
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(id);
}
const minuteSnapshot = () => Math.floor(Date.now() / MINUTE);
const serverSnapshot = () => null;

/**
 * "Open now, until 18:00" / "Closed, opens tomorrow at 07:30".
 * The static HTML shows a neutral "Opening hours" label; the real status is
 * computed in the browser (in the store's time zone) after load.
 */
export function OpenStatus({
  hours,
  specialDays = [],
}: {
  hours: WeeklyHours;
  specialDays?: readonly SpecialDay[];
}) {
  const t = useTranslations("status");
  const days = useTranslations("days");
  const minute = useSyncExternalStore(
    subscribeMinute,
    minuteSnapshot,
    serverSnapshot,
  );

  if (minute === null) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-line-strong"
        />
        {t("hours")}
      </span>
    );
  }

  const message = statusMessage(
    getOpenStatus(hours, new Date(minute * MINUTE), specialDays),
  );
  const isOpen = message.key === "openUntil";
  let text: string;
  switch (message.key) {
    case "closed":
      text = t("closed");
      break;
    case "closedOpensOn":
      text = t("closedOpensOn", {
        time: message.time,
        day: days("long").split(",")[message.dayIndex] ?? "",
      });
      break;
    default:
      text = t(message.key, { time: message.time });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${isOpen ? "bg-patina" : "bg-line-strong"}`}
      />
      <span>
        {text.split(/(\d{2}:\d{2})/).map((part, i) =>
          /^\d{2}:\d{2}$/.test(part) ? (
            <span key={i} dir="ltr" className="tabular">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    </span>
  );
}
