import en from "@/messages/en.json";
import he from "@/messages/he.json";
import type { Locale } from "./locales";

export type Messages = typeof he;

// Compile-time check that the English file has exactly the same keys.
const english: Messages = en;

const all: Record<Locale, Messages> = { he, en: english };

export function messagesFor(locale: Locale): Messages {
  return all[locale];
}

/** Namespaces that client components need. Keep this list small: it ships to the browser. */
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
] as const;

export function clientMessagesFor(
  locale: Locale,
): Pick<Messages, (typeof clientNamespaces)[number]> {
  const messages = all[locale];
  return Object.fromEntries(
    clientNamespaces.map((ns) => [ns, messages[ns]]),
  ) as Pick<Messages, (typeof clientNamespaces)[number]>;
}
