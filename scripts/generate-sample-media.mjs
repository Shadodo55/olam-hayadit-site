/**
 * Generates neutral SAMPLE media for the seed data (clearly labelled):
 *   ~/olam-hayadit-files/sample-content/media/sample-hero.webm   short looping hero video (~6 s)
 *   ~/olam-hayadit-files/sample-content/media/sample-hero-poster.png  its still frame
 *   ~/olam-hayadit-files/sample-content/media/sample-catalog.pdf two-page sample catalog
 *
 *   node scripts/generate-sample-media.mjs
 *
 * Uses the Playwright Chromium already installed for tests. Real media
 * (an MP4 hero video, real PDF catalogs) is uploaded by the store in Sanity.
 */
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "@playwright/test";

// Generated files live outside the repo (and outside OneDrive, which
// struggles with thousands of synced files): ~/olam-hayadit-files.
const FILES =
  process.env.OLAM_FILES_DIR ?? join(homedir(), "olam-hayadit-files");
const OUT = join(FILES, "sample-content", "media");
const IMAGES = join(FILES, "sample-content", "images");
mkdirSync(OUT, { recursive: true });

// Studio scene: three handles in different finishes, metal shading, soft
// shadows. Objects sit in the upper-middle band: on desktop the hero's text
// panel covers the lower corner of the frame.
const metal = {
  gold: ["#7d5d22", "#f1d690", "#c49a45", "#e3c278", "#8a6a2c"],
  black: ["#0f0f0f", "#4a4a4a", "#202020", "#333333", "#0c0c0c"],
  nickel: ["#6f736f", "#eef0ed", "#a9aca8", "#d6d8d5", "#767a76"],
};
const grads = Object.entries(metal)
  .map(([name, stops]) => {
    const st = stops
      .map(
        (c, i) =>
          `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`,
      )
      .join("");
    return `<linearGradient id="v-${name}" x1="0" y1="0" x2="0" y2="1">${st}</linearGradient>
      <linearGradient id="h-${name}" x1="0" y1="0" x2="1" y2="0">${st}</linearGradient>
      <radialGradient id="r-${name}" cx="0.38" cy="0.32" r="0.75"><stop offset="0%" stop-color="${stops[1]}"/><stop offset="45%" stop-color="${stops[2]}"/><stop offset="100%" stop-color="${stops[0]}"/></radialGradient>`;
  })
  .join("");
const floor = (cx, y, w) => `
  <ellipse cx="${cx}" cy="${y + 20}" rx="${w / 2}" ry="26" fill="#1b2a2c" opacity="0.15" filter="url(#soft)"/>
  <ellipse cx="${cx}" cy="${y + 6}" rx="${w / 2.3}" ry="7" fill="#1b2a2c" opacity="0.2" filter="url(#contact)"/>`;
const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>${grads}
    <radialGradient id="studio" cx="0.5" cy="0.35" r="0.8"><stop offset="0%" stop-color="#fbfcfb"/><stop offset="100%" stop-color="#dfe4e3"/></radialGradient>
    <filter id="soft" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="720"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="contact" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="720"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#studio)"/>
  <g>${floor(330, 360, 420)}
    <rect x="190" y="276" width="28" height="84" rx="8" fill="url(#h-gold)"/>
    <rect x="442" y="276" width="28" height="84" rx="8" fill="url(#h-gold)"/>
    <rect x="120" y="248" width="420" height="38" rx="19" fill="url(#v-gold)"/></g>
  <g>${floor(660, 380, 200)}
    <rect x="642" y="318" width="36" height="58" rx="10" fill="url(#h-black)"/>
    <circle cx="660" cy="262" r="86" fill="url(#r-black)"/></g>
  <g>${floor(990, 360, 380)}
    <circle cx="880" cy="280" r="70" fill="url(#r-nickel)"/>
    <rect x="862" y="258" width="290" height="44" rx="22" fill="url(#v-nickel)"/>
    <circle cx="880" cy="280" r="31" fill="url(#r-nickel)"/></g>
</svg>`;

const browser = await chromium.launch();

// 1) Hero video: a slow push-in and back out, rendered frame by frame so the
//    last frame flows straight into the first (a seamless loop: no blank or
//    black frames, no jump). Encoded with the ffmpeg Playwright installs.
const FPS = 24;
const CYCLE = 12; // seconds: 6 s in + 6 s out
const ffmpeg = (() => {
  const base = join(
    process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
    "ms-playwright",
  );
  const dir = readdirSync(base).find((d) => d.startsWith("ffmpeg"));
  if (!dir)
    throw new Error("Playwright ffmpeg not found (npx playwright install)");
  return join(
    base,
    dir,
    process.platform === "win32" ? "ffmpeg-win64.exe" : "ffmpeg-linux",
  );
})();

const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.setContent(`<html><body style="margin:0;background:#e6eae9;overflow:hidden">
  <style>
    .s{position:absolute;inset:0;transform-origin:50% 40%}
    .l{position:absolute;top:20px;left:0;right:0;text-align:center;font:18px Arial;color:#6b7577;direction:rtl}
  </style>
  <div class="s">${scene}</div>
  <div class="l">וידאו לדוגמה</div></body></html>`);
await page.screenshot({ path: join(OUT, "sample-hero-poster.png") });

const encoder = spawn(ffmpeg, [
  "-y",
  "-loglevel",
  "error",
  "-f",
  "image2pipe",
  "-c:v",
  "mjpeg",
  "-framerate",
  String(FPS),
  "-i",
  "pipe:0", // this ffmpeg build has no "-" (stdin) alias,
  "-c:v",
  "libvpx-vp9",
  "-b:v",
  "1500k",
  "-pix_fmt",
  "yuv420p",
  "-an",
  join(OUT, "sample-hero.webm"),
]);
// Fail loudly instead of waiting forever if ffmpeg stops early.
let ffmpegError = "";
encoder.stderr.on("data", (chunk) => (ffmpegError += chunk));
encoder.stdin.on("error", () => {});
encoder.on("exit", (code) => {
  if (code !== 0) {
    console.error(ffmpegError);
    process.exit(1);
  }
});
const frames = FPS * CYCLE; // frame `frames` would equal frame 0: stop before it
for (let i = 0; i < frames; i++) {
  const phase = i / frames; // 0 → 1 over the cycle
  const zoom = 1 + 0.06 * (0.5 - 0.5 * Math.cos(phase * 2 * Math.PI)); // 1 → 1.06 → 1, smooth
  await page.evaluate((z) => {
    document.querySelector(".s").style.transform = `scale(${z})`;
  }, zoom);
  const jpeg = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!encoder.stdin.write(jpeg)) await once(encoder.stdin, "drain");
}
encoder.stdin.end();
const [code] = await once(encoder, "close");
if (code !== 0) throw new Error(`ffmpeg failed (${code})`);
await page.close();

// 2) Sample PDF catalog.
const img = (name) =>
  `data:image/png;base64,${readFileSync(join(IMAGES, name)).toString("base64")}`;
const pdfPage = await browser.newPage();
await pdfPage.setContent(`<html dir="rtl"><body style="font-family:Arial;margin:0;color:#1E1D1B">
  <section style="height:277mm;padding:30mm;box-sizing:border-box;background:#F0F2F1">
    <p style="font-size:14pt;color:#5C5852">קטלוג לדוגמה, להמחשה בלבד</p>
    <h1 style="font-size:40pt;margin:20mm 0 6mm">ידיות לארונות ולמטבח</h1>
    <p style="font-size:14pt">הקטלוג הזה נוצר אוטומטית כדי להדגים את עמוד הקטלוגים באתר.
    בעלת החנות תחליף אותו בקטלוגים האמיתיים של הספקים.</p>
    <div style="width:180mm;overflow:hidden">${scene.replace(/width="1280" height="720"/, `width="100%"`)}</div>
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
