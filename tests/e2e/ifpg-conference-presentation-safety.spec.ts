import { expect, test, type Page } from "@playwright/test";

async function enterAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok()).toBeTruthy();
}

async function expectPresentationSafe(page: Page) {
  await expect(page.getByText("Demo Workspace — temporary data", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/FranchiseReady/i);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
]) {
  test(`conference surfaces remain presentation-safe at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await enterAndReset(page);
    for (const path of [
      "/crm",
      "/crm/candidates/candidate-demo",
      "/crm/candidate-demo/discovery",
      "/crm/brands",
      "/crm/candidates/candidate-demo/strategy",
      "/crm/candidates/candidate-demo/referral",
    ]) {
      await page.goto(path);
      await expectPresentationSafe(page);
      if (path === "/crm/candidates/candidate-demo") {
        await expect(page.getByRole("button", { name: "Delete Candidate" })).toHaveCount(0);
      }
    }
  });
}

test("seeded meeting is clearly local and Unicode renders as intended", async ({ page }) => {
  await enterAndReset(page);
  await page.goto("/crm/calendar");
  const event = page.getByRole("heading", { name: "Discovery Call — John Smith" }).locator("xpath=ancestor::article");
  await expect(event).toContainText("Conference demo · no external meeting");
  await event.getByText("View Meeting", { exact: true }).click();
  await expect(event.getByRole("link", { name: "Open meeting link" })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/â|Â|Ã|ï¿½|�/);
});

test("public scheduling placeholder is a dead-end rather than a fake link", async ({ page }) => {
  await page.goto("/request-demo");
  await expect(page.getByText("Scheduling Link Coming Soon", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Schedule My Demo" })).toHaveCount(0);
});
