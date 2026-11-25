/**
 * Tiny shared stores for the product page, whose parts are separate client
 * components: the variant picker (ProductPurchase) writes, the gallery and
 * the in-place preview (ProductGallery, ProductScene) read.
 */
function createStore<T>(initial: T) {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    get: (): T => current,
    set(next: T) {
      if (Object.is(next, current)) return;
      current = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** The chosen finish (slug): the gallery shows the matching photo. */
export const finishStore = createStore<string | null>(null);

/** The chosen variant (SKU): the preview draws its finish and size. */
export const skuStore = createStore<string | null>(null);

/** Counts size choices: picking a size brings the preview into view. */
export const sizePickStore = createStore(0);
