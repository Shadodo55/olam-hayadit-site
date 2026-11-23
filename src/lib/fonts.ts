import { Assistant, Frank_Ruhl_Libre, Rubik } from "next/font/google";

// Self-hosted at build time by next/font: no requests to Google at runtime.
// Variable fonts: one file per script (Hebrew / Latin) covers every weight.
// A font is only downloaded when the active theme actually uses it.

/** Bold display face for the brand themes (close to the store's sign lettering). */
export const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-rubik",
  display: "swap",
});

/** Serif display face for the "classic" theme. */
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-frank-ruhl",
  display: "swap",
  preload: false,
});

export const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-assistant",
  display: "swap",
});

export const fontVariables = `${rubik.variable} ${frankRuhl.variable} ${assistant.variable}`;
