"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { finishStore, sizePickStore } from "./finish-store";
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
  scene,
}: {
  images: readonly SiteImage[];
  name: string;
  /** In-place preview (ProductScene), shown as a second view. */
  scene?: ReactNode;
}) {
  const t = useTranslations("product");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  // The photo follows the finish chosen in the variant picker, until the
  // visitor picks a photo themselves (for that finish).
  const finish = useSyncExternalStore(
    finishStore.subscribe,
    finishStore.get,
    () => null,
  );
  const [picked, setPicked] = useState<{
    index: number;
    finish: string | null;
  }>({ index: 0, finish: null });
  const finishIndex = finish
    ? images.findIndex((image) => image.finish === finish)
    : -1;
  const index =
    picked.finish === finish || finishIndex < 0 ? picked.index : finishIndex;
  const setIndex = (next: number | ((current: number) => number)) =>
    setPicked({
      index: typeof next === "function" ? next(index) : next,
      finish,
    });
  // Photos or the in-place preview. Picking a size brings the preview up
  // (sizes are easiest to judge in place), until the visitor switches back.
  const sizePicks = useSyncExternalStore(
    sizePickStore.subscribe,
    sizePickStore.get,
    () => 0,
  );
  const [viewChoice, setViewChoice] = useState<{
    view: "photos" | "scene";
    at: number;
  }>({ view: "photos", at: 0 });
  const view = !scene
    ? "photos"
    : sizePicks > viewChoice.at
      ? "scene"
      : viewChoice.view;
  const showView = (next: "photos" | "scene") =>
    setViewChoice({ view: next, at: sizePicks });
  const [zoomOpen, setZoomOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (images.length === 0 && !scene) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-surface p-6 text-center text-ink-muted">
        {t("noImage")}
      </div>
    );
  }

  const total = images.length;
  const current = images[index] ?? images[0];
  const alt = current ? localized(current.alt, locale) : null;
  const go = (delta: number) => setIndex((i) => (i + delta + total) % total);

  return (
    // On desktop the whole gallery is as wide as a 4:5 picture that fits the
    // screen, so photo, price and actions share the first view.
    <section
      aria-label={t("gallery")}
      className="lg:me-auto lg:max-w-[calc(min(66svh,42rem)*0.8)]"
    >
      {scene && (
        <div
          role="group"
          aria-label={t("viewsLabel")}
          className="mb-3 inline-flex rounded-full border border-line-strong p-1"
        >
          {(["photos", "scene"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => showView(option)}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${
                view === option
                  ? "bg-button text-on-button"
                  : "text-ink hover:bg-surface"
              }`}
            >
              {option === "photos" ? t("viewPhotos") : t("viewScene")}
            </button>
          ))}
        </div>
      )}
      {view === "scene" ? (
        <div
          className="aspect-[4/5] w-full overflow-hidden border border-line bg-surface"
          data-testid="gallery-scene"
        >
          {scene}
        </div>
      ) : !current || !alt ? (
        <div className="flex aspect-[4/5] w-full items-center justify-center bg-surface p-6 text-center text-ink-muted">
          {t("noImage")}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setZoomOpen(true);
            dialogRef.current?.showModal();
          }}
          className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-surface"
          data-testid="gallery-main"
        >
          <Image
            src={current.src}
            alt={alt.value}
            lang={alt.isFallback ? "he" : undefined}
            fill
            priority
            sizes="(min-width: 1024px) 34rem, 100vw"
            className="object-contain"
            style={{ objectPosition: current.objectPosition }}
            {...(current.blurDataURL
              ? {
                  placeholder: "blur" as const,
                  blurDataURL: current.blurDataURL,
                }
              : {})}
          />
          <span className="sr-only">{t("zoom")}</span>
        </button>
      )}

      {total > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, i) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  showView("photos");
                }}
                aria-current={
                  i === index && view === "photos" ? "true" : undefined
                }
                className={`relative block aspect-[4/5] w-full overflow-hidden bg-surface ${
                  i === index && view === "photos"
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
        {zoomOpen && current && alt && (
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
