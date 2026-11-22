import { describe, expect, it, vi } from "vitest";
import { handleRequest, type Env } from "./index";

function makeEnv() {
  const fetch = vi.fn(async () => new Response("static page"));
  return { env: { ASSETS: { fetch } } as unknown as Env, assetsFetch: fetch };
}

describe("worker", () => {
  it("answers the health check", async () => {
    const { env } = makeEnv();
    const response = await handleRequest(
      new Request("https://site.test/api/health"),
      env,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects non-GET on the health check", async () => {
    const { env } = makeEnv();
    const response = await handleRequest(
      new Request("https://site.test/api/health", { method: "POST" }),
      env,
    );
    expect(response.status).toBe(405);
  });

  it("returns JSON 404 for unknown API routes", async () => {
    const { env, assetsFetch } = makeEnv();
    const response = await handleRequest(
      new Request("https://site.test/api/nope"),
      env,
    );
    expect(response.status).toBe(404);
    expect(assetsFetch).not.toHaveBeenCalled();
  });

  it("hands everything else to static assets", async () => {
    const { env, assetsFetch } = makeEnv();
    const response = await handleRequest(
      new Request("https://site.test/en"),
      env,
    );
    expect(await response.text()).toBe("static page");
    expect(assetsFetch).toHaveBeenCalledOnce();
  });
});
