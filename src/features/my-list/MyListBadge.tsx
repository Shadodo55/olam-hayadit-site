"use client";

import { useTranslations } from "next-intl";
import { useSavedList } from "./list-store";

/** Item count next to the header "My list" link (visible number + screen-reader text). */
export function MyListBadge() {
  const t = useTranslations("list");
  const list = useSavedList();
  const count = list?.items.length ?? 0;
  if (count === 0) return null;
  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold text-paper tabular"
      >
        {t("badge", { count })}
      </span>
      <span className="sr-only">, {t("count", { count })}</span>
    </>
  );
}
