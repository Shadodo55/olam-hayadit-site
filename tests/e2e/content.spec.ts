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

async function necessaryCookiesOnly(page: Page) {
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

test.describe("home page", () => {
  test("hero video plays muted and can be paused", async ({ browser }) => {
    // Autoplay needs motion allowed (other specs run with reduced motion).
    const context = await browser.newContext({
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await necessaryCookiesOnly(page);
    await page.goto("/");
    const video = page.getByTestId("hero-video");
    test.skip((await video.count()) === 0, "no hero video in the CMS");
    await expect(video).toHaveJSProperty("muted", true);
    const pause = page.getByRole("button", { name: "עצירת וידאו הרקע" });
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(video).toHaveJSProperty("paused", true);
    await expect(
      page.getByRole("button", { name: "הפעלת וידאו הרקע" }),
    ).toBeVisible();
    await context.close();
  });

  test("hero video does not autoplay with reduced motion", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await necessaryCookiesOnly(page);
    await page.goto("/");
    const video = page.getByTestId("hero-video");
    test.skip((await video.count()) === 0, "no hero video in the CMS");
    await page.waitForTimeout(500);
    await expect(video).toHaveJSProperty("paused", true);
    await expect(
      page.getByRole("button", { name: "הפעלת וידאו הרקע" }),
    ).toBeVisible();
    await context.close();
  });

  test("has one h1, categories and the visit section", async ({ page }) => {
    await necessaryCookiesOnly(page);
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "קטגוריות" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "בואו לראות מקרוב" }),
    ).toBeVisible();
  });
});

test.describe("map consent", () => {
  test("map loads only after an explicit choice", async ({ page }) => {
    await necessaryCookiesOnly(page);
    const google: string[] = [];
    page.on("request", (r) => {
      if (/google\./.test(new URL(r.url()).hostname)) google.push(r.url());
    });
    await page.goto("/visit");
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(google).toEqual([]);
    await page.getByRole("button", { name: "הצגת המפה" }).click();
    await expect(page.locator("iframe[title^='מפה']")).toHaveCount(1);
  });

  test("'always show maps' saves the external-content consent", async ({
    page,
  }) => {
    await necessaryCookiesOnly(page);
    await page.goto("/visit");
    await page.getByRole("button", { name: "הצגת מפות תמיד" }).click();
    await expect(page.locator("iframe[title^='מפה']")).toHaveCount(1);
    const stored = await page.evaluate(() =>
      localStorage.getItem("olam-hayadit.consent.v1"),
    );
    expect(JSON.parse(stored ?? "{}")).toMatchObject({
      media: true,
      analytics: false,
    });
  });
});

test.describe("content pages", () => {
  test.beforeEach(async ({ page }) => necessaryCookiesOnly(page));

  test("FAQ answers open with the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    await page.goto("/faq");
    const first = page.locator("details").first();
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
  });

  test("measuring guide links to the catalog filtered by size", async ({
    page,
  }) => {
    await page.goto("/measuring-guide");
    await expect(page.getByRole("img", { name: /איור/ })).toBeVisible();
    await page.getByRole("link", { name: /128 מ״מ/ }).click();
    await expect(page).toHaveURL(/\/catalog\/handles\?cc=128$/);
  });

  test("catalog downloads name the file type and size", async ({ page }) => {
    await page.goto("/catalogs");
    const download = page.getByRole("link", { name: /הורדה/ }).first();
    test.skip((await download.count()) === 0, "no catalogs in the CMS");
    await expect(download).toHaveAccessibleName(/PDF/);
    expect(await download.getAttribute("href")).toMatch(
      /^https:\/\/cdn\.sanity\.io\/.+\?dl=$/,
    );
  });

  test("brand and project pages list their products", async ({ page }) => {
    await page.goto("/brands");
    await page.locator("main ul a").first().click();
    await expect(page.locator("h1")).toHaveCount(1);
    await expectNoAxeViolations(page);

    await page.goto("/projects");
    const project = page.locator("main article h3 a").first();
    test.skip((await project.count()) === 0, "no projects in the CMS");
    await project.click();
    await expect(page.locator("h1")).toHaveCount(1);
    await expectNoAxeViolations(page);
  });
});
