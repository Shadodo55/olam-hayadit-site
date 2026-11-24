import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { pages } from "./pages";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

for (const page of pages) {
  test.describe(`page ${page.path}`, () => {
    test("has zero axe violations (WCAG 2.1 AA)", async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.path);
      const results = await new AxeBuilder({ page: browserPage })
        .withTags(WCAG_TAGS)
        .analyze();
      expect(
        results.violations,
        JSON.stringify(results.violations, null, 2),
      ).toEqual([]);
    });

    test("declares language and direction", async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      const html = browserPage.locator("html");
      await expect(html).toHaveAttribute("lang", page.lang);
      await expect(html).toHaveAttribute("dir", page.dir);
    });

    test("skip link is the first Tab stop and moves focus to main", async ({
      page: browserPage,
      isMobile,
    }) => {
      test.skip(isMobile, "keyboard navigation is checked on desktop");
      await browserPage.goto(page.path);
      await browserPage.keyboard.press("Tab");
      const skip = browserPage.locator("a[href='#main']");
      await expect(skip).toBeFocused();
      await expect(skip).toBeVisible();
      await browserPage.keyboard.press("Enter");
      await expect(browserPage.locator("#main")).toBeFocused();
    });

    test("has exactly one h1", async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await expect(browserPage.locator("h1")).toHaveCount(1);
    });

    test("does not scroll horizontally at 200% zoom (320px viewport)", async ({
      page: browserPage,
    }) => {
      await browserPage.setViewportSize({ width: 320, height: 640 });
      await browserPage.goto(page.path);
      const overflow = await browserPage.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("unknown URLs show the bilingual 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("הדף שחיפשתם לא נמצא");
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});

test("no third-party requests are made before consent", async ({ page }) => {
  // Our own content CDN (Sanity: images, video, PDFs) sets no cookies and is
  // part of the site. Anything else (maps, analytics, embeds) needs consent.
  const allowed = new Set(["localhost", "cdn.sanity.io"]);
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!allowed.has(url.hostname)) external.push(url.href);
  });
  // Forms load spam protection (Turnstile) only once someone starts typing.
  for (const path of ["/", "/visit", "/catalog/handles", "/contact"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(external).toEqual([]);
});
