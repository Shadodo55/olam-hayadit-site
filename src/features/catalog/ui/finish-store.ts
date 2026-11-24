/**
 * The finish chosen in the product's variant picker (ProductPurchase), read
 * by the gallery (ProductGallery) to show the matching photo. A tiny shared
 * store: the two are separate client components on the product page.
 */
let current: string | null = null;
const listeners = new Set<() => void>();

export const finishStore = {
  get: (): string | null => current,
  set(finish: string | null) {
    if (finish === current) return;
    current = finish;
    for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
