"use client";

import { useTranslations } from "next-intl";
import type { StockStatus } from "@/commerce/stock";

const dot: Record<StockStatus, string> = {
  inStore: "bg-patina",
  specialOrder: "bg-accent",
  askUs: "bg-line-strong",
  outOfStock: "border border-ink-muted bg-transparent",
};

/** Stock status as text (never colour alone) with a small dot. */
export function StockLabel({
  status,
  className = "",
}: {
  status: StockStatus;
  className?: string;
}) {
  const t = useTranslations("catalog");
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${dot[status]}`}
      />
      {t(`stock_${status}`)}
    </span>
  );
}
