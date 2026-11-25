"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * The phone action bar's <nav>. On a page with its own main actions near the
 * top (the home hero, marked `data-hero-actions`), the bar stays hidden until
 * those actions have scrolled away, so it never covers them. The hiding
 * itself is CSS (globals.css), so there's no flash before this runs; this
 * only marks when the visitor is past the hero. Pages without a hero show the
 * bar from the start.
 */
export function ActionBarShell({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-hero-actions]");
    if (!target) return;
    // A scroll check (not an IntersectionObserver): a fast jump from below
    // the hero to above it never "intersects", and would leave a stale state.
    let frame = 0;
    const update = () => {
      frame = 0;
      setPastHero(target.getBoundingClientRect().bottom < 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return (
    <nav
      aria-label={label}
      data-past-hero={pastHero || undefined}
      className={className}
    >
      {children}
    </nav>
  );
}
