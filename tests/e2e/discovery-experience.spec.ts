import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("Discovery flows from pre-meeting through live review to Validation", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/discovery");
  await page.locator("article").filter({ hasText: "John Smith" }).getByRole("link", { name: "Open Discovery" }).click();
  await expect(page.getByText("Discovery Copilot · pre meeting", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discovery evidence requirements" })).toBeVisible();
  await page.getByRole("button", { name: "Start Discovery" }).click();
  await expect(page.getByText("Discovery Copilot · live", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Next Best Question" })).toHaveCount(1);
  await page.getByRole("button", { name: "Mark next best question asked" }).click();
  await page.getByRole("button", { name: "End Discovery" }).click();
  await expect(page.getByText("Post-Meeting Intelligence", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What Changed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discovery Complete · Validation Required" })).toBeVisible();
  await page.getByRole("button", { name: "Begin Validation" }).click();
  await expect(page.getByRole("button", { name: "Begin Validation" })).toHaveCount(0);
  await page.goto("/crm/candidates/candidate-demo");
  await expect(page.getByText("Validation", { exact: true }).first()).toBeVisible();
});

test("completed Discovery opens historical post-meeting intelligence", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/discovery?view=completed");
  await page.getByRole("link", { name: "Review Discovery" }).first().click();
  await expect(page.getByText("Post-Meeting Intelligence", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Discovery" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "End Discovery" })).toHaveCount(0);
});

test("sufficient evidence produces the Brand Strategy outcome without identity rules", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/michael-chen/discovery");
  await page.getByRole("button", { name: "Start Discovery" }).click();
  await expect(page).toHaveURL(/phase=live/);
  await page.getByRole("button", { name: "End Discovery" }).click();
  await expect(page.getByRole("heading", { name: "Discovery Complete · Ready for Brand Strategy" })).toBeVisible();
  await page.getByRole("button", { name: "Review Brand Strategy" }).click();
  await expect(page.getByRole("button", { name: "Review Brand Strategy" })).toHaveCount(0);
  await page.goto("/crm/candidates/michael-chen");
  await expect(page.getByText("Brand Matching", { exact: true }).first()).toBeVisible();
});
