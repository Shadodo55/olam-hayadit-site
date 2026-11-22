/**
 * Cookie-consent state, stored only in the visitor's browser (localStorage).
 * Nothing non-essential (analytics, maps, video embeds) may load until the
 * matching category is true. Bump STORAGE_KEY's version to re-ask everyone
 * (e.g. when a new category is added).
 */
export const STORAGE_KEY = "olam-hayadit.consent.v1";

export type ConsentCategory = "analytics" | "media";

export interface ConsentState {
  analytics: boolean;
  media: boolean;
  /** ISO timestamp of the decision (kept as evidence of consent). */
  decidedAt: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();

// Fallback when storage is blocked (private mode, disabled site data).
let memoryValue: string | null = null;
let cachedRaw: string | null | undefined;
let cachedState: ConsentState | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryValue;
  }
}

export function parseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as ConsentState).analytics === "boolean" &&
      typeof (value as ConsentState).media === "boolean" &&
      typeof (value as ConsentState).decidedAt === "string"
    ) {
      const v = value as ConsentState;
      return { analytics: v.analytics, media: v.media, decidedAt: v.decidedAt };
    }
  } catch {
    // corrupted value: ask again
  }
  return null;
}

/** Snapshot for useSyncExternalStore: stable reference while storage is unchanged. */
export function getConsent(): ConsentState | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parseConsent(raw);
  }
  return cachedState;
}

export function setConsent(
  choice: Pick<ConsentState, ConsentCategory>,
  now = new Date(),
): void {
  const raw = JSON.stringify({ ...choice, decidedAt: now.toISOString() });
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoryValue = raw;
  }
  listeners.forEach((listener) => listener());
}

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* "Open cookie settings" requests, e.g. from the footer link. */
const openListeners = new Set<Listener>();

export function requestConsentSettings(): void {
  openListeners.forEach((listener) => listener());
}

export function onConsentSettingsRequest(listener: Listener): () => void {
  openListeners.add(listener);
  return () => openListeners.delete(listener);
}
