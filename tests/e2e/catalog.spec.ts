import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
}

/** Dismiss the cookie banner so it doesn't cover controls. */
async function acceptNecessaryOnly(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "olam-hayadit.consent.v1",
      JSON.stringify({
        analytics: false,
        media: false,
        decidedAt: "2026-01-01T00:00:00Z",
      }),
    );
  });
}

/** Path of the first product shown on a category page (works with any content). */
async function firstProductPath(
  page: Page,
  category = "/catalog/handles",
): Promise<string> {
  await page.goto(category);
  const href = await page
    .locator("main article h3 a")
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/product\//);
  return href!;
}

test.beforeEach(async ({ page }) => {
  await acceptNecessaryOnly(page);
});

test.describe("category filters (desktop)", () => {
  test.skip(({ isMobile }) => isMobile, "desktop sidebar");

  test("filtering updates the URL, the result count and survives reload", async ({
    page,
  }) => {
    await page.goto("/catalog/handles");
    const status = page.getByRole("status").filter({ hasText: /נמצא/ });
    const before = await status.textContent();
    const sidebar = page.getByRole("complementary");
    const firstFinish = sidebar
      .getByRole("group", { name: /גימור/ })
      .getByRole("checkbox")
      .first();
    await firstFinish.check();
    await expect(page).toHaveURL(/finish=/);
    await expect(status).not.toHaveText(before ?? "");
    const filteredUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(filteredUrl);
    await expect(
      sidebar
        .getByRole("group", { name: /גימור/ })
        .getByRole("checkbox")
        .first(),
    ).toBeChecked();
    await page.getByRole("button", { name: /ניקוי כל המסננים/ }).click();
    await expect(page).not.toHaveURL(/finish=/);
    await expect(status).toHaveText(before ?? "");
  });

  test("sorting by price orders the cards", async ({ page }) => {
    await page.goto("/catalog/handles");
    await page.getByLabel("מיון").selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await page
      .getByTestId("card-price")
      .evaluateAll((els) =>
        els.map((el) => Number((el.textContent ?? "").replace(/[^\d.]/g, ""))),
      );
    expect(prices.length).toBeGreaterThan(1);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  test("a filter combination with no results explains what to do", async ({
    page,
  }) => {
    await page.goto("/catalog/handles?price=0-1");
    await expect(page.getByText(/אין מוצרים שמתאימים/)).toBeVisible();
    await expectNoAxeViolations(page);
  });
});

test.describe("category filters (mobile dialog)", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile dialog");

  test("filters open in a dialog and 'show results' closes it", async ({
    page,
  }) => {
    await page.goto("/catalog/handles");
    await page.getByRole("button", { name: /^סינון/ }).click();
    const dialog = page.getByRole("dialog", { name: "סינון מוצרים" });
    await expect(dialog).toBeVisible();
    await expectNoAxeViolations(page);
    await dialog.getByRole("checkbox", { name: /במלאי בחנות/ }).check();
    await expect(page).toHaveURL(/stock=1/);
    await dialog.getByRole("button", { name: /הצגת|אין תוצאות/ }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("product page", () => {
  test("has no accessibility violations in both languages", async ({
    page,
  }) => {
    const path = await firstProductPath(page);
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expectNoAxeViolations(page);
    await page.goto(`/en${path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expectNoAxeViolations(page);
  });

  test("choosing a variant updates SKU, URL and the WhatsApp message", async ({
    page,
  }) => {
    // A product with several finishes and sizes.
    await page.goto("/catalog/handles/kitchen-furniture");
    await page
      .locator("main article")
      .filter({ has: page.locator("span.sr-only", { hasText: /גימורים/ }) })
      .first()
      .locator("h3 a")
      .click();
    const sku = page.getByTestId("variant-sku");
    const before = await sku.textContent();
    const finishes = page
      .getByRole("group", { name: /גימור/ })
      .getByRole("radio");
    const count = await finishes.count();
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count; i++) {
      if (!(await finishes.nth(i).isChecked())) {
        await finishes.nth(i).check({ force: true });
        break;
      }
    }
    await expect(sku).not.toHaveText(before ?? "");
    const newSku = (await sku.textContent()) ?? "";
    await expect(page).toHaveURL(
      new RegExp(`sku=${encodeURIComponent(newSku)}`),
    );
    const whatsapp = page.getByRole("link", { name: /בדיקת זמינות בוואטסאפ/ });
    expect(
      decodeURIComponent((await whatsapp.getAttribute("href")) ?? ""),
    ).toContain(newSku);

    // The ?sku= link opens that exact variant.
    await page.reload();
    await expect(sku).toHaveText(newSku);
  });

  test("gallery zoom opens a dialog that closes with Escape", async ({
    page,
  }) => {
    const path = await firstProductPath(page);
    await page.goto(path);
    const zoom = page.getByRole("button", { name: /הגדלת התמונה/ });
    await zoom.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectNoAxeViolations(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(zoom).toBeFocused();
  });

  test("sample products are clearly marked", async ({ page }) => {
    const path = await firstProductPath(page);
    await page.goto(path);
    await expect(page.getByRole("note")).toContainText("מוצר לדוגמה");
  });
});

test("choosing a finish shows the photo in that finish", async ({ page }) => {
  await page.goto("/catalog/handles/kitchen-furniture");
  await page
    .locator("main article")
    .filter({ has: page.locator("span.sr-only", { hasText: /גימורים/ }) })
    .first()
    .locator("h3 a")
    .click();
  // The large photo's alt text names its finish (from the CMS).
  const photo = page.getByTestId("gallery-main").locator("img");
  const finishes = page
    .getByRole("group", { name: /גימור/ })
    .getByRole("radio");
  await page.waitForURL(/\/product\//);
  await expect(finishes.first()).toBeAttached();
  const count = await finishes.count();
  expect(count).toBeGreaterThan(1);
  for (let i = 0; i < count; i++) {
    const option = finishes.nth(i);
    await option.check({ force: true });
    const name = (
      (await option.getAttribute("aria-label")) ??
      (await option.locator("xpath=..").innerText())
    ).trim();
    await expect(photo).toHaveAttribute("alt", new RegExp(name));
  }
});
