"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { isActivePath, type NavItem } from "./nav-types";

/**
 * Category navigation for wide screens. WAI-ARIA "disclosure navigation"
 * pattern: buttons with aria-expanded reveal plain lists of links (no
 * role="menu"). Escape closes and returns focus; clicking or tabbing outside closes.
 */
export function DesktopNav({
  items,
  label,
}: {
  items: NavItem[];
  label: string;
}) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenIndex(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        buttonRefs.current[openIndex]?.focus();
        setOpenIndex(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="hidden lg:block"
      onBlur={(event) => {
        if (!navRef.current?.contains(event.relatedTarget as Node | null))
          setOpenIndex(null);
      }}
    >
      <ul className="flex items-center gap-1">
        {items.map((item, index) => {
          const active = isActivePath(pathname, item.href);
          const itemClass = `inline-flex min-h-11 items-center gap-1.5 rounded-sm px-3 font-medium hover:bg-surface ${
            active
              ? "text-ink underline decoration-accent decoration-2 underline-offset-8"
              : "text-ink"
          }`;

          if (!item.children?.length) {
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={itemClass}
                  aria-current={
                    active ? (active === "page" ? "page" : "true") : undefined
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const panelId = `${baseId}-panel-${index}`;
          const open = openIndex === index;
          return (
            <li key={item.href} className="relative">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className={itemClass}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                {item.label}
                <ChevronDownIcon
                  className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
              </button>
              <div
                id={panelId}
                hidden={!open}
                className="absolute start-0 top-full z-30 mt-3 min-w-64 rounded-sm border border-line bg-paper py-2"
              >
                <ul>
                  {[
                    { label: item.allLabel ?? item.label, href: item.href },
                    ...item.children,
                  ].map((link, linkIndex) => {
                    const current = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={current ? "page" : undefined}
                          onClick={() => setOpenIndex(null)}
                          className={`flex min-h-11 items-center px-4 hover:bg-surface ${
                            linkIndex === 0
                              ? "border-b border-line font-semibold"
                              : ""
                          } ${current ? "text-accent-ink" : ""}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
