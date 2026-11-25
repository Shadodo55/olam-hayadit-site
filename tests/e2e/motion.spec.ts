import { expect, test } from "@playwright/test";

/**
 * The home page's motion (hero entrance, scroll reveals, services band,
 * count-up) with motion ALLOWED. Other specs run with reduced motion so axe
 * judges the final look; this one checks that the motion ends in that same
 * readable state and can be paused.
 */
test.use({ contextOptions: { reducedMotion: "no-preference" } });

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

const opacity = (selector: string) =>
  `getComputedStyle(document.querySelector(${JSON.stringify(selector)})).opacity`;

test("the hero entrance ends fully visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect
    .poll(
      () => page.evaluate(opacity("section[aria-labelledby=hero-title] .rise")),
      {
        timeout: 4000,
      },
    )
    .toBe("1");
});

test("every section reveal ends fully visible once in view", async ({
  page,
}) => {
  await page.goto("/");
  const count = await page.locator("[data-reveal]").count();
  expect(count).toBeGreaterThan(5);
  for (let i = 0; i < count; i++) {
    const el = page.locator("[data-reveal]").nth(i);
    await el.evaluate((node) => node.scrollIntoView({ block: "center" }));
    const target =
      (await el.getAttribute("data-reveal")) === "children"
        ? el.locator("> *").first()
        : el;
    await expect
      .poll(() => target.evaluate((node) => getComputedStyle(node).opacity), {
        timeout: 3000,
      })
      .toBe("1");
  }
});

test("the services band can be paused", async ({ page }) => {
  await page.goto("/");
  const band = page.locator(".marquee");
  const pause = band.getByRole("button", { name: "עצירת התנועה" });
  await pause.scrollIntoViewIfNeeded();
  await pause.click();
  await expect(band).toHaveAttribute("data-paused", "true");
  await expect(
    band.getByRole("button", { name: "הפעלת התנועה" }),
  ).toBeVisible();
  // The duplicate copy that makes the loop seamless is hidden from readers.
  const copies = band.locator("li.marquee-copy");
  expect(await copies.count()).toBeGreaterThan(0);
  await expect(copies.first()).toHaveAttribute("aria-hidden", "true");
});

test("the years counter reaches its number", async ({ page }) => {
  await page.goto("/");
  const counter = page.locator(".count-up").first();
  await counter.evaluate((node) => node.scrollIntoView({ block: "center" }));
  const value = await counter.evaluate((node) =>
    getComputedStyle(node).getPropertyValue("--to").trim(),
  );
  await expect
    .poll(
      () =>
        counter.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--count").trim(),
        ),
      { timeout: 3000 },
    )
    .toBe(value);
});

test("a branded curtain covers page changes and then lifts", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#hero-title")
    .locator("xpath=..")
    .getByRole("link", { name: "לקטלוג המוצרים" })
    .click();
  const curtain = page.locator(".page-curtain");
  await expect(curtain).toBeVisible();
  await expect(curtain).toHaveAttribute("aria-hidden", "true");
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(curtain).toHaveCount(0, { timeout: 4000 });
  await expect(page.locator("h1")).toBeVisible();
});
