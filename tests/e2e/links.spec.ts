import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Every internal link in every built page leads to a page that exists.
 * Reads the static export (`out/`) directly: a broken href fails here,
 * before a visitor ever sees a 404.
 */
const OUT = join(process.cwd(), "out");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

function exists(href: string): boolean {
  const path =
    decodeURIComponent(href.split(/[?#]/)[0]!).replace(/\/$/, "") || "/";
  if (path === "/") return existsSync(join(OUT, "index.html"));
  return [path, `${path}.html`, `${path}/index.html`].some((candidate) =>
    existsSync(join(OUT, candidate)),
  );
}

test("no internal link leads to a missing page", ({ isMobile }) => {
  test.skip(isMobile, "the files are the same for every device");
  const broken: string[] = [];
  const pages = htmlFiles(OUT);
  expect(pages.length).toBeGreaterThan(20);
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    for (const [, raw] of html.matchAll(/href="(\/[^"]*)"/g)) {
      const href = raw!.replace(/&amp;/g, "&");
      if (href.startsWith("/_next/") || href.startsWith("//")) continue;
      if (!exists(href)) broken.push(`${href} (in ${page.slice(OUT.length)})`);
    }
  }
  expect(broken, broken.join("\n")).toEqual([]);
});
