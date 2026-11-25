"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";
import {
  inquiryFields,
  LIMITS,
  professions,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryKind,
} from "./inquiry";
import {
  loadTurnstile,
  TURNSTILE_SITE_KEY,
  type TurnstileApi,
} from "./turnstile";

type Failure = "notConfigured" | "rateLimited" | "captcha" | "failed";
type Status = "idle" | "sending" | "sent" | Failure;

const SERVER_ERRORS: Record<string, Failure> = {
  not_configured: "notConfigured",
  rate_limited: "rateLimited",
  captcha: "captcha",
};

/** Length limits shown in "too long" messages. */
const MAX_LENGTH: Record<InquiryField, number> = {
  name: LIMITS.nameMax,
  phone: LIMITS.phoneMax,
  email: LIMITS.emailMax,
  profession: 0,
  business: LIMITS.businessMax,
  message: LIMITS.messageMax,
};

const input =
  "mt-2 block min-h-12 w-full rounded-sm border bg-paper px-3 py-2 text-base text-ink";

/**
 * The contact / professionals form. Validates with the same rules as the
 * Worker, shows an error summary (focused) plus an error under each field,
 * and loads spam protection (Turnstile) on the first interaction only.
 * Until sending is set up (the Worker says so), it offers phone and WhatsApp
 * instead of fields people would fill in for nothing.
 */
export function InquiryForm({
  kind,
  privacyHref,
  phone,
  whatsappHref,
}: {
  kind: InquiryKind;
  privacyHref: string;
  /** Fallback contact shown when sending fails. */
  phone: { display: string; e164: string } | null;
  whatsappHref: string | null;
}) {
  const t = useTranslations("forms");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const id = useId();
  const fieldId = (field: InquiryField) => `${id}-${field}`;

  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [active, setActive] = useState(true);
  const [summaryKey, setSummaryKey] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Turnstile: one widget, one single-use token at a time.
  const widgetRef = useRef<HTMLDivElement>(null);
  const turnstileStarted = useRef(false);
  const turnstile = useRef<{ api: TurnstileApi; id?: string } | null>(null);
  const token = useRef<string | null>(null);
  const waiters = useRef<((token: string | null) => void)[]>([]);

  const settle = (value: string | null) => {
    token.current = value;
    for (const resolve of waiters.current.splice(0)) resolve(value);
  };

  const startTurnstile = () => {
    if (turnstileStarted.current || !widgetRef.current) return;
    turnstileStarted.current = true;
    const element = widgetRef.current;
    loadTurnstile()
      .then((api) => {
        const widgetId = api.render(element, {
          sitekey: TURNSTILE_SITE_KEY,
          action: kind,
          language: locale,
          appearance: "interaction-only",
          callback: (value) => settle(value),
          "expired-callback": () => (token.current = null),
          "error-callback": () => settle(null),
        });
        turnstile.current = { api, id: widgetId };
      })
      .catch(() => {
        turnstileStarted.current = false;
        settle(null);
      });
  };

  const getToken = () =>
    token.current
      ? Promise.resolve(token.current)
      : new Promise<string | null>((resolve) => {
          waiters.current.push(resolve);
          startTurnstile();
          setTimeout(() => resolve(token.current), 20_000);
        });

  // Is sending switched on yet? If we can't tell (offline, no Worker), keep
  // the form: a failed send still explains itself and offers phone/WhatsApp.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/inquiry", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if ((data as { configured?: unknown } | null)?.configured === false)
          setActive(false);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);
  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  const showErrors = (next: InquiryErrors) => {
    setErrors(next);
    setSummaryKey((key) => key + 1);
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const payload = {
      kind,
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      profession: data.get("profession"),
      business: data.get("business"),
      message: data.get("message"),
      marketing: data.get("marketing") === "on",
      website: data.get("website"),
      locale,
    };
    const result = validateInquiry(payload);
    if (!result.ok) {
      setStatus("idle");
      showErrors(result.errors);
      return;
    }
    setErrors({});
    setStatus("sending");

    const turnstileToken = await getToken();
    if (!turnstileToken) {
      setStatus("captcha");
      return;
    }
    // Tokens are single-use: get a fresh one for any later attempt.
    token.current = null;
    turnstile.current?.api.reset(turnstile.current.id);

    const response = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, turnstileToken }),
    }).catch(() => null);
    if (response?.ok) {
      setStatus("sent");
      return;
    }
    const body = (await response?.json().catch(() => null)) as {
      error?: string;
      fields?: InquiryErrors;
    } | null;
    if (body?.error === "invalid" && body.fields) {
      setStatus("idle");
      showErrors(body.fields);
      return;
    }
    setStatus(SERVER_ERRORS[body?.error ?? ""] ?? "failed");
  }

  const clearError = (field: InquiryField) => {
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-line bg-surface p-6 sm:p-8">
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-2xl focus:outline-none"
        >
          {t("successTitle")}
        </h2>
        <p className="mt-3 text-lg">{t("successBody")}</p>
        {phone && (
          <p className="mt-3 text-ink-muted">
            {t("urgent")}{" "}
            <a
              href={`tel:${phone.e164}`}
              className="font-semibold text-ink underline underline-offset-4"
            >
              <span dir="ltr">{phone.display}</span>
            </a>
          </p>
        )}
      </div>
    );
  }

  if (!active) {
    return (
      <div
        className="rounded-sm border border-line bg-surface p-6 sm:p-8"
        data-testid="form-inactive"
      >
        <p className="max-w-prose text-lg">{t("inactive")}</p>
        {(phone || whatsappHref) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {phone && (
              <a
                href={`tel:${phone.e164}`}
                className={buttonClass("solid", "md")}
              >
                <PhoneIcon />
                <span dir="ltr">{phone.display}</span>
              </a>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("outline", "md")}
              >
                <ChatIcon />
                {tHeader("whatsapp")}
                <span className="sr-only"> {tCommon("opensInNewTab")}</span>
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  const errorList = inquiryFields.filter((field) => errors[field]);
  const errorText = (field: InquiryField) =>
    errors[field]
      ? t(`errors.${field}.${errors[field]}`, { max: MAX_LENGTH[field] })
      : null;
  const describedBy = (field: InquiryField, hint = false) =>
    [
      hint && `${fieldId(field)}-hint`,
      errors[field] && `${fieldId(field)}-error`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const borderFor = (field: InquiryField) =>
    errors[field] ? "border-danger border-2" : "border-line-strong";
  const label = (field: InquiryField, text: string, optional = false) => (
    <label htmlFor={fieldId(field)} className="block font-semibold">
      {text}
      {optional && (
        <span className="ms-1 font-normal text-ink-muted">{t("optional")}</span>
      )}
    </label>
  );
  const fieldError = (field: InquiryField) =>
    errors[field] && (
      <p
        id={`${fieldId(field)}-error`}
        className="mt-2 font-semibold text-danger"
      >
        {errorText(field)}
      </p>
    );

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={(event) => {
        // Only when someone starts filling in a field (not on a link).
        if (event.target.matches("input, select, textarea")) startTurnstile();
      }}
      className="relative space-y-6"
    >
      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className="rounded-sm border-2 border-danger p-5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <h3 className="text-lg font-medium">
            {t("errorSummary", { count: errorList.length })}
          </h3>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            {errorList.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldId(field)}`}
                  className="font-semibold text-danger underline underline-offset-4"
                >
                  {errorText(field)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-ink-muted">{t("requiredNote")}</p>

      <div>
        {label("name", t("name"))}
        <input
          id={fieldId("name")}
          name="name"
          autoComplete="name"
          maxLength={LIMITS.nameMax}
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          onInput={() => clearError("name")}
          className={`${input} ${borderFor("name")}`}
        />
        {fieldError("name")}
      </div>

      <div>
        {label("phone", t("phone"))}
        <p
          id={`${fieldId("phone")}-hint`}
          className="mt-1 text-sm text-ink-muted"
        >
          {t("phoneHint")}
        </p>
        <input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          inputMode="tel"
          maxLength={LIMITS.phoneMax}
          aria-required="true"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", true)}
          onInput={() => clearError("phone")}
          className={`${input} max-w-xs text-start ${borderFor("phone")}`}
        />
        {fieldError("phone")}
      </div>

      <div>
        {label("email", t("email"), true)}
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          maxLength={LIMITS.emailMax}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          onInput={() => clearError("email")}
          className={`${input} max-w-md text-start ${borderFor("email")}`}
        />
        {fieldError("email")}
      </div>

      {kind === "professional" && (
        <>
          <div>
            {label("profession", t("profession"))}
            <select
              id={fieldId("profession")}
              name="profession"
              defaultValue=""
              aria-required="true"
              aria-invalid={errors.profession ? true : undefined}
              aria-describedby={describedBy("profession")}
              onChange={() => clearError("profession")}
              className={`${input} max-w-xs ${borderFor("profession")}`}
            >
              <option value="">{t("professionChoose")}</option>
              {professions.map((value) => (
                <option key={value} value={value}>
                  {t(`professions.${value}`)}
                </option>
              ))}
            </select>
            {fieldError("profession")}
          </div>
          <div>
            {label("business", t("business"), true)}
            <input
              id={fieldId("business")}
              name="business"
              autoComplete="organization"
              maxLength={LIMITS.businessMax}
              aria-invalid={errors.business ? true : undefined}
              aria-describedby={describedBy("business")}
              onInput={() => clearError("business")}
              className={`${input} ${borderFor("business")}`}
            />
            {fieldError("business")}
          </div>
        </>
      )}

      <div>
        {label(
          "message",
          kind === "professional" ? t("messagePro") : t("message"),
          kind === "professional",
        )}
        <p
          id={`${fieldId("message")}-hint`}
          className="mt-1 text-sm text-ink-muted"
        >
          {kind === "professional" ? t("messageProHint") : t("messageHint")}
        </p>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={6}
          maxLength={LIMITS.messageMax}
          aria-required={kind === "contact" ? "true" : undefined}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message", true)}
          onInput={() => clearError("message")}
          className={`${input} ${borderFor("message")}`}
        />
        {fieldError("message")}
      </div>

      <div className="flex items-start gap-3">
        <input
          id={`${id}-marketing`}
          name="marketing"
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-button"
        />
        <label htmlFor={`${id}-marketing`}>{t("marketing")}</label>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute -start-[200vw] top-0">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="text-sm text-ink-muted">
        {t.rich("privacyNote", {
          link: (chunks) => (
            <Link
              href={privacyHref}
              className="text-ink underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <div ref={widgetRef} />

      {status !== "idle" && status !== "sending" && (
        <div role="alert" className="rounded-sm border-2 border-danger p-5">
          <p className="font-semibold">{t(`failures.${status}`)}</p>
          {(phone || whatsappHref) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {phone && (
                <a
                  href={`tel:${phone.e164}`}
                  className={buttonClass("outline", "sm")}
                >
                  <PhoneIcon />
                  <span dir="ltr">{phone.display}</span>
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("outline", "sm")}
                >
                  <ChatIcon />
                  {tHeader("whatsapp")}
                  <span className="sr-only"> {tCommon("opensInNewTab")}</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        aria-disabled={status === "sending" ? true : undefined}
        className={buttonClass("solid", "md", "min-w-40")}
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
