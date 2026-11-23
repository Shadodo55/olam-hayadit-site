"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { localized, type Locale } from "@/lib/i18n/locales";
import type { SiteImage } from "@/lib/sanity/image";

/**
 * Main image + thumbnails; the main image opens a zoom view in a native modal
 * <dialog> (focus trap, Escape). Arrow keys move between images, following the
 * reading direction (in Hebrew, ← is "next").
 */
export function ProductGallery({
  images,
  name,
}: {
  images: readonly SiteImage[];
  name: string;
}) {
  const t = useTranslations("product");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-surface p-6 text-center text-ink-muted">
        {t("noImage")}
      </div>
    );
  }

  const total = images.length;
  const current = images[index] ?? images[0]!;
  const alt = localized(current.alt, locale);
  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    <section aria-label={t("gallery")}>
      <button
        type="button"
        onClick={() => {
          setZoomOpen(true);
          dialogRef.current?.showModal();
        }}
        className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-surface"
      >
        <Image
          src={current.src}
          alt={alt.value}
          lang={alt.isFallback ? "he" : undefined}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-contain"
          style={{ objectPosition: current.objectPosition }}
          {...(current.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: current.blurDataURL }
            : {})}
        />
        <span className="sr-only">{t("zoom")}</span>
      </button>

      {total > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                className={`relative block aspect-[4/5] w-full overflow-hidden bg-surface ${
                  i === index
                    ? "outline-2 outline-offset-2 outline-ink"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain"
                />
                <span className="sr-only">
                  {t("showImage", { index: i + 1, total })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="zoom-title"
        onClose={() => setZoomOpen(false)}
        onKeyDown={(e) => {
          if (total < 2) return;
          const rtl = document.documentElement.dir === "rtl";
          if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
          if (e.key === "ArrowRight") go(rtl ? -1 : 1);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink"
      >
        {zoomOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
              <h2 id="zoom-title" className="truncate">
                {t("zoomTitle", { name, index: index + 1, total })}
              </h2>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm hover:bg-surface"
              >
                <CloseIcon width={24} height={24} />
                <span className="sr-only">{common("close")}</span>
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                src={current.src}
                alt={alt.value}
                lang={alt.isFallback ? "he" : undefined}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain"
              />
            </div>
            {total > 1 && (
              <div className="flex justify-center gap-3 border-t border-line p-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="min-h-11 rounded-sm border border-line-strong px-4 hover:bg-surface"
                >
                  {t("prevImage")}
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="min-h-11 rounded-sm border border-line-strong px-4 hover:bg-surface"
                >
                  {t("nextImage")}
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
