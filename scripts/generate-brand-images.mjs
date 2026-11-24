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
const handle = `<svg viewBox="0 0 40 14" width="200" height="70" aria-hidden="true">
  <rect x="0" y="0" width="40" height="3.2" rx="1.6" fill="#ffffff"/>
  <rect x="6" y="3" width="3.2" height="11" fill="#ffffff"/>
  <rect x="30.8" y="3" width="3.2" height="11" fill="#ffffff"/></svg>`;

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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Hebrew:wght@300;500&family=Assistant:wght@400&display=block">
<style>
  body{margin:0;width:1200px;height:630px;background:#0d2b2f;color:#fff;font-family:"IBM Plex Sans Hebrew";position:relative;overflow:hidden}
  .wrap{position:absolute;inset:0;padding:84px 96px;display:flex;flex-direction:column;justify-content:center}
  .slogan{display:flex;align-items:center;gap:20px;color:#d4b98a;font-weight:500;font-size:34px}
  .slogan i{display:block;width:64px;height:2px;background:#d4b98a}
  h1{margin:28px 0 0;font-weight:300;font-size:104px;line-height:1.02;letter-spacing:-0.015em}
  p{margin:28px 0 0;font-family:Assistant;font-size:34px;color:rgba(255,255,255,.85)}
  .mark{position:absolute;left:96px;bottom:84px;opacity:.9}
  .bar{position:absolute;left:0;right:0;bottom:0;height:12px;background:#0e5e66}
</style></head><body>
  <div class="wrap">
    <div class="slogan"><i></i>איכות ושירות זה אנחנו!</div>
    <h1>עולם הידית והפרזול</h1>
    <p>ידיות, פרזול ואביזרי אמבטיה. תלפיות, ירושלים</p>
  </div>
  <div class="mark">${handle}</div>
  <div class="bar"></div>
</body></html>`);
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: join(PUBLIC, "og.png") });

await browser.close();
console.log("Generated public/apple-touch-icon.png and public/og.png");
