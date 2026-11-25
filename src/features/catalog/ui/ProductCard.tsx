"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/commerce/money";
import { localeHref, localized, type Locale } from "@/lib/i18n/locales";
import { productPath } from "@/lib/routes";
import type { ProductCardData } from "../listing";
import { StockLabel } from "./StockLabel";

const SIZES =
  "(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 50vw";

export function ProductCard({
  card,
  headingLevel = 3,
  priority = false,
  showNew = true,
}: {
  card: ProductCardData;
  headingLevel?: 2 | 3;
  priority?: boolean;
  /** Off where the whole list is new products ("New in store"). */
  showNew?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("catalog");
  const title = localized(card.title, locale);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const price = formatPrice(card.priceMin, locale);

  return (
    <article className="group relative flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ink">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface">
        {card.image ? (
          <>
            <Image
              src={card.image.src}
              alt=""
              fill
              sizes={SIZES}
              priority={priority}
              className={`object-contain transition-opacity duration-300 ${card.hoverImage ? "group-hover:opacity-0" : ""}`}
              style={{ objectPosition: card.image.objectPosition }}
              {...(card.image.blurDataURL
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: card.image.blurDataURL,
                  }
                : {})}
            />
            {card.hoverImage && (
              <Image
                src={card.hoverImage.src}
                alt=""
                fill
                sizes={SIZES}
                loading="lazy"
                className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ objectPosition: card.hoverImage.objectPosition }}
              />
            )}
          </>
        ) : null}
        <div className="absolute start-2 top-2 flex flex-wrap gap-1">
          {/* Teal, not the gold: gold is kept for the main buttons. */}
          {showNew && card.isNew && (
            <span className="rounded-sm bg-accent px-2 py-0.5 text-xs font-bold text-on-accent">
              {t("new")}
            </span>
          )}
          {card.isSample && (
            <span className="rounded-sm bg-ink px-2 py-0.5 text-xs font-semibold text-paper">
              {t("sample")}
            </span>
          )}
        </div>
      </div>

      <Heading
        className="mt-3 font-display text-lg leading-snug group-hover:text-accent-ink"
        lang={title.isFallback ? "he" : undefined}
      >
        <Link
          href={localeHref(locale, productPath(card.slug))}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {title.value}
        </Link>
      </Heading>

      <p className="mt-1 text-lg font-bold tabular" data-testid="card-price">
        {card.priceMin === card.priceMax ? price : t("priceFrom", { price })}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2 text-sm text-ink-muted">
        <StockLabel status={card.stock} />
        {card.finishes.length > 1 && (
          <span className="inline-flex items-center gap-1">
            {card.finishes.slice(0, 5).map((f) => (
              <span
                key={f.slug}
                aria-hidden="true"
                className="size-3 rounded-full border border-line-strong"
                style={{ backgroundColor: f.swatch ?? "transparent" }}
              />
            ))}
            <span className="sr-only">
              {t("finishesCount", { count: card.finishes.length })}
            </span>
          </span>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({
  cards,
  headingLevel = 3,
  scroller = false,
  showNew = true,
}: {
  cards: readonly ProductCardData[];
  headingLevel?: 2 | 3;
  /** On phones: one swipeable row (scroll-snap) instead of a grid. */
  scroller?: boolean;
  /** Off where the whole list is new products. */
  showNew?: boolean;
}) {
  const layout = scroller
    ? "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4 [&>li]:w-[72%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-auto"
    : "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4";
  return (
    <ul className={layout}>
      {cards.map((card, index) => (
        <li key={card.id}>
          <ProductCard
            card={card}
            headingLevel={headingLevel}
            priority={index < 4}
            showNew={showNew}
          />
        </li>
      ))}
    </ul>
  );
}
