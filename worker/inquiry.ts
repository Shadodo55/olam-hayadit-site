/**
 * POST /api/inquiry: the contact and professionals forms.
 * GET /api/inquiry: whether sending is set up yet ({ configured }), so the
 * pages can offer phone/WhatsApp instead of a form that can't send.
 *
 * Order of checks: same-origin → size → honeypot → configured → rate limit →
 * field validation → Turnstile → email the store (Resend) → save a copy in D1.
 * Personal data never goes to Sanity. D1 copies are deleted after 12 months
 * by the daily cron (see `deleteOldInquiries`).
 */
import {
  professionLabelsHe,
  validateInquiry,
  type Inquiry,
} from "../src/features/forms/inquiry";

export interface InquiryEnv {
  DB?: D1Database;
  INQUIRY_RATE_LIMIT?: RateLimit;
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export type InquiryError =
  | "method_not_allowed"
  | "forbidden"
  | "too_large"
  | "invalid_json"
  | "not_configured"
  | "rate_limited"
  | "invalid"
  | "captcha"
  | "send_failed";

type Reply = (body: unknown, init?: ResponseInit) => Response;

const MAX_BODY = 16 * 1024;
const RETENTION_MONTHS = 12;
const DEFAULT_FROM = "Olam HaYadit website <onboarding@resend.dev>";

/** Email (Resend), the store's address and spam protection are all set. */
function isConfigured(env: InquiryEnv): env is InquiryEnv & {
  RESEND_API_KEY: string;
  INQUIRY_TO_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
} {
  return Boolean(
    env.RESEND_API_KEY && env.INQUIRY_TO_EMAIL && env.TURNSTILE_SECRET_KEY,
  );
}

export async function handleInquiry(
  request: Request,
  env: InquiryEnv,
  reply: Reply,
): Promise<Response> {
  const fail = (error: InquiryError, status: number, extra = {}) =>
    reply({ error, ...extra }, { status });

  if (request.method === "GET") return reply({ configured: isConfigured(env) });
  if (request.method !== "POST") return fail("method_not_allowed", 405);

  // Only our own pages may post (browsers always send Origin on POST).
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) return fail("forbidden", 403);

  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY) return fail("too_large", 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail("too_large", 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("not object");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid_json", 400);
  }

  // Honeypot: a field people never see. Bots fill it; pretend it worked.
  if (typeof body.website === "string" && body.website.trim() !== "")
    return reply({ ok: true });

  if (!isConfigured(env)) return fail("not_configured", 503);

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (env.INQUIRY_RATE_LIMIT) {
    const { success } = await env.INQUIRY_RATE_LIMIT.limit({ key: ip });
    if (!success) return fail("rate_limited", 429);
  }

  const result = validateInquiry(body);
  if (!result.ok) return fail("invalid", 422, { fields: result.errors });

  const token =
    typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY)))
    return fail("captcha", 403);

  const inquiry = result.inquiry;
  const createdAt = new Date().toISOString();

  // Email first: if it fails, the visitor is told so and nothing is kept
  // (a retry won't create a duplicate). The D1 copy backs up sent inquiries.
  const sent = await sendEmail(env, inquiry, createdAt);
  if (!sent) return fail("send_failed", 502);

  if (env.DB) {
    try {
      await saveInquiry(env.DB, inquiry, createdAt);
    } catch (error) {
      console.error("[inquiry] D1 insert failed", error);
    }
  }
  return reply({ ok: true });
}

async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string,
): Promise<boolean> {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip !== "unknown") form.append("remoteip", ip);
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const outcome = (await response.json()) as { success?: boolean };
    return outcome.success === true;
  } catch (error) {
    console.error("[inquiry] Turnstile verify failed", error);
    return false;
  }
}

export async function saveInquiry(
  db: D1Database,
  inquiry: Inquiry,
  createdAt: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO inquiries
        (id, kind, name, phone, email, profession, business, message, marketing_consent, locale, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      inquiry.kind,
      inquiry.name,
      inquiry.phone,
      inquiry.email,
      inquiry.profession,
      inquiry.business,
      inquiry.message,
      inquiry.marketing ? 1 : 0,
      inquiry.locale,
      createdAt,
    )
    .run();
}

/** Plain-text email in Hebrew for the store. No HTML: nothing to inject. */
export function emailContent(inquiry: Inquiry, createdAt: string) {
  const kind = inquiry.kind === "professional" ? "איש/אשת מקצוע" : "יצירת קשר";
  const when = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(createdAt));
  const lines = [
    `סוג הפנייה: ${kind}`,
    `שם: ${inquiry.name}`,
    `טלפון: ${inquiry.phone}`,
    `דוא״ל: ${inquiry.email ?? "לא נמסר"}`,
    ...(inquiry.kind === "professional"
      ? [
          `תחום: ${inquiry.profession ? professionLabelsHe[inquiry.profession] : ""}`,
          `שם העסק: ${inquiry.business ?? "לא נמסר"}`,
        ]
      : []),
    "",
    "הודעה:",
    inquiry.message ?? "(ללא הודעה)",
    "",
    `מאשר/ת קבלת עדכונים ודיוור: ${inquiry.marketing ? "כן" : "לא"}`,
    `שפת האתר: ${inquiry.locale === "en" ? "אנגלית" : "עברית"}`,
    `נשלח: ${when}`,
  ];
  return {
    subject: `פנייה חדשה מהאתר (${kind}): ${inquiry.name}`,
    text: lines.join("\n"),
  };
}

async function sendEmail(
  env: InquiryEnv,
  inquiry: Inquiry,
  createdAt: string,
): Promise<boolean> {
  const { subject, text } = emailContent(inquiry, createdAt);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.INQUIRY_FROM_EMAIL || DEFAULT_FROM,
        to: [env.INQUIRY_TO_EMAIL],
        ...(inquiry.email ? { reply_to: inquiry.email } : {}),
        subject,
        text,
      }),
    });
    if (!response.ok) {
      console.error("[inquiry] Resend error", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[inquiry] Resend request failed", error);
    return false;
  }
}

/** Daily cron: delete inquiry copies older than 12 months. */
export async function deleteOldInquiries(
  db: D1Database,
  now = new Date(),
): Promise<void> {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - RETENTION_MONTHS);
  await db
    .prepare("DELETE FROM inquiries WHERE created_at < ?")
    .bind(cutoff.toISOString())
    .run();
}
