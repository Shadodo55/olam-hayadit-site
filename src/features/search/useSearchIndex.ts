"use client";

import { useEffect, useState } from "react";
import { SEARCH_INDEX_PATH, type SearchIndex } from "./search-index";

/** One download per page view, shared by every component that needs it. */
let pending: Promise<SearchIndex> | null = null;

export function loadSearchIndex(): Promise<SearchIndex> {
  if (!pending) {
    pending = fetch(SEARCH_INDEX_PATH)
      .then((res) => {
        if (!res.ok) throw new Error(`search index: HTTP ${res.status}`);
        return res.json() as Promise<SearchIndex>;
      })
      .catch((error: unknown) => {
        pending = null; // allow a retry
        throw error;
      });
  }
  return pending;
}

export type IndexState =
  | { status: "loading" }
  | { status: "ready"; index: SearchIndex }
  | { status: "error" };

export function useSearchIndex(): IndexState {
  const [state, setState] = useState<IndexState>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    loadSearchIndex().then(
      (index) => alive && setState({ status: "ready", index }),
      () => alive && setState({ status: "error" }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
