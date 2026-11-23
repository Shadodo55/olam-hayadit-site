/** Stock status as the store manages it (no live inventory counts). */
export const STOCK_STATUSES = [
  "inStore",
  "specialOrder",
  "askUs",
  "outOfStock",
] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export function isStockStatus(value: unknown): value is StockStatus {
  return (
    typeof value === "string" &&
    (STOCK_STATUSES as readonly string[]).includes(value)
  );
}

/** Can a visitor expect to get this (now or by order)? */
export function isAvailable(status: StockStatus): boolean {
  return status !== "outOfStock";
}

/**
 * Product-level status from its variants: the best availability wins
 * (in store > special order > ask us > out of stock).
 */
export function aggregateStock(statuses: readonly StockStatus[]): StockStatus {
  for (const status of STOCK_STATUSES) {
    if (statuses.includes(status)) return status;
  }
  return "askUs";
}
