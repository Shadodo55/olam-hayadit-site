"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { localized, type Locale } from "@/lib/i18n/locales";
import {
  facetOptions,
  holeSpacingSizes,
  priceBounds,
  type FilterState,
  type ProductCardData,
} from "../listing";

export type EnabledFilter =
  "brand" | "finish" | "material" | "size" | "holeToHole" | "price" | "inStock";

type ListFacet = "brand" | "finish" | "material" | "size" | "cc";

/**
 * Filter controls (native fieldsets + checkboxes). Rendered in the desktop
 * sidebar and inside the mobile dialog, so every id is prefixed.
 */
export function FiltersPanel({
  cards,
  state,
  enabled,
  onChange,
  idPrefix,
  measureHref,
}: {
  cards: readonly ProductCardData[];
  state: FilterState;
  enabled: readonly EnabledFilter[];
  onChange: (next: FilterState) => void;
  idPrefix: string;
  measureHref: string;
}) {
  const t = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const has = (f: EnabledFilter) => enabled.includes(f);
  // Sizes that only repeat a hole spacing would list the same numbers twice:
  // "size" keeps the real sizes (diameters, lengths) only.
  const ccSizes = has("holeToHole")
    ? holeSpacingSizes(cards)
    : new Set<string>();

  const toggle = (facet: ListFacet, value: string, checked: boolean) => {
    if (facet === "cc") {
      const n = Number(value);
      onChange({
        ...state,
        cc: checked ? [...state.cc, n] : state.cc.filter((x) => x !== n),
      });
    } else {
      const current = state[facet];
      onChange({
        ...state,
        [facet]: checked
          ? [...current, value]
          : current.filter((x) => x !== value),
      });
    }
  };

  const listFacet = (
    facet: ListFacet,
    title: string,
    extra?: React.ReactNode,
  ) => {
    const options = facetOptions(cards, state, facet).filter(
      (option) =>
        facet !== "size" ||
        !ccSizes.has(option.value) ||
        state.size.includes(option.value),
    );
    if (options.length === 0) return null;
    const selected: string[] =
      facet === "cc" ? state.cc.map(String) : state[facet];
    return (
      <fieldset key={facet} className="border-t border-line py-5">
        <legend className="float-start mb-3 w-full font-semibold">
          <span className="flex items-baseline justify-between gap-3">
            {title}
            {extra}
          </span>
        </legend>
        <ul className="clear-both space-y-1">
          {options.map((option) => {
            const id = `${idPrefix}-${facet}-${option.value}`.replace(
              /[^a-zA-Z0-9_-]/g,
              "_",
            );
            const label = localized(option.label, locale);
            return (
              <li key={option.value}>
                <label
                  htmlFor={id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 sm:min-h-9"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={(e) =>
                      toggle(facet, option.value, e.target.checked)
                    }
                    className="size-5 shrink-0 cursor-pointer accent-ink"
                  />
                  {facet === "finish" && (
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded-full border border-line-strong"
                      style={{
                        backgroundColor: option.swatch ?? "transparent",
                      }}
                    />
                  )}
                  <span
                    lang={label.isFallback ? "he" : undefined}
                    dir={facet === "cc" ? "auto" : undefined}
                  >
                    {label.value}
                  </span>
                  <span className="ms-auto text-sm text-ink-muted tabular">
                    {option.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    );
  };

  return (
    <div>
      {has("inStock") && (
        <div className="border-t border-line py-4">
          <label
            htmlFor={`${idPrefix}-stock`}
            className="flex min-h-11 cursor-pointer items-center gap-3 font-semibold"
          >
            <input
              id={`${idPrefix}-stock`}
              type="checkbox"
              checked={state.inStock}
              onChange={(e) =>
                onChange({ ...state, inStock: e.target.checked })
              }
              className="size-5 cursor-pointer accent-ink"
            />
            {t("inStock")}
          </label>
        </div>
      )}
      {has("finish") && listFacet("finish", t("finish"))}
      {has("holeToHole") &&
        listFacet(
          "cc",
          t("cc"),
          <Link
            href={measureHref}
            className="shrink-0 text-sm font-normal text-accent-ink underline underline-offset-4"
          >
            {t("howToMeasure")}
          </Link>,
        )}
      {has("size") && listFacet("size", t("size"))}
      {has("brand") && listFacet("brand", t("brand"))}
      {has("material") && listFacet("material", t("material"))}
      {has("price") && (
        <PriceFilter
          cards={cards}
          state={state}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      )}
    </div>
  );
}

function PriceFilter({
  cards,
  state,
  onChange,
  idPrefix,
}: {
  cards: readonly ProductCardData[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  idPrefix: string;
}) {
  const t = useTranslations("catalog");
  const bounds = priceBounds(cards);
  // Local text while typing; committed on blur / Enter so the list doesn't jump per keystroke.
  const [min, setMin] = useState(state.priceMin?.toString() ?? "");
  const [max, setMax] = useState(state.priceMax?.toString() ?? "");
  if (!bounds) return null;

  const commit = () => {
    const parse = (v: string) =>
      v.trim() === "" || Number.isNaN(Number(v))
        ? null
        : Math.max(0, Math.round(Number(v)));
    onChange({ ...state, priceMin: parse(min), priceMax: parse(max) });
  };
  const input = (
    id: string,
    label: string,
    value: string,
    set: (v: string) => void,
    placeholder: number,
  ) => (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm text-ink-muted">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        placeholder={String(placeholder)}
        onChange={(e) => set(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        className="mt-1 min-h-11 w-full rounded-sm border border-line-strong bg-paper px-3 tabular"
      />
    </div>
  );

  return (
    <fieldset className="border-t border-line py-5">
      <legend className="mb-3 font-semibold">{t("price")}</legend>
      <div className="flex gap-3">
        {input(`${idPrefix}-pmin`, t("priceMin"), min, setMin, bounds.min)}
        {input(`${idPrefix}-pmax`, t("priceMax"), max, setMax, bounds.max)}
      </div>
    </fieldset>
  );
}
