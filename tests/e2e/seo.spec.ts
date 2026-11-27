import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Search engines: robots.txt and the sitemap exist, pages carry structured
 * data, and no two content pages share a description. Reads the built files.
 */
const OUT = join(process.cwd(), "out");

test.skip(
  ({ isMobile }) => isMobile,
  "the files are the same for every device",
);

test("robots.txt and sitemap.xml are built", () => {
  const robots = readFileSync(join(OUT, "robots.txt"), "utf8");
  expect(robots).toMatch(/User-Agent: \*/i);
  const sitemap = readFileSync(join(OUT, "sitemap.xml"), "utf8");
  expect(sitemap).toContain("<urlset");
  expect(sitemap).toContain("/catalog/handles</loc>");
  expect(sitemap).toContain('hreflang="en"');
});

test("the home and product pages describe the store and the product", async ({
  page,
}) => {
  const jsonLd = async () =>
    (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((text) => JSON.parse(text) as { "@type": string });

  await page.goto("/");
  expect((await jsonLd()).map((d) => d["@type"])).toContain("HardwareStore");

  await page.goto("/catalog/handles");
  const href = await page
    .locator("main article h3 a")
    .first()
    .getAttribute("href");
  await page.goto(href!);
  const types = (await jsonLd()).map((d) => d["@type"]);
  expect(types).toEqual(expect.arrayContaining(["Product", "BreadcrumbList"]));
});

test("content pages have their own descriptions", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (name === "_next" || name === "product") return []; // product texts are CMS content
      return statSync(path).isDirectory()
        ? walk(path)
        : name.endsWith(".html")
          ? [path]
          : [];
    });
  const seen = new Map<string, string[]>();
  for (const file of walk(OUT)) {
    const html = readFileSync(file, "utf8");
    const description = html.match(
      /<meta name="description" content="([^"]*)"/,
    )?.[1];
    if (!description || /not-found|404/.test(file)) continue;
    seen.set(description, [
      ...(seen.get(description) ?? []),
      file.slice(OUT.length),
    ]);
  }
  const shared = [...seen].filter(([, files]) => files.length > 1);
  expect(shared, JSON.stringify(shared, null, 1)).toEqual([]);
});
