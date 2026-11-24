"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/icons";

/**
 * The sign's services as a slow, endless band. It moves only when motion is
 * allowed; it pauses on hover or focus and with a visible button (WCAG 2.2.2).
 * With reduced motion it is a static, wrapped list (see .marquee in CSS).
 */
export function ServicesMarquee({
  items,
  labels,
}: {
  items: readonly { value: string; isFallback: boolean }[];
  /** Server-translated (the "home" messages don't ship to the browser). */
  labels: { list: string; pause: string; play: string };
}) {
  const [paused, setPaused] = useState(false);

  const list = (copy: boolean) =>
    items.map((item) => (
      <li
        key={`${copy ? "copy-" : ""}${item.value}`}
        // The copy makes the loop seamless; screen readers skip it.
        aria-hidden={copy ? true : undefined}
        className={`${copy ? "marquee-copy" : ""} inline-flex shrink-0 items-center gap-3 px-8 font-display text-xl font-medium sm:text-2xl`}
        lang={item.isFallback ? "he" : undefined}
      >
        <CheckIcon className="shrink-0 text-accent-on-band" />
        {item.value}
      </li>
    ));

  return (
    <div
      className="marquee on-dark relative overflow-hidden bg-band py-6 text-on-band"
      data-paused={paused}
    >
      <ul aria-label={labels.list} className="marquee-track gap-y-3">
        {list(false)}
        {list(true)}
      </ul>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        // Icon only; the name is for screen readers.
        className="absolute end-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-on-band/25 bg-band text-on-band/80 transition-colors hover:bg-on-band/10 hover:text-on-band motion-reduce:hidden"
      >
        <svg
          viewBox="0 0 12 12"
          width="12"
          height="12"
          fill="currentColor"
          aria-hidden="true"
        >
          {paused ? (
            <path d="M2 1 L11 6 L2 11 Z" />
          ) : (
            <>
              <rect x="1" y="1" width="3.5" height="10" />
              <rect x="7.5" y="1" width="3.5" height="10" />
            </>
          )}
        </svg>
        <span className="sr-only">{paused ? labels.play : labels.pause}</span>
      </button>
    </div>
  );
}
