/**
 * Generates neutral placeholder product images (silhouette per product type ×
 * finish colour, with a "sample image" label) for the seed data.
 *
 *   node scripts/generate-sample-images.mjs
 *
 * Output: studio/seed/images/<shape>-<finish>.png (1200×1500, 4:5).
 * Renders SVG with the Playwright Chromium already used for tests.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const OUT = join(import.meta.dirname, "..", "studio", "seed", "images");
mkdirSync(OUT, { recursive: true });

const finishes = {
  gold: { fill: "#C9A24B", edge: "#9C7A2E" },
  rosegold: { fill: "#C3907E", edge: "#996957" },
  black: { fill: "#2B2A28", edge: "#111110" },
  nickel: { fill: "#A3A6A2", edge: "#7C7F7B" },
  chrome: { fill: "#C9CED1", edge: "#8E9497" },
};

// Simple product silhouettes drawn on a 600×750 canvas (scaled ×2 on export).
const shapes = {
  bar: (c) => `
    <rect x="110" y="330" width="380" height="34" rx="17" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="160" y="356" width="26" height="70" rx="6" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="414" y="356" width="26" height="70" rx="6" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>`,
  edge: (c) => `
    <path d="M110 340 h380 v26 h-30 v40 h-320 z" fill="${c.fill}" stroke="${c.edge}" stroke-width="3" stroke-linejoin="round"/>`,
  knob: (c) => `
    <circle cx="300" cy="350" r="92" fill="${c.fill}" stroke="${c.edge}" stroke-width="4"/>
    <circle cx="300" cy="350" r="58" fill="none" stroke="${c.edge}" stroke-width="3" opacity="0.5"/>
    <rect x="282" y="440" width="36" height="56" rx="8" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>`,
  lever: (c) => `
    <circle cx="200" cy="360" r="74" fill="${c.fill}" stroke="${c.edge}" stroke-width="4"/>
    <rect x="186" y="336" width="300" height="46" rx="23" fill="${c.fill}" stroke="${c.edge}" stroke-width="4"/>
    <circle cx="200" cy="360" r="30" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>`,
  fridge: (c) => `
    <rect x="270" y="130" width="40" height="480" rx="20" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="306" y="190" width="70" height="26" rx="6" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="306" y="524" width="70" height="26" rx="6" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>`,
  hinge: (c) => `
    <circle cx="210" cy="360" r="70" fill="${c.fill}" stroke="${c.edge}" stroke-width="4"/>
    <circle cx="210" cy="360" r="44" fill="none" stroke="${c.edge}" stroke-width="3" opacity="0.6"/>
    <path d="M270 330 h170 a20 20 0 0 1 20 20 v20 a20 20 0 0 1 -20 20 h-170 z" fill="${c.fill}" stroke="${c.edge}" stroke-width="4"/>
    <circle cx="420" cy="360" r="10" fill="${c.edge}"/>`,
  runner: (c) => `
    <rect x="80" y="340" width="440" height="40" rx="6" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="80" y="352" width="300" height="16" rx="4" fill="${c.edge}" opacity="0.45"/>
    ${[120, 170, 220, 270, 320].map((x) => `<circle cx="${x}" cy="360" r="5" fill="${c.edge}"/>`).join("")}`,
  leg: (c) => `
    <rect x="230" y="180" width="140" height="22" rx="4" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <path d="M262 202 h76 l-10 330 h-56 z" fill="${c.fill}" stroke="${c.edge}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="262" y="530" width="76" height="18" rx="6" fill="${c.edge}"/>`,
  towelbar: (c) => `
    <rect x="90" y="300" width="36" height="90" rx="10" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="474" y="300" width="36" height="90" rx="10" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <rect x="120" y="374" width="360" height="20" rx="10" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>`,
  basket: (c) => `
    <rect x="110" y="250" width="380" height="230" rx="10" fill="none" stroke="${c.fill}" stroke-width="10"/>
    ${[170, 230, 290, 350, 410].map((x) => `<line x1="${x}" y1="255" x2="${x}" y2="475" stroke="${c.fill}" stroke-width="6"/>`).join("")}
    <line x1="115" y1="365" x2="485" y2="365" stroke="${c.fill}" stroke-width="6"/>`,
  hook: (c) => `
    <rect x="250" y="210" width="100" height="60" rx="10" fill="${c.fill}" stroke="${c.edge}" stroke-width="3"/>
    <path d="M300 270 v170 a60 60 0 0 1 -120 0 v-30" fill="none" stroke="${c.fill}" stroke-width="26" stroke-linecap="round"/>`,
};

function svg(shape, finish) {
  const c = finishes[finish];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" fill="#EEEEEC"/>
    <ellipse cx="300" cy="560" rx="170" ry="12" fill="#1E1D1B" opacity="0.06"/>
    ${shapes[shape](c)}
    <text x="300" y="705" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="22" fill="#5C5852">תמונה לדוגמה</text>
  </svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 600, height: 750 },
  deviceScaleFactor: 2,
});
let count = 0;
for (const shape of Object.keys(shapes)) {
  for (const finish of Object.keys(finishes)) {
    await page.setContent(
      `<html><body style="margin:0">${svg(shape, finish)}</body></html>`,
    );
    await page.screenshot({
      path: join(OUT, `sample-${shape}-${finish}.png`),
      type: "png",
    });
    count++;
  }
}
await browser.close();
console.log(`Generated ${count} images in ${OUT}`);
