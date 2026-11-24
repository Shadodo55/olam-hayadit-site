/**
 * Generates the site's brand images from public/icon.svg:
 *   public/apple-touch-icon.png  180×180 (home-screen icon)
 *   public/og.png                1200×630 (social preview for WhatsApp, Facebook…)
 *
 *   node scripts/generate-brand-images.mjs
 *
 * Uses the Playwright Chromium already installed for tests. Fonts come from
 * Google Fonts at generation time only (the site itself self-hosts them).
 * Only confirmed business facts appear here (name, area, slogan from the sign).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const PUBLIC = join(import.meta.dirname, "..", "public");
const icon = readFileSync(join(PUBLIC, "icon.svg"), "utf8");
// The logo's mark (same paths as src/components/brand/LogoMark.tsx), on navy.
const mark = `<svg viewBox="0 0 150 100" width="300" height="200" aria-hidden="true">
  <g fill="#ffffff">
    <path d="M70 0H24A24 24 0 0 0 0 24V76A24 24 0 0 0 24 100H36L29 87A15 15 0 0 1 14 72V28A15 15 0 0 1 29 13H59Z"/>
    <path fill-rule="evenodd" d="M18 44A15 15 0 0 1 47.87 42H42.94A12 12 0 1 0 42.94 58H48V83H29A11 11 0 0 1 18 72ZM31.3 72.62A4 4 0 1 1 34.7 72.62L35.6 79H30.4Z"/>
  </g>
  <g fill="#02a6ac">
    <circle cx="34" cy="50" r="9.5"/>
    <path d="M34 44H95A6 6 0 0 1 95 56H34Z"/>
    <path d="M34.5 93H146.5A3.5 3.5 0 0 1 146.5 100H38.3Z"/>
  </g></svg>`;

const browser = await chromium.launch();

const iconPage = await browser.newPage({
  viewport: { width: 180, height: 180 },
});
await iconPage.setContent(
  `<html><body style="margin:0">${icon.replace("<svg ", '<svg width="180" height="180" ')}</body></html>`,
);
await iconPage.screenshot({
  path: join(PUBLIC, "apple-touch-icon.png"),
  omitBackground: true,
});

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(`<html dir="rtl" lang="he"><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;800&family=Assistant:wght@400&display=block">
<style>
  body{margin:0;width:1200px;height:630px;background:#042040;color:#fff;font-family:Rubik;position:relative;overflow:hidden}
  .wrap{position:absolute;inset:0;padding:84px 96px;display:flex;flex-direction:column;justify-content:center}
  h1{margin:0;font-weight:800;font-size:112px;line-height:1}
  h1 span{display:block;color:#02a6ac}
  p{margin:36px 0 0;font-family:Assistant;font-size:36px;color:rgba(255,255,255,.85)}
  .mark{position:absolute;left:96px;top:50%;transform:translateY(-50%)}
  .bar{position:absolute;left:0;right:0;bottom:0;height:14px;background:#f0b03f}
</style></head><body>
  <div class="wrap">
    <h1>עולם הידית <span>והפרזול</span></h1>
    <p>ידיות, פרזול ואביזרי אמבטיה. תלפיות, ירושלים</p>
  </div>
  <div class="mark">${mark}</div>
  <div class="bar"></div>
</body></html>`);
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: join(PUBLIC, "og.png") });

await browser.close();
console.log("Generated public/apple-touch-icon.png and public/og.png");
