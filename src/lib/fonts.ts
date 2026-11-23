import {
  Assistant,
  Frank_Ruhl_Libre,
  IBM_Plex_Sans_Hebrew,
  Rubik,
} from "next/font/google";

// Self-hosted at build time by next/font: no requests to Google at runtime.
// A font is only downloaded when the active theme actually uses it; only the
// default theme's fonts are preloaded.

/**
 * Display face of the default ("petrol") theme: precise and technical, like
 * a dimensioned drawing of a handle. Light (300) for large titles, medium
 * (500) for headings and the wordmark.
 */
export const plex = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["300", "500"],
  variable: "--font-plex",
  display: "swap",
});

/** Heavy display face for the "logo" theme (close to the sign's lettering). */
export const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-rubik",
  display: "swap",
  preload: false,
});

/** Serif display face for the "classic" theme. */
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-frank-ruhl",
  display: "swap",
  preload: false,
});

/** Text and UI, in every theme. */
export const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: "variable",
  variable: "--font-assistant",
  display: "swap",
});

export const fontVariables = `${plex.variable} ${rubik.variable} ${frankRuhl.variable} ${assistant.variable}`;
