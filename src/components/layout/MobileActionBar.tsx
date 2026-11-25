import { getTranslations } from "next-intl/server";
import { ChatIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import type { Locale } from "@/lib/i18n/locales";
import { wazeUrl, whatsappUrl, type SiteSettings } from "@/lib/site/settings";
import { ActionBarShell } from "./ActionBarShell";

/**
 * Phones only: call / WhatsApp / directions, always one tap away at the
 * bottom of the screen. A spacer in RootDocument keeps it from covering the
 * footer. Hidden on wide screens (the header has these) and when printing.
 * On the home page it appears only after the hero's own actions have
 * scrolled away (ActionBarShell), so it never covers them.
 */
export async function MobileActionBar({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const phone = settings.phones.store ?? settings.phones.mobile;
  const whatsapp = whatsappUrl(settings.whatsapp);
  const item =
    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-sm font-semibold";

  return (
    <ActionBarShell
      label={t("quickActions")}
      className="action-bar fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
    >
      {phone && (
        <a href={`tel:${phone.e164}`} className={`${item} text-ink`}>
          <PhoneIcon />
          {t("callShort")}
        </a>
      )}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${item} bg-button text-on-button`}
        >
          <ChatIcon />
          {t("whatsapp")}
          <span className="sr-only"> {common("opensInNewTab")}</span>
        </a>
      )}
      <a
        href={wazeUrl(settings)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${item} text-ink`}
      >
        <PinIcon />
        {t("navigateShort")}
        <span className="sr-only"> {common("opensInNewTab")}</span>
      </a>
    </ActionBarShell>
  );
}
