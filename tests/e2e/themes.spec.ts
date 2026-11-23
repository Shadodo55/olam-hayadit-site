import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Colour themes (design demo, see src/lib/theme.ts). The default "logo"
 * theme is covered by a11y.spec.ts; here every other theme must also pass
 * axe (contrast!) on the main page types, and the picker must work by keyboard.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const THEME_KEY = "olam-hayadit.theme";

async function useTheme(page: Page, theme: string) {
  await page.addInitScript(
    ({ key, value }) => {
      // Only before the first load, so a test can change the theme later.
      if (sessionStorage.getItem("theme-test-init")) return;
      sessionStorage.setItem("theme-test-init", "1");
      localStorage.setItem(key, value);
      localStorage.setItem(
        "olam-hayadit.consent.v1",
        JSON.stringify({
          analytics: false,
          media: false,
          decidedAt: "2026-01-01T00:00:00Z",
        }),
      );
    },
    { key: THEME_KEY, value: theme },
  );
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
}

for (const theme of ["petrol", "classic"]) {
  test.describe(`theme ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await useTheme(page, theme);
    });

    for (const path of ["/", "/en", "/catalog/handles", "/visit"]) {
      test(`${path} has zero axe violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expectNoAxeViolations(page);
      });
    }

    test("a product page has zero axe violations", async ({ page }) => {
      await page.goto("/catalog/handles");
      const href = await page
        .locator("main article h3 a")
        .first()
        .getAttribute("href");
      await page.goto(href!);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expectNoAxeViolations(page);
    });
  });
}

test("the theme picker works by keyboard and remembers the choice", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "keyboard use is checked on desktop");
  await useTheme(page, "logo");
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-theme", /.+/);

  const button = page.getByRole("button", { name: "ערכת צבעים" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("aria-expanded", "true");

  const group = page.getByRole("group", { name: "בחירת ערכת צבעים (דמו)" });
  await expect(group.getByRole("radio", { name: "צבעי השלט" })).toBeChecked();
  await group.getByRole("radio", { name: "צבעי השלט" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(group.getByRole("radio", { name: "פטרול רגוע" })).toBeChecked();
  await expect(html).toHaveAttribute("data-theme", "petrol");

  await page.keyboard.press("Escape");
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "false");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "petrol");
});
