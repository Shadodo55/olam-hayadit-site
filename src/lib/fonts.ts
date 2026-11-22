import { Assistant, Frank_Ruhl_Libre } from "next/font/google";

// Self-hosted at build time by next/font: no requests to Google at runtime.
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

export const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "600"],
  variable: "--font-assistant",
  display: "swap",
});

export const fontVariables = `${frankRuhl.variable} ${assistant.variable}`;
