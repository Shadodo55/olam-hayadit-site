"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/commerce/money";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";
import { localized, type Locale } from "@/lib/i18n/locales";
import type { Variant } from "../product";
import {
  defaultSelection,
  findVariant,
  finishOf,
  selectFinish,
  selectionForSku,
  selectSize,
  sizeOf,
  variantOptions,
  whatsappText,
  type Selection,
} from "../variants";
import { StockLabel } from "./StockLabel";

interface Props {
  variants: Variant[];
  name: string;
  /** Absolute product URL (for the WhatsApp message). */
  url: string;
  whatsappId: string | null;
  tel: string | null;
}

/** Variant picker + price + availability actions. Reads/writes ?sku= in the URL. */
export function ProductPurchase(props: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selection, setSelection] = useState<Selection>(
    () =>
      selectionForSku(props.variants, searchParams.get("sku")) ??
      defaultSelection(props.variants),
  );
  const onSelect = (next: Selection) => {
    setSelection(next);
    const sku = findVariant(props.variants, next)?.sku;
    if (sku)
      window.history.replaceState(
        null,
        "",
        `${pathname}?sku=${encodeURIComponent(sku)}`,
      );
  };
  return <PurchaseView {...props} selection={selection} onSelect={onSelect} />;
}

/** Static-HTML version (before hydration): default variant, controls inert. */
export function ProductPurchaseFallback(props: Props) {
  return (
    <PurchaseView {...props} selection={defaultSelection(props.variants)} />
  );
}

function PurchaseView({
  variants,
  name,
  url,
  whatsappId,
  tel,
  selection,
  onSelect,
}: Props & { selection: Selection; onSelect?: (next: Selection) => void }) {
  const t = useTranslations("product");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const variant = findVariant(variants, selection) ?? variants[0]!;
  const { finishes, sizes } = variantOptions(variants);
  const finishName = variant.finish
    ? localized(variant.finish.name, locale).value
    : null;
  const sizeName = variant.sizeLabel
    ? localized(variant.sizeLabel, locale).value
    : null;

  const message = whatsappText((values) => t("whatsappMessage", values), {
    name,
    sku: variant.sku,
    url: `${url}?sku=${encodeURIComponent(variant.sku)}`,
    ...(finishName
      ? { finishLine: t("whatsappFinish", { finish: finishName }) }
      : {}),
    ...(sizeName ? { sizeLine: t("whatsappSize", { size: sizeName }) } : {}),
  });
  const whatsappHref = whatsappId
    ? `https://wa.me/${whatsappId}?text=${encodeURIComponent(message)}`
    : null;

  const chip =
    "relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-3 has-[:checked]:border-ink has-[:checked]:bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink";

  return (
    <div>
      <p className="text-sm text-ink-muted">
        {t("sku")}:{" "}
        <span dir="ltr" className="tabular" data-testid="variant-sku">
          {variant.sku}
        </span>
      </p>

      <p className="mt-4 flex items-baseline gap-2">
        <span
          className="font-display text-4xl tabular"
          data-testid="variant-price"
        >
          {formatPrice(variant.price, locale)}
        </span>
        <span className="text-sm text-ink-muted">{t("priceIncVat")}</span>
      </p>
      <StockLabel status={variant.stock} className="mt-2" />

      {finishes.length > 1 && (
        <fieldset className="mt-8">
          <legend className="mb-3 font-semibold">
            {t("finish")}
            {finishName && (
              <span className="font-normal text-ink-muted">: {finishName}</span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {finishes.map((f) => {
              const label = localized(f.name, locale).value;
              return (
                <label key={f.slug} className={`${chip} border-line-strong`}>
                  <input
                    type="radio"
                    name="finish"
                    value={f.slug}
                    checked={selection.finish === f.slug}
                    disabled={!onSelect}
                    onChange={() =>
                      onSelect?.(selectFinish(variants, selection, f.slug))
                    }
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border border-line-strong"
                    style={{ backgroundColor: f.swatch ?? "transparent" }}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 1 && (
        <fieldset className="mt-6">
          <legend className="mb-3 font-semibold">
            {t("size")}
            {sizeName && (
              <span className="font-normal text-ink-muted">: {sizeName}</span>
            )}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const inFinish = variants.some(
                (v) => sizeOf(v) === s.key && finishOf(v) === selection.finish,
              );
              return (
                <label
                  key={s.key}
                  className={`${chip} tabular ${inFinish ? "border-line-strong" : "border-dashed border-line-strong text-ink-muted"}`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={s.key}
                    checked={selection.size === s.key}
                    disabled={!onSelect}
                    onChange={() =>
                      onSelect?.(selectSize(variants, selection, s.key))
                    }
                    className="sr-only"
                  />
                  <span dir="auto">{localized(s.label, locale).value}</span>
                  {!inFinish && (
                    <span className="sr-only">({t("notInThisFinish")})</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("solid", "md", "flex-1")}
          >
            <ChatIcon />
            {t("whatsappCta")}
            <span className="sr-only"> {common("opensInNewTab")}</span>
          </a>
        )}
        {tel && (
          <a href={tel} className={buttonClass("outline", "md", "flex-1")}>
            <PhoneIcon />
            {t("callCta")}
          </a>
        )}
      </div>
    </div>
  );
}
