"use client";

import { useSyncExternalStore } from "react";
import {
  getConsent,
  subscribeConsent,
  type ConsentState,
} from "./consent-store";

const NOT_HYDRATED = "not-hydrated" as const;
type Snapshot = ConsentState | null | typeof NOT_HYDRATED;

const serverSnapshot = (): Snapshot => NOT_HYDRATED;

/**
 * Current consent: `undefined` while pre-rendering/hydrating (unknown),
 * `null` when the visitor hasn't decided yet, otherwise their choice.
 */
export function useConsent(): ConsentState | null | undefined {
  const value = useSyncExternalStore<Snapshot>(
    subscribeConsent,
    getConsent,
    serverSnapshot,
  );
  return value === NOT_HYDRATED ? undefined : value;
}
