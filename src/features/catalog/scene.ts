import type { Category } from "./category-tree";

/**
 * "In-place preview" scenes: how a product looks where it's used, drawn to
 * real scale (kitchen cabinet, door, bathroom wall…). Chosen per category in
 * the CMS (`scene`), inherited by subcategories, and overridable per product.
 * Keep in sync with SCENES in studio/lib/constants.ts.
 */
export const SCENE_KINDS = [
  "kitchenBar",
  "kitchenKnob",
  "doorLever",
  "fridgeBar",
  "towelBar",
  "wallHook",
  "furnitureLeg",
] as const;
export type SceneKind = (typeof SCENE_KINDS)[number];
/** A stored scene value: a kind, or "none" to switch the preview off. */
export type SceneSetting = SceneKind | "none";

export function toSceneSetting(value: unknown): SceneSetting | null {
  if (value === "none") return "none";
  return SCENE_KINDS.includes(value as SceneKind) ? (value as SceneKind) : null;
}

/** Path of categories (root → leaf) for a category id, or null. */
export function chainForId(
  tree: readonly Category[],
  id: string,
): Category[] | null {
  for (const node of tree) {
    if (node.id === id) return [node];
    const sub = node.children ? chainForId(node.children, id) : null;
    if (sub) return [node, ...sub];
  }
  return null;
}

/**
 * The product's own setting wins; otherwise the nearest category (or
 * ancestor) that has one, in the order the product lists its categories.
 */
export function resolveScene(
  product: { scene: SceneSetting | null; categoryIds: readonly string[] },
  tree: readonly Category[],
): SceneKind | null {
  const pick = (setting: SceneSetting | null | undefined) =>
    setting === "none" ? null : (setting ?? undefined);
  const own = pick(product.scene);
  if (product.scene) return own ?? null;
  for (const id of product.categoryIds) {
    const chain = chainForId(tree, id) ?? [];
    for (const category of [...chain].reverse()) {
      if (category.scene) return pick(category.scene) ?? null;
    }
  }
  return null;
}
