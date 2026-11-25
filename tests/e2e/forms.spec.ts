import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Contact and professionals forms. The static test server has no Worker, so
 * /api/inquiry and Cloudflare Turnstile are mocked here (no external calls).
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const TURNSTILE_STUB = `window.turnstile = {
  render(el, opts) { setTimeout(() => opts.callback("test-token"), 10); return "w1"; },
  reset() {},
};`;

async function setUp(
  page: Page,
  api: { status: number; body: unknown } = { status: 200, body: { ok: true } },
  configured = true,
) {
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
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({ contentType: "text/javascript", body: TURNSTILE_STUB }),
  );
  const sent: unknown[] = [];
  await page.route("**/api/inquiry", async (route) => {
    // GET: is sending set up? (the page asks on load)
    if (route.request().method() === "GET")
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ configured }),
      });
    sent.push(route.request().postDataJSON());
    await route.fulfill({
      status: api.status,
      contentType: "application/json",
      body: JSON.stringify(api.body),
    });
  });
  return sent;
}

test.describe("contact form", () => {
  test("shows a focused error summary and marks the fields", async ({
    page,
  }) => {
    const sent = await setUp(page);
    await page.goto("/contact");
    await page.getByRole("button", { name: "שליחת הפנייה" }).click();

    const summary = page.getByRole("heading", { name: "יש לתקן 3 שדות" });
    await expect(summary).toBeVisible();
    await expect(summary.locator("..")).toBeFocused();
    await expect(page.getByLabel("שם מלא")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    // The summary links go to the fields.
    await page.getByRole("link", { name: "כתבו מספר טלפון" }).click();
    await expect(page.getByLabel("טלפון")).toBeFocused();
    expect(sent).toEqual([]);
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });

  test("sends a valid inquiry and confirms it", async ({ page }) => {
    const sent = await setUp(page);
    await page.goto("/contact");
    await page.getByLabel("שם מלא").fill("דנה כהן");
    await page.getByLabel("טלפון").fill("052-1234567");
    await page.getByLabel("במה נוכל לעזור?").fill("יש לכם ידית בר 128 מ״מ?");
    await page.getByRole("button", { name: "שליחת הפנייה" }).click();

    const done = page.getByRole("heading", { name: "תודה, הפנייה נשלחה" });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      kind: "contact",
      name: "דנה כהן",
      phone: "052-1234567",
      website: "",
      turnstileToken: "test-token",
      locale: "he",
      marketing: false,
    });
  });

  test("explains when the form isn't active yet, with other ways to reach us", async ({
    page,
  }) => {
    await setUp(page, { status: 503, body: { error: "not_configured" } });
    await page.goto("/contact");
    await page.getByLabel("שם מלא").fill("דנה כהן");
    await page.getByLabel("טלפון").fill("052-1234567");
    await page.getByLabel("במה נוכל לעזור?").fill("שאלה על ידית");
    await page.getByRole("button", { name: "שליחת הפנייה" }).click();

    const alert = page
      .getByRole("alert")
      .filter({ hasText: "הטופס עוד לא פעיל" });
    await expect(alert).toContainText("הטופס עוד לא פעיל");
    await expect(alert.getByRole("link").first()).toHaveAttribute(
      "href",
      /^tel:/,
    );
  });

  test("offers phone and WhatsApp instead of the fields until sending is set up", async ({
    page,
  }) => {
    await setUp(page, undefined, false);
    await page.goto("/contact");
    const panel = page.getByTestId("form-inactive");
    await expect(panel).toContainText("עוד לא פעילה");
    await expect(page.getByLabel("שם מלא")).toHaveCount(0);
    await expect(panel.getByRole("link").first()).toHaveAttribute(
      "href",
      /^tel:/,
    );
    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });

  test("shows the server's field errors", async ({ page }) => {
    await setUp(page, {
      status: 422,
      body: { error: "invalid", fields: { phone: "invalid" } },
    });
    await page.goto("/contact");
    await page.getByLabel("שם מלא").fill("דנה כהן");
    await page.getByLabel("טלפון").fill("052-1234567");
    await page.getByLabel("במה נוכל לעזור?").fill("שאלה על ידית");
    await page.getByRole("button", { name: "שליחת הפנייה" }).click();
    await expect(
      page.getByRole("heading", { name: "יש לתקן שדה אחד" }),
    ).toBeVisible();
  });
});

test.describe("professionals form", () => {
  test("asks for a profession and sends it", async ({ page }) => {
    const sent = await setUp(page);
    await page.goto("/en/professionals");
    await page.getByLabel("Full name").fill("Yossi Levi");
    await page.getByLabel("Phone", { exact: true }).fill("050-7654321");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(
      page.getByRole("heading", { name: "There is one field to fix" }),
    ).toBeVisible();

    await page
      .getByLabel("Profession", { exact: true })
      .selectOption("carpenter");
    await page.getByLabel(/Business name/).fill("Levi Carpentry");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(
      page.getByRole("heading", { name: "Thank you, your inquiry was sent" }),
    ).toBeVisible();
    expect(sent[0]).toMatchObject({
      kind: "professional",
      profession: "carpenter",
      business: "Levi Carpentry",
      locale: "en",
    });
  });
});
