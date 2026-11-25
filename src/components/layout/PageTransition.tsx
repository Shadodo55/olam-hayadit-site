"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { splitName } from "@/components/brand/Wordmark";

/**
 * closing: the door swings shut over the old page.
 * waiting: closed, the next page is still loading.
 * opening: the handle turns, the door swings open and we walk through.
 */
type Phase = "idle" | "closing" | "waiting" | "opening";

/** Keep in sync with the door animations at the end of globals.css. */
const CLOSE_MS = 420;
const OPEN_MS = 1000;
/** A load longer than this shows a progress line and a short note. */
const SLOW_AFTER_MS = 700;
/** Never keep the door shut longer than this, whatever happens. */
const MAX_WAIT_MS = 10_000;

/**
 * Page changes go through the store's door: it closes over the page, its
 * brass handle turns, and it opens onto the next page. A slow load keeps the
 * door closed with a progress line on the threshold instead of a frozen
 * screen. Decorative: hidden from screen readers, never takes focus, never
 * blocks clicks; off with reduced motion and for anything that isn't a
 * same-site page change.
 */
export function PageTransition({
  name,
  loadingLabel,
}: {
  name: string;
  loadingLabel: string;
}) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [slow, setSlow] = useState(false);
  const phaseRef = useRef<Phase>("idle");
  const ready = useRef(false);
  const fromPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const clearTimers = () => {
    for (const id of timers.current.splice(0)) window.clearTimeout(id);
  };
  const later = (ms: number, fn: () => void) =>
    timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    clearTimers();
    go("opening");
    later(OPEN_MS, () => {
      go("idle");
      setSlow(false);
    });
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const url = new URL(link.href, window.location.href);
      const here = window.location;
      if (url.origin !== here.origin) return; // other sites, tel:, mailto:
      if (url.pathname === here.pathname) return; // same page, #anchors, filters
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return; // files (PDF, JSON)
      // Hebrew <-> English is a full page load (two root layouts): no door.
      const isEnglish = (path: string) =>
        path === "/en" || path.startsWith("/en/");
      if (isEnglish(url.pathname) !== isEnglish(here.pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      fromPath.current = here.pathname;
      ready.current = false;
      clearTimers();
      setSlow(false);
      go("closing");
      later(CLOSE_MS, () => {
        if (ready.current) open();
        else go("waiting");
      });
      later(CLOSE_MS + SLOW_AFTER_MS, () => setSlow(true));
      later(MAX_WAIT_MS, open);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // `open`/`go` only touch refs and setState: stable enough for one listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new page is in place: open the door now, or once it has closed.
  useEffect(() => {
    if (pathname === fromPath.current) return;
    ready.current = true;
    if (phaseRef.current === "waiting") open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (phase === "idle") return null;
  const [first, second] = splitName(name);
  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      data-slow={slow ? "true" : undefined}
      className="door-scene print:hidden"
    >
      <div className="door-wall" />
      <div className="door-frame" />
      <div className="door-way">
        <div className="door-leaf on-dark bg-band text-on-band">
          {/* Raised panels */}
          <span className="door-panel door-panel-top border-on-band/15" />
          <span className="door-panel door-panel-bottom border-on-band/15" />
          {/* The store's sign on the upper panel */}
          <div className="door-sign">
            <LogoMark tone="dark" className="h-auto w-[42%]" />
            <p className="mt-3 wordmark text-[calc(var(--door-w)*0.07)] leading-tight text-wordmark-on-band">
              {first}
              {second && (
                <span className="block text-accent-on-band">{second}</span>
              )}
            </p>
            <p className="door-note mt-3 text-[calc(var(--door-w)*0.042)] text-on-band/80">
              {loadingLabel}
            </p>
          </div>
          {/* Brass lever handle, rosette and key escutcheon */}
          <svg viewBox="0 0 100 46" className="door-handle" focusable="false">
            <g className="door-lever fill-highlight">
              <path d="M12 8.5H83C91.5 8.5 96 11.8 96 16.4C96 20.2 92.8 22 88.6 22C80 22 40 19.6 12 19.6Z" />
              <path
                className="stroke-on-highlight/20"
                d="M30 18.2C52 18.8 76 20 88.6 20.2C91.4 20.2 93.4 19.2 93.9 17.6"
                fill="none"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
            <circle cx="12" cy="14" r="10" className="fill-highlight" />
            <circle cx="12" cy="14" r="6.5" className="fill-on-highlight/15" />
            <circle cx="12" cy="14" r="4.6" className="fill-highlight" />
            <circle cx="12" cy="37" r="6" className="fill-highlight" />
            <path
              d="M12 34.2A1.7 1.7 0 0 1 13 37.3L13.5 40H10.5L11 37.3A1.7 1.7 0 0 1 12 34.2Z"
              className="fill-band"
            />
          </svg>
        </div>
      </div>
      <div className="door-progress">
        <span className="bg-highlight" />
      </div>
    </div>
  );
}
