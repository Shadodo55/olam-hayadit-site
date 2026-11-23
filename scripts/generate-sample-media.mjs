/**
 * Generates neutral SAMPLE media for the seed data (clearly labelled):
 *   studio/seed/media/sample-hero.webm   short looping hero video (~6 s)
 *   studio/seed/media/sample-hero-poster.png  its still frame
 *   studio/seed/media/sample-catalog.pdf two-page sample catalog
 *
 *   node scripts/generate-sample-media.mjs
 *
 * Uses the Playwright Chromium already installed for tests. Real media
 * (an MP4 hero video, real PDF catalogs) is uploaded by the store in Sanity.
 */
import {
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const OUT = join(import.meta.dirname, "..", "studio", "seed", "media");
const IMAGES = join(import.meta.dirname, "..", "studio", "seed", "images");
mkdirSync(OUT, { recursive: true });

const handle = (fill, edge) => `
  <svg viewBox="0 0 600 220" width="720" height="264" aria-hidden="true">
    <ellipse cx="300" cy="200" rx="230" ry="12" fill="#1E1D1B" opacity="0.07"/>
    <rect x="40" y="70" width="520" height="40" rx="20" fill="${fill}" stroke="${edge}" stroke-width="3"/>
    <rect x="110" y="104" width="32" height="80" rx="7" fill="${fill}" stroke="${edge}" stroke-width="3"/>
    <rect x="458" y="104" width="32" height="80" rx="7" fill="${fill}" stroke="${edge}" stroke-width="3"/>
  </svg>`;

const browser = await chromium.launch();

// 1) Hero video: slow, calm drift (loops smoothly: out and back).
const tmp = join(OUT, "_rec");
rmSync(tmp, { recursive: true, force: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: tmp, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
await page.setContent(`<html><body style="margin:0;background:#EEEEEC;overflow:hidden">
  <style>
    .stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
    .h{animation:drift 6s ease-in-out infinite alternate}
    @keyframes drift{from{transform:translateX(-60px) rotate(-2deg)}to{transform:translateX(60px) rotate(2deg)}}
    .l{position:absolute;bottom:24px;left:0;right:0;text-align:center;font:22px Arial;color:#5C5852;direction:rtl}
  </style>
  <div class="stage"><div class="h">${handle("#2B2A28", "#111110")}</div></div>
  <div class="l">וידאו לדוגמה</div></body></html>`);
// Poster = a still of the same scene (shown before playback / with reduced motion).
await page.screenshot({ path: join(OUT, "sample-hero-poster.png") });
await page.waitForTimeout(6200);
await context.close();
const recorded = readdirSync(tmp).find((f) => f.endsWith(".webm"));
renameSync(join(tmp, recorded), join(OUT, "sample-hero.webm"));
rmSync(tmp, { recursive: true, force: true });

// 2) Sample PDF catalog.
const img = (name) =>
  `data:image/png;base64,${readFileSync(join(IMAGES, name)).toString("base64")}`;
const pdfPage = await browser.newPage();
await pdfPage.setContent(`<html dir="rtl"><body style="font-family:Arial;margin:0;color:#1E1D1B">
  <section style="height:277mm;padding:30mm;box-sizing:border-box;background:#F5F1EA">
    <p style="font-size:14pt;color:#5C5852">קטלוג לדוגמה, להמחשה בלבד</p>
    <h1 style="font-size:40pt;margin:20mm 0 6mm">ידיות לארונות ולמטבח</h1>
    <p style="font-size:14pt">הקטלוג הזה נוצר אוטומטית כדי להדגים את עמוד הקטלוגים באתר.
    בעלת החנות תחליף אותו בקטלוגים האמיתיים של הספקים.</p>
    ${handle("#A27C3A", "#7A5A22")}
  </section>
  <section style="padding:20mm;break-before:page">
    <h2 style="font-size:20pt">מוצרים לדוגמה</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10mm">
      ${[
        "sample-bar-black.png",
        "sample-bar-gold.png",
        "sample-knob-nickel.png",
        "sample-edge-black.png",
      ]
        .map((f) => `<img src="${img(f)}" style="width:100%" alt="">`)
        .join("")}
    </div>
  </section></body></html>`);
await pdfPage.pdf({
  path: join(OUT, "sample-catalog.pdf"),
  format: "A4",
  printBackground: true,
});
await browser.close();
console.log("Generated:", readdirSync(OUT).join(", "));
