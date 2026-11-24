"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { localized, type Locale, type Localized } from "@/lib/i18n/locales";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  facetOptions,
  parseFilters,
  serializeFilters,
  sortCards,
  SORT_KEYS,
  type FilterState,
  type ProductCardData,
  type SortKey,
} from "../listing";
import { FiltersPanel, type EnabledFilter } from "./FiltersPanel";
import { ProductGrid } from "./ProductCard";

const sortLabelKey: Record<
  SortKey,
  "sortNewest" | "sortPriceAsc" | "sortPriceDesc" | "sortName"
> = {
  newest: "sortNewest",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  name: "sortName",
};

/**
 * Filterable, sortable product listing. State lives in the URL (shareable,
 * back-button friendly). Rendered client-side inside <Suspense>; the static
 * HTML fallback is the full, unfiltered list (see CatalogListingFallback).
 */
export function CatalogBrowser({
  cards,
  enabled,
  measureHref,
}: {
  cards: readonly ProductCardData[];
  enabled: readonly EnabledFilter[];
  measureHref: string;
}) {
  const t = useTranslations("catalog");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Filter state lives in React state (instant UI) and is mirrored to the URL
  // (shareable link). The URL is only read once, on load.
  const [state, setState] = useState<FilterState>(() =>
    parseFilters(new URLSearchParams(searchParams.toString())),
  );
  const visible = useMemo(
    () => sortCards(applyFilters(cards, state), state.sort, locale),
    [cards, state, locale],
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // replaceState: no new history entry and no refetch.
  const update = (next: FilterState) => {
    setState(next);
    const query = serializeFilters(next);
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    );
  };

  const active = activeFilterCount(state);
  const chips = activeChips(cards, state, locale, {
    price: (min, max) => t("priceRange", { min, max }),
    inStock: t("inStock"),
  });

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-10">
      {enabled.length > 0 && (
        <aside
          aria-labelledby="filters-heading"
          className="hidden lg:col-span-3 lg:block"
        >
          <h2 id="filters-heading" className="mb-2 font-display text-xl">
            {t("filtersTitle")}
          </h2>
          <FiltersPanel
            cards={cards}
            state={state}
            enabled={enabled}
            onChange={update}
            idPrefix="d"
            measureHref={measureHref}
          />
        </aside>
      )}

      <section
        aria-labelledby="products-heading"
        className={enabled.length ? "lg:col-span-9" : "lg:col-span-12"}
      >
        <h2 id="products-heading" className="sr-only">
          {t("productsHeading")}
        </h2>

        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <p role="status" className="text-ink-muted">
            {t("results", { count: visible.length })}
          </p>
          <div className="flex items-end gap-2">
            {enabled.length > 0 && (
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setDialogOpen(true);
                  dialogRef.current?.showModal();
                }}
                className={buttonClass("outline", "sm", "h-11 lg:hidden")}
              >
                {t("openFilters")} {t("activeCount", { count: active })}
              </button>
            )}
            <div>
              <label htmlFor="sort" className="block text-sm text-ink-muted">
                {t("sort")}
              </label>
              <div className="relative mt-1">
                <select
                  id="sort"
                  value={state.sort}
                  onChange={(e) =>
                    update({ ...state, sort: e.target.value as SortKey })
                  }
                  className="h-11 appearance-none rounded-sm border border-line-strong bg-paper ps-3 pe-9"
                >
                  {SORT_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {t(sortLabelKey[key])}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-ink-muted" />
              </div>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => update(chip.remove(state))}
                  aria-label={t("removeFilter", { label: chip.label })}
                  className="inline-flex min-h-9 items-center gap-1 rounded-sm border border-line-strong px-2 text-sm hover:bg-surface"
                >
                  {chip.label}
                  <CloseIcon width={14} height={14} />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => update({ ...emptyFilters, sort: state.sort })}
                className="min-h-9 px-2 text-sm underline underline-offset-4"
              >
                {t("clearAll")}
              </button>
            </li>
          </ul>
        )}

        <div className="mt-8">
          {visible.length ? (
            <ProductGrid cards={visible} />
          ) : (
            <p className="max-w-prose text-lg">{t("noResults")}</p>
          )}
        </div>
      </section>

      {enabled.length > 0 && (
        <dialog
          ref={dialogRef}
          aria-labelledby="mobile-filters-title"
          onClose={() => setDialogOpen(false)}
          className="m-0 ms-auto h-dvh max-h-none w-full max-w-md bg-paper p-0 text-ink"
        >
          {dialogOpen && (
            <div className="flex min-h-full flex-col">
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <h2 id="mobile-filters-title" className="font-display text-2xl">
                  {t("filtersTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-surface"
                >
                  <CloseIcon width={24} height={24} />
                  <span className="sr-only">{common("close")}</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">
                <FiltersPanel
                  cards={cards}
                  state={state}
                  enabled={enabled}
                  onChange={update}
                  idPrefix="m"
                  measureHref={measureHref}
                />
              </div>
              <div className="sticky bottom-0 flex gap-2 border-t border-line bg-paper p-4">
                {active > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      update({ ...emptyFilters, sort: state.sort })
                    }
                    className={buttonClass("outline", "md")}
                  >
                    {t("clearAll")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  className={buttonClass("solid", "md", "flex-1")}
                >
                  {t("showResults", { count: visible.length })}
                </button>
              </div>
            </div>
          )}
        </dialog>
      )}
    </div>
  );
}

interface Chip {
  key: string;
  label: string;
  remove: (state: FilterState) => FilterState;
}

function activeChips(
  cards: readonly ProductCardData[],
  state: FilterState,
  locale: Locale,
  labels: { price: (min: string, max: string) => string; inStock: string },
): Chip[] {
  const chips: Chip[] = [];
  const labelFor = (
    facet: "brand" | "finish" | "material" | "size" | "cc",
    value: string,
  ): string => {
    const option = facetOptions(cards, emptyFilters, facet).find(
      (o) => o.value === value,
    );
    const label: Localized = option?.label ?? { he: value };
    return localized(label, locale).value;
  };
  for (const facet of ["finish", "cc", "size", "brand", "material"] as const) {
    const values = facet === "cc" ? state.cc.map(String) : state[facet];
    for (const value of values) {
      chips.push({
        key: `${facet}-${value}`,
        label: labelFor(facet, value),
        remove: (s) =>
          facet === "cc"
            ? { ...s, cc: s.cc.filter((x) => String(x) !== value) }
            : { ...s, [facet]: s[facet].filter((x) => x !== value) },
      });
    }
  }
  if (state.priceMin !== null || state.priceMax !== null) {
    chips.push({
      key: "price",
      label: labels.price(
        String(state.priceMin ?? 0),
        state.priceMax?.toString() ?? "∞",
      ),
      remove: (s) => ({ ...s, priceMin: null, priceMax: null }),
    });
  }
  if (state.inStock) {
    chips.push({
      key: "stock",
      label: labels.inStock,
      remove: (s) => ({ ...s, inStock: false }),
    });
  }
  return chips;
}
