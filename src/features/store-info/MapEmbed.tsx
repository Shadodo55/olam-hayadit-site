"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { getConsent, setConsent } from "@/features/consent/consent-store";
import { useConsent } from "@/features/consent/useConsent";

/**
 * Google Maps embed that loads ONLY after consent ("external content") or an
 * explicit click for this one map. Before that, nothing is requested from Google.
 */
export function MapEmbed({ query, name }: { query: string; name: string }) {
  const t = useTranslations("map");
  const consent = useConsent();
  const [showOnce, setShowOnce] = useState(false);
  const allowed = showOnce || consent?.media === true;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  if (allowed) {
    return (
      <iframe
        src={src}
        title={t("title", { name })}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full border border-line sm:aspect-video"
      />
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-start justify-end gap-4 border border-line bg-surface p-6 sm:aspect-video">
      <p className="max-w-md text-ink-muted">{t("consentText")}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowOnce(true)}
          className={buttonClass("solid", "md")}
        >
          {t("showOnce")}
        </button>
        <button
          type="button"
          onClick={() => {
            const current = getConsent();
            setConsent({ analytics: current?.analytics ?? false, media: true });
          }}
          className={buttonClass("outline", "md")}
        >
          {t("showAlways")}
        </button>
      </div>
    </div>
  );
}
