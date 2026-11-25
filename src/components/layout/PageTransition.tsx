"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { splitName } from "@/components/brand/Wordmark";

type Phase = "idle" | "cover" | "reveal";

/** The curtain stays at least this long, so the logo reads as a moment. */
const MIN_COVER_MS = 450;
const REVEAL_MS = 550;
/** Never leave the curtain up if a navigation doesn't happen. */
const SAFETY_MS = 2500;

/**
 * A short branded curtain (the logo and the store's name on the brand band)
 * between pages, instead of an instant jump. It starts when an internal link
 * is clicked and lifts once the new page is in place. Decorative: hidden from
 * screen readers, never takes focus, never blocks clicks; off with reduced
 * motion and for anything that isn't a same-site page change.
 */
export function PageTransition({ name }: { name: string }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const startedAt = useRef(0);
  const fromPath = useRef(pathname);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timers.current.splice(0)) window.clearTimeout(id);
  };
  const reveal = (delay: number) => {
    clearTimers();
    timers.current.push(
      window.setTimeout(() => setPhase("reveal"), delay),
      window.setTimeout(() => setPhase("idle"), delay + REVEAL_MS),
    );
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
      // Hebrew <-> English is a full page load (two root layouts): no curtain.
      const isEnglish = (path: string) =>
        path === "/en" || path.startsWith("/en/");
      if (isEnglish(url.pathname) !== isEnglish(here.pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      startedAt.current = performance.now();
      fromPath.current = here.pathname;
      clearTimers();
      setPhase("cover");
      timers.current.push(window.setTimeout(() => reveal(0), SAFETY_MS));
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // `reveal` only touches refs and setState: stable enough for one listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new page is in place: lift the curtain (after the minimum time).
  useEffect(() => {
    if (phase !== "cover" || pathname === fromPath.current) return;
    const elapsed = performance.now() - startedAt.current;
    reveal(Math.max(0, MIN_COVER_MS - elapsed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, phase]);

  if (phase === "idle") return null;
  const [first, second] = splitName(name);
  return (
    <div
      aria-hidden="true"
      className={`page-curtain on-dark pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-band text-on-band print:hidden ${phase === "cover" ? "curtain-in" : "curtain-out"}`}
    >
      <LogoMark tone="dark" className="curtain-logo h-auto w-32" />
      <p className="curtain-logo text-center wordmark text-3xl leading-tight text-wordmark-on-band sm:text-4xl">
        {first}
        {second && <span className="block text-accent-on-band">{second}</span>}
      </p>
      <span className="curtain-bar h-0.5 w-40 bg-accent-on-band" />
    </div>
  );
}
