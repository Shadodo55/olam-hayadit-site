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
        className="absolute end-3 top-1/2 inline-flex min-h-11 -translate-y-1/2 items-center rounded-full border border-on-band/30 bg-band px-3 text-sm text-on-band/90 hover:bg-on-band/10 motion-reduce:hidden"
      >
        {paused ? labels.play : labels.pause}
      </button>
    </div>
  );
}
