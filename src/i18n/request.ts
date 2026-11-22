import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/lib/i18n/locales";
import { messagesFor } from "@/lib/i18n/messages";

/**
 * next-intl request config. The site is a static export, so the locale is
 * ALWAYS passed explicitly (`getTranslations({ locale })`); we never read it
 * from request headers.
 */
export default getRequestConfig(async ({ locale }) => {
  const resolved = locale && isLocale(locale) ? locale : defaultLocale;
  return {
    locale: resolved,
    messages: messagesFor(resolved),
    timeZone: "Asia/Jerusalem",
  };
});
