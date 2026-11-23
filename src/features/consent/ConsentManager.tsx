"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import {
  getConsent,
  onConsentSettingsRequest,
  setConsent,
  type ConsentCategory,
} from "./consent-store";
import { useConsent } from "./useConsent";

type Choice = Record<ConsentCategory, boolean>;

/**
 * Cookie banner + settings dialog (Israeli Privacy Protection Law / Amendment 13):
 * - nothing optional loads before a decision;
 * - "Reject all" is as easy and as visible as "Accept all";
 * - the choice can be changed any time (footer "Cookie settings").
 */
export function ConsentManager({ policyHref }: { policyHref: string }) {
  const t = useTranslations("consent");
  const common = useTranslations("common");
  const consent = useConsent();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Choice>({
    analytics: false,
    media: false,
  });
  const [announcement, setAnnouncement] = useState("");

  const openSettings = useCallback(() => {
    const current = getConsent();
    setDraft({
      analytics: current?.analytics ?? false,
      media: current?.media ?? false,
    });
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => onConsentSettingsRequest(openSettings), [openSettings]);

  const decide = (choice: Choice) => {
    setConsent(choice);
    setAnnouncement(t("saved"));
    // The banner (and the control that had focus) disappears: keep keyboard
    // users anchored by moving focus to the main content.
    window.setTimeout(() => {
      const active = document.activeElement;
      if (!active || active === document.body || !active.isConnected) {
        document.getElementById("main")?.focus();
      }
    }, 0);
  };

  const categories: {
    key: ConsentCategory;
    title: string;
    description: string;
  }[] = [
    {
      key: "analytics",
      title: t("analytics"),
      description: t("analyticsDesc"),
    },
    { key: "media", title: t("media"), description: t("mediaDesc") },
  ];

  return (
    <>
      {consent === null && (
        <section
          aria-labelledby="consent-title"
          className="on-dark fixed inset-x-0 bottom-0 z-40 border-t border-on-band/20 bg-band text-on-band print:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-8">
            <div className="max-w-2xl">
              <h2 id="consent-title" className="font-display text-xl">
                {t("title")}
              </h2>
              <p className="mt-2 text-sm text-on-band/85">
                {t("body")}{" "}
                <Link
                  href={policyHref}
                  className="underline underline-offset-4"
                >
                  {t("policyLink")}
                </Link>
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                className={buttonClass("paper", "md")}
                onClick={() => decide({ analytics: true, media: true })}
              >
                {t("acceptAll")}
              </button>
              <button
                type="button"
                className={buttonClass("paper", "md")}
                onClick={() => decide({ analytics: false, media: false })}
              >
                {t("rejectAll")}
              </button>
              <button
                type="button"
                className={buttonClass("onDark", "md", "col-span-2")}
                onClick={openSettings}
              >
                {t("settings")}
              </button>
            </div>
          </div>
        </section>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="consent-settings-title"
        className="m-auto w-[calc(100%-2rem)] max-w-lg bg-paper p-0 text-ink"
      >
        <form method="dialog" onSubmit={() => decide(draft)} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="consent-settings-title" className="font-display text-2xl">
              {t("settingsTitle")}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="-me-2 -mt-2 inline-flex size-11 items-center justify-center rounded-sm hover:bg-surface"
            >
              <CloseIcon />
              <span className="sr-only">{common("close")}</span>
            </button>
          </div>
          <p className="mt-2 text-ink-muted">{t("settingsIntro")}</p>

          <ul className="mt-6 divide-y divide-line border-y border-line">
            <li className="flex items-start justify-between gap-4 py-4">
              <div>
                <p className="font-semibold">{t("necessary")}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {t("necessaryDesc")}
                </p>
              </div>
              <span className="shrink-0 text-sm text-ink-muted">
                {t("alwaysOn")}
              </span>
            </li>
            {categories.map((category) => (
              <li
                key={category.key}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div>
                  <label
                    htmlFor={`consent-${category.key}`}
                    className="block cursor-pointer font-semibold"
                  >
                    {category.title}
                  </label>
                  <p
                    id={`consent-${category.key}-desc`}
                    className="mt-1 text-sm text-ink-muted"
                  >
                    {category.description}
                  </p>
                </div>
                <input
                  id={`consent-${category.key}`}
                  type="checkbox"
                  aria-describedby={`consent-${category.key}-desc`}
                  checked={draft[category.key]}
                  onChange={(event) =>
                    setDraft((d) => ({
                      ...d,
                      [category.key]: event.target.checked,
                    }))
                  }
                  className="mt-1 size-6 shrink-0 cursor-pointer accent-ink"
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link href={policyHref} className="underline underline-offset-4">
              {t("policyLink")}
            </Link>
            <button type="submit" className={buttonClass("solid", "md")}>
              {t("save")}
            </button>
          </div>
        </form>
      </dialog>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
