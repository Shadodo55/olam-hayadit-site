"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import {
  ChatIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  PinIcon,
} from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NavItem, NavLink } from "./nav-types";

export interface QuickActions {
  tel: string;
  whatsapp: string;
  waze: string;
}

/**
 * Small-screen menu in a native modal <dialog>: the browser handles focus
 * trapping, Escape and making the page behind it inert. Contents are only
 * rendered while open, so the category links are not duplicated in the HTML.
 */
export function MobileMenu({
  items,
  secondary,
  quick,
}: {
  items: NavItem[];
  secondary: NavLink[];
  quick: QuickActions;
}) {
  const t = useTranslations("header");
  const common = useTranslations("common");
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
    dialogRef.current?.showModal();
  };
  const hide = () => dialogRef.current?.close();

  const linkClass =
    "flex min-h-12 items-center text-lg aria-[current=page]:font-semibold aria-[current=page]:text-brass-ink";

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className="-ms-2 inline-flex size-11 items-center justify-center rounded-sm hover:bg-surface lg:hidden"
      >
        <MenuIcon width={24} height={24} />
        <span className="sr-only">{t("openMenu")}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-menu-title"
        onClose={() => setOpen(false)}
        className="m-0 me-auto h-dvh max-h-none w-full max-w-sm bg-paper p-0 text-ink"
      >
        {open && (
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <h2 id="mobile-menu-title" className="font-display text-2xl">
                {t("menuTitle")}
              </h2>
              <button
                type="button"
                onClick={hide}
                className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-surface"
              >
                <CloseIcon width={24} height={24} />
                <span className="sr-only">{t("closeMenu")}</span>
              </button>
            </div>

            <nav aria-label={t("mainNav")} className="px-4 py-2">
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.href}>
                    {item.children?.length ? (
                      <details
                        open={pathname.startsWith(item.href)}
                        className="group"
                      >
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-lg [&::-webkit-details-marker]:hidden">
                          {item.label}
                          <span
                            aria-hidden="true"
                            className="text-2xl leading-none text-ink-muted group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <ul className="mb-3 border-s border-line ps-4">
                          {[
                            {
                              label: item.allLabel ?? item.label,
                              href: item.href,
                            },
                            ...item.children,
                          ].map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={hide}
                                aria-current={
                                  pathname === link.href ? "page" : undefined
                                }
                                className="flex min-h-11 items-center aria-[current=page]:font-semibold aria-[current=page]:text-brass-ink"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={hide}
                        aria-current={
                          pathname === item.href ? "page" : undefined
                        }
                        className={linkClass}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-label={t("secondaryNav")}
              className="border-t border-line px-4 py-2"
            >
              <ul>
                {secondary.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={hide}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className="flex min-h-11 items-center text-ink-muted hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <section
              aria-labelledby="mobile-quick"
              className="mt-auto border-t border-line px-4 py-4"
            >
              <h3 id="mobile-quick" className="sr-only">
                {t("quickActions")}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={quick.tel}
                  className={buttonClass(
                    "outline",
                    "sm",
                    "flex-col gap-1! py-2",
                  )}
                >
                  <PhoneIcon />
                  {t("call")}
                </a>
                <a
                  href={quick.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass(
                    "outline",
                    "sm",
                    "flex-col gap-1! py-2",
                  )}
                >
                  <ChatIcon />
                  {t("whatsapp")}
                  <span className="sr-only">{common("opensInNewTab")}</span>
                </a>
                <a
                  href={quick.waze}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass(
                    "outline",
                    "sm",
                    "flex-col gap-1! py-2",
                  )}
                >
                  <PinIcon />
                  Waze
                  <span className="sr-only">{common("opensInNewTab")}</span>
                </a>
              </div>
              <LanguageSwitcher className="mt-3" />
            </section>
          </div>
        )}
      </dialog>
    </>
  );
}
