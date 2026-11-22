/**
 * Cloudflare Worker. Runs ONLY for /api/* (see wrangler.jsonc "run_worker_first").
 * Static pages are served directly from the assets binding.
 *
 * Phase 7 adds the form endpoints here (Turnstile, rate limiting, Resend email,
 * D1 copy). Personal data must never be sent to Sanity (see CLAUDE.md).
 */
import { securityHeaders } from "./security-headers";

export interface Env {
  ASSETS: Fetcher;
}

function json(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  for (const [name, value] of Object.entries(securityHeaders))
    headers.set(name, value);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    if (request.method !== "GET")
      return json({ error: "method_not_allowed" }, { status: 405 });
    return json({ ok: true });
  }

  if (url.pathname.startsWith("/api/")) {
    return json({ error: "not_found" }, { status: 404 });
  }

  return env.ASSETS.fetch(request);
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>;
