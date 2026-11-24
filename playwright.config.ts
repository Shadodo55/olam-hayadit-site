import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

/**
 * End-to-end + accessibility tests run against the built static site (`out/`),
 * i.e. exactly what is deployed. Run `npm run build` first.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Locally, traces and failure screenshots go to the temp folder (not into
  // the project, which is synced by OneDrive). CI keeps the default.
  outputDir: process.env.CI
    ? "test-results"
    : join(tmpdir(), "olam-hayadit-test-results"),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Axe must judge the final look, not text that is mid-animation. Motion
    // itself is checked in motion.spec.ts (which turns it back on).
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx serve out --listen ${PORT} --no-clipboard --no-request-logging`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
