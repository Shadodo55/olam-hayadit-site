import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * In-place preview on product pages (ProductScene): drawn to scale, follows
 * the chosen variant. Products are picked from a category, never by slug.
 */
async function openFirstProduct(page: Page, categoryPath: string) {
  await page.goto(categoryPath);
  const href = await page
    .locator("main article h3 a")
    .first()
    .getAttribute("href");
  await page.goto(href!);
}

test("a kitchen handle can be seen in place, and follows the chosen size", async ({
  page,
}) => {
  await openFirstProduct(page, "/catalog/handles/kitchen-furniture");
  const gallery = page.getByRole("region", { name: "תמונות המוצר" });
  const views = page.getByRole("group", { name: "אופן התצוגה" });
  await expect(views.getByRole("button", { name: "תמונות" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await views.getByRole("button", { name: "הדמיה במקום" }).click();
  const scene = page.getByTestId("gallery-scene");
  await expect(scene).toBeVisible();
  await expect(scene.locator("[data-scene]")).toHaveAttribute(
    "data-scene",
    "kitchenBar",
  );
  await expect(scene.locator("figcaption")).toContainText("בגודל אמיתי");

  // Another size: the preview stays up and redraws at the new size.
  const otherSize = page
    .getByRole("group", { name: /מידה|מרחק בין חורים/ })
    .locator("input[type=radio]:not(:checked):not(:disabled)")
    .first();
  if (await otherSize.count()) {
    const before = await scene
      .locator("[data-scene]")
      .getAttribute("data-length");
    await views.getByRole("button", { name: "תמונות" }).click();
    await otherSize.locator("xpath=..").click();
    // Picking a size brings the preview back by itself.
    await expect(scene).toBeVisible();
    await expect(scene.locator("[data-scene]")).not.toHaveAttribute(
      "data-length",
      before!,
    );
  }

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
  await expect(gallery).toBeVisible();
});

test("door handles are shown on a door", async ({ page }) => {
  await openFirstProduct(page, "/catalog/handles/door");
  await page
    .getByRole("group", { name: "אופן התצוגה" })
    .getByRole("button", { name: "הדמיה במקום" })
    .click();
  await expect(
    page.getByTestId("gallery-scene").locator("[data-scene]"),
  ).toHaveAttribute("data-scene", "doorLever");
});

test("products without a scene show photos only", async ({ page }) => {
  await openFirstProduct(page, "/catalog/technical/hinges");
  await expect(page.getByRole("group", { name: "אופן התצוגה" })).toHaveCount(0);
});
