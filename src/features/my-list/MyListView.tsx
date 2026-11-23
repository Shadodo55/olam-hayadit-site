"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { emptyList, MAX_QTY, removeItem, setQty } from "@/commerce/list";
import { formatPrice } from "@/commerce/money";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon } from "@/components/ui/icons";
import { StockLabel } from "@/features/catalog/ui/StockLabel";
import { useSearchIndex } from "@/features/search/useSearchIndex";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { pagePaths, productPath } from "@/lib/routes";
import { saveList, updateList, useSavedList } from "./list-store";
import {
  estimatedTotal,
  listMessage,
  resolveList,
  variantDetails,
} from "./resolve";

export function MyListView({
  whatsappId,
  store,
}: {
  whatsappId: string | null;
  /** Shown only on the printed page. */
  store: { name: string; address: string; phone: string | null };
}) {
  const t = useTranslations("list");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const list = useSavedList();
  const indexState = useSearchIndex();
  const [announcement, setAnnouncement] = useState("");

  const lines = useMemo(
    () =>
      list && indexState.status === "ready"
        ? resolveList(list, indexState.index)
        : null,
    [list, indexState],
  );

  if (
    list === null ||
    (list.items.length > 0 && indexState.status === "loading")
  ) {
    return <p role="status">{t("loading")}</p>;
  }

  if (list.items.length === 0) {
    return (
      <div>
        <p role="status" className="text-lg">
          {announcement || t("empty")}
        </p>
        {announcement && <p className="mt-2 text-lg">{t("empty")}</p>}
        <Link
          href={localeHref(locale, pagePaths.catalog)}
          className={buttonClass("solid", "md", "mt-6")}
        >
          {t("toCatalog")}
        </Link>
      </div>
    );
  }

  const resolved = lines ?? [];
  const total = estimatedTotal(resolved);
  const message = listMessage(resolved, locale, {
    intro: t("whatsappIntro"),
    outro: t("whatsappOutro"),
    line: (v) => t("whatsappLine", v),
  });
  const whatsappHref = whatsappId
    ? `https://wa.me/${whatsappId}?text=${encodeURIComponent(message)}`
    : null;
  const today = new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    dateStyle: "long",
  }).format(new Date());

  return (
    <div>
      {/* Printed header: store details so the list can be brought to the shop. */}
      <div className="hidden print:mb-6 print:block">
        <p className="font-display text-2xl">{store.name}</p>
        <p>
          {store.address}
          {store.phone && (
            <>
              {" | "}
              <span dir="ltr">{store.phone}</span>
            </>
          )}
        </p>
        <p className="mt-2 font-semibold">{t("printTitle")}</p>
        <p className="text-sm">{t("printedOn", { date: today })}</p>
      </div>

      <p role="status" className="text-ink-muted">
        {announcement ? `${announcement}. ` : ""}
        {t("count", { count: list.items.length })}
      </p>

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {resolved.map((line) => {
          const name = line.product
            ? localized(line.product.title, locale)
            : null;
          const label = name?.value ?? line.sku;
          const details = variantDetails(line.variant, locale);
          return (
            <li
              key={line.sku}
              className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[5rem_1fr_auto]"
            >
              <div className="relative size-18 overflow-hidden bg-surface sm:size-20 print:hidden">
                {line.product?.image && (
                  <Image
                    src={line.product.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                )}
              </div>
              <div className="min-w-0">
                {line.product ? (
                  <Link
                    href={localeHref(
                      locale,
                      `${productPath(line.slug)}?sku=${encodeURIComponent(line.sku)}`,
                    )}
                    className="font-semibold underline-offset-4 hover:underline"
                    lang={name?.isFallback ? "he" : undefined}
                  >
                    {label}
                  </Link>
                ) : (
                  <p className="font-semibold">{label}</p>
                )}
                {details && <p className="text-sm text-ink-muted">{details}</p>}
                <p className="text-sm text-ink-muted">
                  <span dir="ltr">{line.sku}</span>
                </p>
                {line.variant ? (
                  <>
                    <p className="mt-1 text-sm">
                      {t("unitPrice")}:{" "}
                      <span className="tabular">
                        {formatPrice(line.variant.price, locale)}
                      </span>
                    </p>
                    <StockLabel
                      status={line.variant.stock}
                      className="text-sm"
                    />
                  </>
                ) : (
                  <p className="mt-1 text-sm text-ink-muted">
                    {t("unavailable")}
                  </p>
                )}
              </div>

              <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                <div className="flex items-center print:hidden">
                  <button
                    type="button"
                    onClick={() =>
                      updateList((l) => setQty(l, line.sku, line.qty - 1))
                    }
                    aria-label={t("decrease", { name: label })}
                    className="inline-flex size-11 items-center justify-center rounded-s-sm border border-line-strong text-xl hover:bg-surface"
                  >
                    −
                  </button>
                  <label htmlFor={`qty-${line.sku}`} className="sr-only">
                    {t("qtyOf", { name: label })}
                  </label>
                  <input
                    id={`qty-${line.sku}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QTY}
                    value={line.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      if (Number.isFinite(qty) && qty >= 1)
                        updateList((l) => setQty(l, line.sku, qty));
                    }}
                    className="h-11 w-16 border-y border-line-strong bg-paper text-center tabular"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateList((l) => setQty(l, line.sku, line.qty + 1))
                    }
                    aria-label={t("increase", { name: label })}
                    className="inline-flex size-11 items-center justify-center rounded-e-sm border border-line-strong text-xl hover:bg-surface"
                  >
                    +
                  </button>
                </div>
                <p className="hidden print:block">
                  {t("qty")}: <span className="tabular">{line.qty}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    updateList((l) => removeItem(l, line.sku));
                    setAnnouncement(t("removed", { name: label }));
                  }}
                  className="min-h-11 px-2 text-sm underline underline-offset-4 print:hidden"
                >
                  {t("remove")}
                  <span className="sr-only"> {label}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xl">
          {t("total")}:{" "}
          <span className="font-semibold tabular">
            {formatPrice(total, locale)}
          </span>
        </p>
        <p className="text-sm text-ink-muted">{t("totalNote")}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 print:hidden">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("solid")}
          >
            <ChatIcon />
            {t("sendWhatsapp")}
            <span className="sr-only"> {common("opensInNewTab")}</span>
          </a>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className={buttonClass("outline")}
        >
          {t("print")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("clearConfirm"))) {
              saveList(emptyList);
              setAnnouncement(t("cleared"));
            }
          }}
          className={buttonClass("quiet")}
        >
          {t("clear")}
        </button>
      </div>
    </div>
  );
}
