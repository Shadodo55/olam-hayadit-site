import type messages from "./messages/he.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "he" | "en";
    Messages: typeof messages;
  }
}
