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

test.beforeEach(async ({ page }) => {
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
});

test.describe("search", () => {
  test("shows instant results while typing and keeps the query in the URL", async ({
    page,
  }) => {
    await page.goto("/search");
    const input = page.getByRole("searchbox", { name: "מה מחפשים?" });
    await expect(
      page.getByRole("navigation", { name: /לפי קטגוריה/ }),
    ).toBeVisible();
    // Type only once the page is interactive (hydrated), or the input event
    // can be lost.
    await page.waitForLoadState("networkidle");
    await input.fill("ידית");
    await expect(page.locator("main").getByRole("status")).toHaveText(/נמצא/);
    await expect(page.getByRole("heading", { name: "מוצרים" })).toBeVisible();
    await expect(page).toHaveURL(/\?q=/);
    await expectNoAxeViolations(page);

    // The link opens with the same query.
    await page.reload();
    await expect(page.getByRole("searchbox")).toHaveValue("ידית");
    await expect(page.getByRole("heading", { name: "מוצרים" })).toBeVisible();
  });

  test("finds a product by its SKU and opens it", async ({ page }) => {
    // Take a real SKU from the catalog so the test doesn't depend on sample data.
    await page.goto("/catalog/handles");
    await page.locator("main article h3 a").first().click();
    const sku = (await page.getByTestId("variant-sku").textContent())!.trim();
    const title = (await page.locator("h1").textContent())!.trim();
    await page.goto(`/search?q=${encodeURIComponent(sku)}`);
    const result = page.getByRole("link", { name: new RegExp(title) }).first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.locator("h1")).toHaveText(title);
  });

  test("explains when nothing matches", async ({ page }) => {
    await page.goto("/search?q=zzzzqqq");
    await expect(page.getByText(/לא מצאנו מוצרים/)).toBeVisible();
  });

  test("works in English", async ({ page }) => {
    await page.goto("/en/search?q=handle");
    await expect(page.locator("main").getByRole("status")).toHaveText(/result/);
    await expectNoAxeViolations(page);
  });
});

test.describe("my list", () => {
  test("add from a product page, adjust, send to WhatsApp and clear", async ({
    page,
  }) => {
    await page.goto("/catalog/handles");
    await page.locator("main article h3 a").first().click();
    const sku = (await page.getByTestId("variant-sku").textContent())!.trim();

    const add = page.getByRole("button", { name: "הוספה לרשימה שלי" });
    await add.click();
    await add.click();
    await expect(page.getByText("ברשימה שלך: 2")).toBeVisible();
    // Header badge (screen-reader text)
    await expect(
      page.locator("header").getByText(/מוצר אחד ברשימה/),
    ).toBeAttached();

    await page.getByRole("link", { name: "לרשימה שלי" }).click();
    await expect(page.locator("h1")).toHaveText("הרשימה שלי");
    const qty = page.getByRole("spinbutton");
    await expect(qty).toHaveValue("2");
    await page.getByRole("button", { name: /הוספת יחידה של/ }).click();
    await expect(qty).toHaveValue("3");
    await expectNoAxeViolations(page);

    const whatsapp = page.getByRole("link", { name: /שליחת הרשימה בוואטסאפ/ });
    const text = decodeURIComponent(
      (await whatsapp.getAttribute("href")) ?? "",
    );
    expect(text).toContain(sku);
    expect(text).toContain("כמות: 3");

    // Survives a reload (saved on this device)
    await page.reload();
    await expect(page.getByRole("spinbutton")).toHaveValue("3");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "ניקוי הרשימה" }).click();
    await expect(page.getByText(/הרשימה עדיין ריקה/).first()).toBeVisible();
  });

  test("empty list invites browsing", async ({ page }) => {
    await page.goto("/my-list");
    await expect(page.getByText(/הרשימה עדיין ריקה/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "לקטלוג המוצרים" }),
    ).toBeVisible();
    await expectNoAxeViolations(page);
  });
});
