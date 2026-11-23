"use client";

import { useSyncExternalStore } from "react";
import { emptyList, parseList, type SavedList } from "@/commerce/list";

/**
 * Browser storage for "My list" (localStorage, this device only; it's a
 * feature the visitor asked for, not tracking). Syncs across open tabs.
 */
export const LIST_STORAGE_KEY = "olam-hayadit.my-list.v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let memory: string | null = null;
let cachedRaw: string | null | undefined;
let cached: SavedList = emptyList;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(LIST_STORAGE_KEY);
  } catch {
    return memory;
  }
}

export function getList(): SavedList {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseList(raw);
  }
  return cached;
}

export function saveList(list: SavedList): void {
  const raw = JSON.stringify(list);
  try {
    window.localStorage.setItem(LIST_STORAGE_KEY, raw);
  } catch {
    memory = raw;
  }
  listeners.forEach((l) => l());
}

export function updateList(change: (list: SavedList) => SavedList): void {
  saveList(change(getList()));
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LIST_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const NOT_HYDRATED = null;

/** The saved list, or `null` while pre-rendering/hydrating (unknown yet). */
export function useSavedList(): SavedList | null {
  return useSyncExternalStore<SavedList | null>(
    subscribe,
    getList,
    () => NOT_HYDRATED,
  );
}
