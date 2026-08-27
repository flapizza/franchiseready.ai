import { expect, test } from "@playwright/test";

test("public liveness endpoint exposes no deployment or dependency detail", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store, max-age=0");
  expect(await response.json()).toEqual({ status: "ok" });
});
