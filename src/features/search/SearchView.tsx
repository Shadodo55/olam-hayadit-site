"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/commerce/money";
import { SearchIcon } from "@/components/ui/icons";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { productPath } from "@/lib/routes";
import { createSearcher } from "./search";
import { useSearchIndex } from "./useSearchIndex";

const MAX_PRODUCTS = 60;

/** Reads ?q= once on load (must be inside <Suspense>). */
export function SearchWithParams({ whatsapp }: { whatsapp: string | null }) {
  const q = useSearchParams().get("q") ?? "";
  return <SearchView initialQuery={q} whatsapp={whatsapp} />;
}

export function SearchView({
  initialQuery,
  whatsapp,
}: {
  initialQuery: string;
  whatsapp: string | null;
}) {
  const t = useTranslations("search");
  const catalogT = useTranslations("catalog");
  const common = useTranslations("common");
  const header = useTranslations("header");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const indexState = useSearchIndex();

  // Mirror the query to the URL (shareable, survives refresh).
  useEffect(() => {
    const q = deferred.trim();
    window.history.replaceState(
      null,
      "",
      q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname,
    );
  }, [deferred, pathname]);

  const searcher = useMemo(
    () =>
      indexState.status === "ready" ? createSearcher(indexState.index) : null,
    [indexState],
  );
  const results = useMemo(
    () => searcher?.search(deferred) ?? { products: [], categories: [] },
    [searcher, deferred],
  );
  const hasQuery = deferred.trim().length > 0;
  const total = results.products.length + results.categories.length;

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="max-w-2xl"
      >
        <label htmlFor="site-search" className="block font-semibold">
          {t("label")}
        </label>
        <div className="mt-2 flex items-stretch gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              aria-describedby="search-hint"
              autoComplete="off"
              enterKeyHint="search"
              className="min-h-12 w-full rounded-sm border border-line-strong bg-paper ps-10 pe-3 text-lg"
            />
          </div>
        </div>
        <p id="search-hint" className="mt-2 text-sm text-ink-muted">
          {t("hint")}
        </p>
      </form>

      <p role="status" className="mt-8 text-ink-muted">
        {indexState.status === "loading" && t("loading")}
        {indexState.status === "error" && t("error")}
        {indexState.status === "ready" &&
          hasQuery &&
          t("results", { count: total })}
      </p>

      {indexState.status === "ready" && !hasQuery && (
        <nav aria-labelledby="browse-heading" className="mt-6">
          <h2 id="browse-heading" className="text-xl">
            {t("browse")}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {indexState.index.categories
              .filter((c) => !c.parent)
              .map((c) => (
                <li key={c.path}>
                  <Link
                    href={localeHref(locale, c.path)}
                    className="inline-flex min-h-11 items-center rounded-sm border border-line-strong px-4 hover:bg-surface"
                  >
                    {localized(c.title, locale).value}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      )}

      {hasQuery && results.categories.length > 0 && (
        <section aria-labelledby="cat-results" className="mt-6">
          <h2 id="cat-results" className="text-xl">
            {t("categories")}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {results.categories.map((c) => (
              <li key={c.path}>
                <Link
                  href={localeHref(locale, c.path)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-strong px-4 hover:bg-surface"
                >
                  {c.parent && (
                    <span className="text-sm text-ink-muted">
                      {localized(c.parent, locale).value} /
                    </span>
                  )}
                  {localized(c.title, locale).value}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasQuery && results.products.length > 0 && (
        <section aria-labelledby="product-results" className="mt-10">
          <h2 id="product-results" className="text-xl">
            {t("products")}
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {results.products.slice(0, MAX_PRODUCTS).map((p) => {
              const title = localized(p.title, locale);
              const price = formatPrice(p.priceMin, locale);
              return (
                <li key={p.id}>
                  <Link
                    href={localeHref(locale, productPath(p.slug))}
                    className="flex items-center gap-4 py-3 hover:bg-surface"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden bg-surface">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block font-semibold"
                        lang={title.isFallback ? "he" : undefined}
                      >
                        {title.value}
                        {p.isSample && (
                          <span className="ms-2 bg-ink px-1.5 py-0.5 align-middle text-xs text-paper">
                            {catalogT("sample")}
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-ink-muted" dir="ltr">
                        {p.sku}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular">
                      {p.priceMin === p.priceMax
                        ? price
                        : catalogT("priceFrom", { price })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {indexState.status === "ready" && hasQuery && total === 0 && (
        <div className="mt-6 max-w-prose">
          <p className="text-lg">
            {t("noResults", { query: deferred.trim() })}
          </p>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
            >
              {header("whatsapp")}
              <span className="sr-only"> {common("opensInNewTab")}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
