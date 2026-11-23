import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const STORAGE_KEY = "olam-hayadit.consent.v1";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
}

test.describe("cookie consent", () => {
  test("banner offers accept and reject with equal prominence", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "עוגיות ופרטיות" });
    await expect(banner).toBeVisible();
    const accept = banner.getByRole("button", { name: "אישור הכל" });
    const reject = banner.getByRole("button", { name: "דחיית הכל" });
    expect(await accept.getAttribute("class")).toBe(
      await reject.getAttribute("class"),
    );
  });

  test("rejecting hides the banner, stores the choice and survives reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "דחיית הכל" }).click();
    await expect(
      page.getByRole("region", { name: "עוגיות ופרטיות" }),
    ).toBeHidden();
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(JSON.parse(stored ?? "{}")).toMatchObject({
      analytics: false,
      media: false,
    });
    await page.reload();
    await expect(
      page.getByRole("region", { name: "עוגיות ופרטיות" }),
    ).toBeHidden();
  });

  test("choice can be changed later from the footer", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Accept all" }).click();
    await page.getByRole("button", { name: "Cookie settings" }).click();
    const dialog = page.getByRole("dialog", { name: "Cookie settings" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("checkbox", { name: "Usage statistics" }),
    ).toBeChecked();
    await expectNoAxeViolations(page);
    await dialog.getByRole("checkbox", { name: "Usage statistics" }).uncheck();
    await dialog.getByRole("button", { name: "Save my choice" }).click();
    await expect(dialog).toBeHidden();
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      STORAGE_KEY,
    );
    expect(JSON.parse(stored ?? "{}")).toMatchObject({
      analytics: false,
      media: true,
    });
  });
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("category menu opens with the keyboard and closes with Escape", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "קטגוריות" });
    const handles = nav.getByRole("button", { name: "ידיות" });
    await handles.focus();
    await page.keyboard.press("Enter");
    await expect(handles).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: "כל הידיות" })).toBeVisible();
    await expectNoAxeViolations(page);
    await page.keyboard.press("Escape");
    await expect(handles).toHaveAttribute("aria-expanded", "false");
    await expect(handles).toBeFocused();
    await expect(nav.getByRole("link", { name: "כל הידיות" })).toBeHidden();
  });

  test("language switcher keeps the same page", async ({ page }) => {
    await page.goto("/catalog/handles");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/catalog\/handles$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("h1")).toHaveText("Handles");
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens as a modal dialog and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const open = page.getByRole("button", { name: "פתיחת התפריט" });
    await open.click();
    const dialog = page.getByRole("dialog", { name: "תפריט" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "אביזרי אמבטיה" }),
    ).toBeVisible();
    await expectNoAxeViolations(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });

  test("navigating from the menu closes it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "פתיחת התפריט" }).click();
    const dialog = page.getByRole("dialog", { name: "תפריט" });
    await dialog.getByRole("link", { name: "אביזרי אמבטיה" }).click();
    await expect(page).toHaveURL(/\/catalog\/bathroom$/);
    await expect(dialog).toBeHidden();
  });
});

test.describe("open-now status", () => {
  test("shows open during opening hours (store time zone)", async ({
    page,
  }) => {
    // Monday 10:00 in Jerusalem
    await page.clock.setFixedTime(new Date("2026-11-23T10:00:00+02:00"));
    await page.goto("/");
    await expect(page.locator("header").getByText("פתוח עכשיו, עד 18:00")).toBeVisible();
  });

  test("names the next opening day on Friday afternoon", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-27T15:00:00+02:00"));
    await page.goto("/en");
    await expect(page.locator("header").getByText("Closed, opens Sunday at 07:30")).toBeVisible();
  });
});
