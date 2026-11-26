import en from "@/messages/en.json";
import he from "@/messages/he.json";
import { themePickerEnabled } from "@/lib/theme";
import type { Locale } from "./locales";

export type Messages = typeof he;

// Compile-time check that the English file has exactly the same keys.
const english: Messages = en;

const all: Record<Locale, Messages> = { he, en: english };

export function messagesFor(locale: Locale): Messages {
  return all[locale];
}

/**
 * Namespaces that client components need on every page. Keep this list small:
 * it ships with every page. The forms' texts ship only with the form pages
 * (`formMessagesFor`), the colour picker's only when the picker is on.
 */
const clientNamespaces = [
  "common",
  "header",
  "status",
  "consent",
  "days",
  "catalog",
  "product",
  "search",
  "list",
  "hero",
  "map",
  ...(themePickerEnabled ? (["theme"] as const) : []),
] as const;

function pick<K extends keyof Messages>(
  locale: Locale,
  namespaces: readonly K[],
): Pick<Messages, K> {
  const messages = all[locale];
  return Object.fromEntries(namespaces.map((ns) => [ns, messages[ns]])) as Pick<
    Messages,
    K
  >;
}

export const clientMessagesFor = (locale: Locale) =>
  pick(locale, clientNamespaces);

/** For a nested provider around the inquiry form (it replaces, not adds to). */
export const formMessagesFor = (locale: Locale) =>
  pick(locale, ["common", "header", "forms"]);
