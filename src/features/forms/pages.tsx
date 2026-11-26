import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Placeholder } from "@/components/ui/Placeholder";
import { OpenStatus } from "@/features/store-info/OpenStatus";
import { IntlProvider } from "@/lib/i18n/IntlProvider";
import { localeHref, type Locale } from "@/lib/i18n/locales";
import { formMessagesFor } from "@/lib/i18n/messages";
import { pagePaths } from "@/lib/routes";
import {
  formatAddress,
  getSiteSettings,
  wazeUrl,
  whatsappUrl,
  type SiteSettings,
} from "@/lib/site/settings";
import type { InquiryKind } from "./inquiry";
import { InquiryForm } from "./InquiryForm";

const container = "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8";

/* ---------- contact ---------- */

export async function ContactPage({ locale }: { locale: Locale }) {
  const [pages, t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "contactPage" }),
    getSiteSettings(),
  ]);
  return (
    <div className={container}>
      <PageHeader locale={locale} title={pages("contact")} intro={t("intro")} />
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <section aria-labelledby="contact-form" className="lg:col-span-7">
          <h2 id="contact-form" className="section-title">
            {t("formTitle")}
          </h2>
          <div className="mt-8">
            <Form kind="contact" locale={locale} settings={settings} />
          </div>
        </section>
        <div className="lg:col-span-5">
          <ContactDetails locale={locale} settings={settings} />
        </div>
      </div>
    </div>
  );
}

/* ---------- professionals ---------- */

export async function ProfessionalsPage({ locale }: { locale: Locale }) {
  const [pages, t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "pages" }),
    getTranslations({ locale, namespace: "prosPage" }),
    getSiteSettings(),
  ]);
  const proPhone = settings.phones.mobile ?? settings.phones.store;
  const listLink = (chunks: ReactNode) => (
    <Link
      href={localeHref(locale, pagePaths.myList)}
      className="font-semibold underline underline-offset-4"
    >
      {chunks}
    </Link>
  );
  const steps = [t("how1"), t.rich("how2", { link: listLink }), t("how3")];

  return (
    <div className={container}>
      <PageHeader
        locale={locale}
        title={pages("professionals")}
        intro={t("intro")}
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <section aria-labelledby="pros-form" className="lg:col-span-7">
          <h2 id="pros-form" className="section-title">
            {t("formTitle")}
          </h2>
          <div className="mt-8">
            <Form kind="professional" locale={locale} settings={settings} />
          </div>
        </section>
        <div className="space-y-8 lg:col-span-5">
          {proPhone && (
            <section
              aria-labelledby="pros-phone"
              className="on-dark rounded-sm bg-band p-6 text-on-band sm:p-8"
            >
              <h2 id="pros-phone" className="text-lg">
                {t("phoneTitle")}
              </h2>
              <a
                href={`tel:${proPhone.e164}`}
                className="mt-2 inline-flex min-h-11 items-center gap-3 display-title text-3xl underline-offset-8 hover:underline"
              >
                <PhoneIcon
                  width={26}
                  height={26}
                  className="text-accent-on-band"
                />
                <span dir="ltr" className="tabular">
                  {proPhone.display}
                </span>
              </a>
            </section>
          )}
          <section
            aria-labelledby="pros-how"
            className="rounded-sm border border-line p-6 sm:p-8"
          >
            <h2 id="pros-how" className="text-xl">
              {t("howTitle")}
            </h2>
            {/* A real sequence: inquiry → list → showroom visit. */}
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent font-semibold text-accent-ink tabular"
                  >
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <ContactDetails locale={locale} settings={settings} />
        </div>
      </div>
    </div>
  );
}

/* ---------- shared ---------- */

function Form({
  kind,
  locale,
  settings,
}: {
  kind: InquiryKind;
  locale: Locale;
  settings: SiteSettings;
}) {
  const phone = settings.phones.store ?? settings.phones.mobile;
  // The form's texts ship only with the form pages, not with every page.
  return (
    <IntlProvider
      locale={locale}
      messages={formMessagesFor(locale)}
      timeZone="Asia/Jerusalem"
    >
      <InquiryForm
        kind={kind}
        privacyHref={localeHref(locale, pagePaths.privacy)}
        phone={phone ? { display: phone.display, e164: phone.e164 } : null}
        whatsappHref={whatsappUrl(settings.whatsapp)}
      />
    </IntlProvider>
  );
}

/** Address, phones, live status and quick actions. */
async function ContactDetails({
  locale,
  settings,
}: {
  locale: Locale;
  settings: SiteSettings;
}) {
  const [t, visit, footer, header, common] = await Promise.all([
    getTranslations({ locale, namespace: "contactPage" }),
    getTranslations({ locale, namespace: "visit" }),
    getTranslations({ locale, namespace: "footer" }),
    getTranslations({ locale, namespace: "header" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const address = formatAddress(settings, locale);
  const whatsapp = whatsappUrl(settings.whatsapp);
  const phones = [
    { label: footer("storePhone"), phone: settings.phones.store },
    { label: footer("mobilePhone"), phone: settings.phones.mobile },
  ].flatMap(({ label, phone }) => (phone ? [{ label, phone }] : []));

  return (
    <section
      aria-labelledby="contact-details"
      className="rounded-sm bg-surface p-6 sm:p-8"
    >
      <h2 id="contact-details" className="text-xl">
        {t("detailsTitle")}
      </h2>
      <p className="mt-4 inline-flex items-center gap-2 rounded-sm bg-paper px-3 py-2">
        <OpenStatus hours={settings.hours} specialDays={settings.specialDays} />
      </p>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-sm text-ink-muted">{visit("addressTitle")}</dt>
          <dd className="mt-1 flex items-start gap-2">
            <PinIcon className="mt-0.5 shrink-0 text-accent-ink" />
            {address || <Placeholder label={common("placeholder")} />}
          </dd>
        </div>
        {phones.map(({ label, phone }) => (
          <div key={label}>
            <dt className="text-sm text-ink-muted">{label}</dt>
            <dd className="mt-1">
              <a
                href={`tel:${phone.e164}`}
                className="inline-flex min-h-11 items-center gap-2 text-lg font-semibold underline-offset-4 hover:underline"
              >
                <PhoneIcon className="text-accent-ink" />
                <span dir="ltr" className="tabular">
                  {phone.display}
                </span>
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("solid", "sm")}
          >
            <ChatIcon />
            {header("whatsapp")}
            <span className="sr-only"> {common("opensInNewTab")}</span>
          </a>
        )}
        <a
          href={wazeUrl(settings)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("outline", "sm", "bg-paper")}
        >
          <PinIcon />
          {header("navigate")}
          <span className="sr-only"> {common("opensInNewTab")}</span>
        </a>
      </div>
      <Link
        href={localeHref(locale, pagePaths.visit)}
        className="mt-6 inline-flex min-h-11 items-center font-semibold underline decoration-accent decoration-2 underline-offset-4"
      >
        {t("hoursLink")}
      </Link>
    </section>
  );
}
