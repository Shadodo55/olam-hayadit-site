import { Assistant, Frank_Ruhl_Libre } from "next/font/google";

// Self-hosted at build time by next/font: no requests to Google at runtime.
// Variable fonts: one file per script (Hebrew / Latin) covers every weight,
// instead of one file per weight.
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-frank-ruhl",
  display: "swap",
  // Display font: not preloaded, so it doesn't compete with the body font on
  // slow mobile connections. Headings render in the fallback serif first.
  preload: false,
});

export const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-assistant",
  display: "swap",
});

export const fontVariables = `${frankRuhl.variable} ${assistant.variable}`;
