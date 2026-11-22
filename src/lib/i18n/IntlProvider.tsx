"use client";

/**
 * Client-side i18n provider. Imported from a client module on purpose: the
 * server variant of NextIntlClientProvider would try to read request headers,
 * which a static export doesn't have.
 */
export { NextIntlClientProvider as IntlProvider } from "next-intl";
