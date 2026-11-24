import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleRequest, type Env } from "./index";
import { deleteOldInquiries, emailContent } from "./inquiry";

const ORIGIN = "https://site.test";
const valid = {
  kind: "contact",
  name: "דנה כהן",
  phone: "052-1234567",
  email: "dana@example.com",
  message: "יש לכם ידית בר 128 מ״מ בשחור?",
  locale: "he",
  website: "",
  turnstileToken: "token-ok",
};

function makeDb() {
  const run = vi.fn(async () => ({ success: true }));
  const bind = vi.fn(() => ({ run }));
  const prepare = vi.fn(() => ({ bind }));
  return { db: { prepare } as unknown as D1Database, prepare, bind, run };
}

function makeEnv(overrides: Partial<Env> = {}) {
  const { db, bind } = makeDb();
  const limit = vi.fn(async () => ({ success: true }));
  const env = {
    ASSETS: { fetch: vi.fn() },
    DB: db,
    INQUIRY_RATE_LIMIT: { limit },
    RESEND_API_KEY: "re_test",
    INQUIRY_TO_EMAIL: "store@example.com",
    TURNSTILE_SECRET_KEY: "secret",
    ...overrides,
  } as unknown as Env;
  return { env, bind, limit };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/inquiry`, {
    method: "POST",
    headers: {
      origin: ORIGIN,
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.7",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn(async (url: string) => {
    if (url.includes("turnstile")) return Response.json({ success: true });
    return Response.json({ id: "email-1" });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("POST /api/inquiry", () => {
  it("saves a copy and emails the store", async () => {
    const { env, bind } = makeEnv();
    const response = await handleRequest(post(valid), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");

    expect(bind).toHaveBeenCalledOnce();
    const [, kind, name, phone, email] = bind.mock.calls[0] as unknown[];
    expect([kind, name, phone, email]).toEqual([
      "contact",
      "דנה כהן",
      "052-1234567",
      "dana@example.com",
    ]);

    const emailCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("resend"),
    )!;
    const sent = JSON.parse((emailCall[1] as RequestInit).body as string);
    expect(sent.to).toEqual(["store@example.com"]);
    expect(sent.reply_to).toBe("dana@example.com");
    expect(sent.subject).toContain("דנה כהן");
    expect(sent.text).toContain("052-1234567");
    expect(sent.html).toBeUndefined();
  });

  it("refuses posts from other sites", async () => {
    const { env } = makeEnv();
    const response = await handleRequest(
      post(valid, { origin: "https://evil.test" }),
      env,
    );
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("only accepts POST", async () => {
    const { env } = makeEnv();
    const response = await handleRequest(
      new Request(`${ORIGIN}/api/inquiry`),
      env,
    );
    expect(response.status).toBe(405);
  });

  it("silently drops bots that fill the honeypot", async () => {
    const { env, bind } = makeEnv();
    const response = await handleRequest(
      post({ ...valid, website: "https://spam.test" }),
      env,
    );
    expect(response.status).toBe(200);
    expect(bind).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says so when email isn't set up yet (and stores nothing)", async () => {
    const { env, bind } = makeEnv({ RESEND_API_KEY: undefined });
    const response = await handleRequest(post(valid), env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "not_configured" });
    expect(bind).not.toHaveBeenCalled();
  });

  it("rate-limits by IP address", async () => {
    const { env, limit } = makeEnv();
    limit.mockResolvedValueOnce({ success: false });
    const response = await handleRequest(post(valid), env);
    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
  });

  it("returns field errors as codes", async () => {
    const { env } = makeEnv();
    const response = await handleRequest(
      post({ ...valid, name: "", phone: "123" }),
      env,
    );
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: "invalid",
      fields: { name: "required", phone: "invalid" },
    });
  });

  it("rejects a failed Turnstile check", async () => {
    const { env, bind } = makeEnv();
    fetchMock.mockImplementationOnce(async () =>
      Response.json({ success: false }),
    );
    const response = await handleRequest(post(valid), env);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "captcha" });
    expect(bind).not.toHaveBeenCalled();
  });

  it("rejects bad JSON and oversized bodies", async () => {
    const { env } = makeEnv();
    expect((await handleRequest(post("{nope"), env)).status).toBe(400);
    const big = { ...valid, message: "א".repeat(20_000) };
    expect((await handleRequest(post(big), env)).status).toBe(413);
  });

  it("reports a failed email and keeps no copy", async () => {
    const { env, bind } = makeEnv();
    fetchMock.mockImplementation(async (url: string) =>
      url.includes("turnstile")
        ? Response.json({ success: true })
        : new Response("error", { status: 500 }),
    );
    const response = await handleRequest(post(valid), env);
    expect(response.status).toBe(502);
    expect(bind).not.toHaveBeenCalled();
  });
});

describe("emailContent", () => {
  it("includes the professional details in Hebrew", () => {
    const { subject, text } = emailContent(
      {
        kind: "professional",
        name: "יוסי לוי",
        phone: "050-7654321",
        email: null,
        profession: "carpenter",
        business: "נגרות לוי",
        message: null,
        marketing: true,
        locale: "en",
      },
      "2026-11-24T10:00:00.000Z",
    );
    expect(subject).toBe("פנייה חדשה מהאתר (איש/אשת מקצוע): יוסי לוי");
    expect(text).toContain("תחום: נגר/ית");
    expect(text).toContain("שם העסק: נגרות לוי");
    expect(text).toContain("דוא״ל: לא נמסר");
    expect(text).toContain("מאשר/ת קבלת עדכונים ודיוור: כן");
    expect(text).toContain("שפת האתר: אנגלית");
  });
});

describe("deleteOldInquiries", () => {
  it("deletes copies older than 12 months", async () => {
    const { db, prepare, bind } = makeDb();
    await deleteOldInquiries(db, new Date("2026-11-24T03:00:00.000Z"));
    expect(prepare).toHaveBeenCalledWith(
      "DELETE FROM inquiries WHERE created_at < ?",
    );
    expect(bind).toHaveBeenCalledWith("2025-11-24T03:00:00.000Z");
  });
});
