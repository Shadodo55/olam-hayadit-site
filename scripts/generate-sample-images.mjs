/**
 * Generates neutral placeholder product images for the seed data: a studio-
 * style render per product type × finish (metal shading, soft shadow, light
 * backdrop) with a small "sample image" label. Real photos replace them in
 * Sanity.
 *
 *   node scripts/generate-sample-images.mjs
 *
 * Output: studio/seed/images/sample-<shape>-<finish>.png (1200×1500, 4:5).
 * Renders SVG with the Playwright Chromium already used for tests.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const OUT = join(import.meta.dirname, "..", "studio", "seed", "images");
mkdirSync(OUT, { recursive: true });

/** Metal finishes: gradient stops across a cylinder (dark edge → highlight → body → edge). */
const finishes = {
  gold: ["#7d5d22", "#f1d690", "#c49a45", "#e3c278", "#8a6a2c"],
  rosegold: ["#8a5a4a", "#f0c9b8", "#c08a76", "#e4b3a0", "#94604f"],
  black: ["#0f0f0f", "#4a4a4a", "#202020", "#333333", "#0c0c0c"],
  nickel: ["#6f736f", "#eef0ed", "#a9aca8", "#d6d8d5", "#767a76"],
  chrome: ["#4f575c", "#ffffff", "#9aa4aa", "#f2f6f8", "#5b6469"],
};

/** Gradient definitions for one finish: vertical (horizontal parts), horizontal (vertical parts), radial (knobs). */
function metalDefs(stops) {
  const s = stops
    .map(
      (c, i) =>
        `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`,
    )
    .join("");
  return `
    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">${s}</linearGradient>
    <linearGradient id="gh" x1="0" y1="0" x2="1" y2="0">${s}</linearGradient>
    <radialGradient id="gr" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0%" stop-color="${stops[1]}"/>
      <stop offset="45%" stop-color="${stops[2]}"/>
      <stop offset="100%" stop-color="${stops[0]}"/>
    </radialGradient>
    <filter id="soft" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="750"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="contact" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="750"><feGaussianBlur stdDeviation="4"/></filter>`;
}

/** Soft floor shadow under an object (cx, y, width). */
const shadow = (cx, y, w) => `
  <ellipse cx="${cx}" cy="${y + 18}" rx="${w / 2}" ry="22" fill="#1b2a2c" opacity="0.16" filter="url(#soft)"/>
  <ellipse cx="${cx}" cy="${y + 6}" rx="${w / 2.4}" ry="6" fill="#1b2a2c" opacity="0.22" filter="url(#contact)"/>`;

// Product shapes on a 600×750 canvas (scaled ×2 on export).
const shapes = {
  bar: () => `${shadow(300, 440, 420)}
    <rect x="160" y="352" width="26" height="80" rx="8" fill="url(#gh)"/>
    <rect x="414" y="352" width="26" height="80" rx="8" fill="url(#gh)"/>
    <rect x="100" y="326" width="400" height="36" rx="18" fill="url(#gv)"/>`,
  edge: () => `${shadow(300, 420, 420)}
    <rect x="100" y="330" width="400" height="30" rx="4" fill="url(#gv)"/>
    <rect x="130" y="358" width="340" height="52" rx="3" fill="url(#gv)" opacity="0.92"/>`,
  knob: () => `${shadow(300, 470, 220)}
    <rect x="280" y="400" width="40" height="66" rx="10" fill="url(#gh)"/>
    <circle cx="300" cy="340" r="96" fill="url(#gr)"/>
    <circle cx="300" cy="340" r="64" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3"/>`,
  lever: () => `${shadow(320, 450, 380)}
    <circle cx="200" cy="360" r="78" fill="url(#gr)"/>
    <rect x="180" y="336" width="320" height="48" rx="24" fill="url(#gv)"/>
    <circle cx="200" cy="360" r="34" fill="url(#gr)"/>`,
  fridge: () => `${shadow(310, 620, 160)}
    <rect x="306" y="188" width="76" height="28" rx="6" fill="url(#gv)"/>
    <rect x="306" y="522" width="76" height="28" rx="6" fill="url(#gv)"/>
    <rect x="266" y="120" width="44" height="490" rx="22" fill="url(#gh)"/>`,
  hinge: () => `${shadow(320, 440, 360)}
    <path d="M270 326 h176 a22 22 0 0 1 22 22 v24 a22 22 0 0 1 -22 22 h-176 z" fill="url(#gv)"/>
    <circle cx="430" cy="360" r="9" fill="#000" opacity="0.35"/>
    <circle cx="210" cy="360" r="74" fill="url(#gr)"/>
    <circle cx="210" cy="360" r="46" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="3"/>`,
  runner: () => `${shadow(300, 400, 460)}
    <rect x="70" y="336" width="460" height="44" rx="5" fill="url(#gv)"/>
    <rect x="70" y="350" width="320" height="16" rx="4" fill="#000" opacity="0.18"/>
    ${[115, 170, 225, 280, 335].map((x) => `<circle cx="${x}" cy="358" r="5.5" fill="#000" opacity="0.35"/>`).join("")}`,
  leg: () => `${shadow(300, 560, 170)}
    <path d="M262 200 h76 l-10 334 h-56 z" fill="url(#gh)"/>
    <rect x="226" y="176" width="148" height="26" rx="5" fill="url(#gv)"/>
    <rect x="260" y="532" width="80" height="20" rx="7" fill="#151515"/>`,
  towelbar: () => `${shadow(300, 420, 460)}
    <rect x="86" y="292" width="38" height="96" rx="12" fill="url(#gh)"/>
    <rect x="476" y="292" width="38" height="96" rx="12" fill="url(#gh)"/>
    <rect x="112" y="368" width="376" height="22" rx="11" fill="url(#gv)"/>`,
  basket: () => `${shadow(300, 500, 420)}
    <rect x="106" y="246" width="388" height="238" rx="12" fill="none" stroke="url(#gv)" stroke-width="12"/>
    ${[168, 230, 292, 354, 416].map((x) => `<rect x="${x - 4}" y="252" width="8" height="226" rx="4" fill="url(#gh)"/>`).join("")}
    <rect x="112" y="361" width="376" height="8" rx="4" fill="url(#gv)"/>`,
  hook: () => `${shadow(260, 520, 220)}
    <path d="M300 268 v170 a60 60 0 0 1 -120 0 v-30" fill="none" stroke="url(#gh)" stroke-width="28" stroke-linecap="round"/>
    <rect x="246" y="204" width="108" height="66" rx="12" fill="url(#gv)"/>`,
};

function svg(shape, finish) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <defs>
      ${metalDefs(finishes[finish])}
      <radialGradient id="studio" cx="0.5" cy="0.42" r="0.75">
        <stop offset="0%" stop-color="#fafbfa"/>
        <stop offset="100%" stop-color="#e6eae9"/>
      </radialGradient>
    </defs>
    <rect width="600" height="750" fill="url(#studio)"/>
    ${shapes[shape]()}
    <text x="300" y="716" text-anchor="middle" direction="rtl" font-family="Arial, sans-serif" font-size="17" fill="#6b7577">תמונה לדוגמה</text>
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
