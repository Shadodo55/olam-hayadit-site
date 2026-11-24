import type { ReactNode } from "react";

/** The four legal pages. Their text is a DRAFT until a lawyer reviews it. */
export const legalPages = [
  "accessibility",
  "privacy",
  "terms",
  "cookies",
] as const;
export type LegalPage = (typeof legalPages)[number];

/** Date shown as "last updated" on every legal page. Change it with the text. */
export const LEGAL_UPDATED = "2026-11-24";

/**
 * Business facts injected into the legal texts, so they always match the CMS.
 * Unknown values arrive as a visible [להשלמה] placeholder, never invented.
 */
export interface LegalFacts {
  name: string;
  address: ReactNode;
  storePhone: ReactNode;
  email: ReactNode;
  registrationNumber: ReactNode;
  coordinator: ReactNode;
  coordinatorContact: ReactNode;
  /** Placeholder for facts the store hasn't given yet (e.g. store accessibility). */
  missing: ReactNode;
  links: {
    privacy: string;
    cookies: string;
    visit: string;
    contact: string;
  };
  /** Opens the cookie settings dialog. */
  cookieSettings: (label: string) => ReactNode;
}

export type LegalContent = Record<LegalPage, (facts: LegalFacts) => ReactNode>;
