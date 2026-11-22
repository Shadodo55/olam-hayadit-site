"use client";

import type { ReactNode } from "react";
import { requestConsentSettings } from "./consent-store";

/** Opens the cookie settings dialog from anywhere (e.g. the footer). */
export function CookieSettingsButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={requestConsentSettings}
    >
      {children}
    </button>
  );
}
