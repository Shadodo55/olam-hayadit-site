"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { addItem } from "@/commerce/list";
import { buttonClass } from "@/components/ui/button";
import { ListIcon } from "@/components/ui/icons";
import { localeHref, type Locale } from "@/lib/i18n/locales";
import { pagePaths } from "@/lib/routes";
import { updateList, useSavedList } from "./list-store";

/** Adds the selected variant to "My list" and confirms it (also to screen readers). */
export function AddToListButton({
  sku,
  slug,
  disabled,
}: {
  sku: string;
  slug: string;
  disabled?: boolean;
}) {
  const t = useTranslations("list");
  const locale = useLocale() as Locale;
  const list = useSavedList();
  const [announcement, setAnnouncement] = useState("");
  const qty = list?.items.find((i) => i.sku === sku)?.qty ?? 0;

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          updateList((l) => addItem(l, { sku, slug }));
          setAnnouncement(t("added"));
        }}
        className={buttonClass("outline", "md", "w-full")}
      >
        <ListIcon />
        {t("add")}
      </button>
      <p className="mt-2 flex min-h-6 flex-wrap items-center justify-between gap-2 text-sm">
        <span role="status">
          {qty > 0
            ? `${announcement ? `${announcement}. ` : ""}${t("inList", { qty })}`
            : ""}
        </span>
        {qty > 0 && (
          <Link
            href={localeHref(locale, pagePaths.myList)}
            className="underline underline-offset-4"
          >
            {t("view")}
          </Link>
        )}
      </p>
    </div>
  );
}
