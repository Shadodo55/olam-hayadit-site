"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

/**
 * Background video for the home hero (IS 5568 / WCAG 2.2.2):
 * muted, looping, with a poster, a visible pause/play button, and NO autoplay
 * when the visitor prefers reduced motion. It carries no essential information.
 */
export function HeroVideo({
  src,
  type,
  mobileSrc,
  mobileType,
  poster,
  mediaClassName = "",
}: {
  src: string;
  type: string;
  mobileSrc?: string | null;
  mobileType?: string | null;
  poster?: string | null;
  /** Extra classes for the <video> only (e.g. parallax), never the button. */
  mediaClassName?: string;
}) {
  const t = useTranslations("hero");
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Data saver on: keep the poster; the button still offers Play.
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;
    // Start once the page has loaded, so the video (about 1.5 MB) doesn't
    // compete with the text and pictures a phone on 4G must show first.
    const start = () =>
      void video.play().catch(() => {
        // Autoplay blocked (e.g. low-power mode): the poster stays and the button offers Play.
      });
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  return (
    <>
      <video
        ref={ref}
        muted
        loop
        playsInline
        // Nothing downloads before play starts (after the page has loaded).
        preload="none"
        poster={poster ?? undefined}
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`absolute inset-0 size-full object-cover ${mediaClassName}`}
        data-testid="hero-video"
      >
        {mobileSrc && (
          <source
            src={mobileSrc}
            type={mobileType ?? undefined}
            media="(max-width: 767px)"
          />
        )}
        <source src={src} type={type} />
      </video>
      <button
        type="button"
        onClick={toggle}
        // Icon only (a clean, quiet control); the name is for screen readers.
        // Focus: a white ring on the button plus a navy outline, so it shows
        // on a light picture and on dark video alike.
        className="absolute end-4 bottom-4 z-10 flex size-11 items-center justify-center rounded-full bg-ink/55 text-paper transition-colors hover:bg-ink/80 focus-visible:ring-2 focus-visible:ring-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true" className="inline-flex w-3 justify-center">
          {playing ? (
            <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
              <rect x="1" y="1" width="3.5" height="10" />
              <rect x="7.5" y="1" width="3.5" height="10" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
              <path d="M2 1 L11 6 L2 11 Z" />
            </svg>
          )}
        </span>
        <span className="sr-only">{playing ? t("pause") : t("play")}</span>
      </button>
    </>
  );
}
