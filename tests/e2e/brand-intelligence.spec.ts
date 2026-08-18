import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) { await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/); const reset = await page.request.post("/crm/test-reset"); expect(reset.ok()).toBeTruthy(); }

test("governed ERA Group facts drive library, presentation, and referral investment", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/brands");
  await expect(page.getByRole("heading", { name: "Brand Library" })).toBeVisible();
  const eraCard = page.getByLabel("ERA Group brand card");
  await eraCard.getByText("Global business consulting franchise specializing in cost optimization and operational improvement.", { exact: true }).click();
  await expect(page).toHaveURL(/\/crm\/brands\/era-group$/);
  await expect(page.getByRole("heading", { name: "ERA Group" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Brand Library" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Brand Profile · approved for presentation", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Not Yet Available", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs Verification", { exact: true })).toBeVisible();
  await expect(page.getByText("$85,000", { exact: true })).toBeVisible();
  await expect(page.getByText("$175,000", { exact: true })).toBeVisible();

  await page.goto("/crm/candidates/elena-rodriguez/strategy");
  const era = page.getByLabel("ERA Group recommendation"); const aiMatch = await era.getByText(/%/).first().innerText();
  await era.getByRole("button", { name: "Add to Presentation Set" }).click(); await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page.getByText("Global business consulting franchise specializing in cost optimization and operational improvement.", { exact: true })).toBeVisible();
  await expect(page.getByText("Not Yet Profiled", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates/elena-rodriguez/strategy"); await expect(page.getByLabel("ERA Group recommendation").getByText(aiMatch, { exact: true })).toBeVisible(); await page.getByLabel("ERA Group presentation").getByRole("button", { name: "Refer", exact: true }).click();
  await page.goto("/crm/candidates/elena-rodriguez/referral"); await page.getByRole("checkbox", { name: /ERA Group/ }).check(); await page.getByRole("button", { name: "Prepare Referral Anyway" }).click();
  await expect(page.getByText("Brand Investment Range:", { exact: false })).toContainText("$85,000–$175,000");
});

test("Brand Library card primary navigation is keyboard accessible", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/brands");
  const cardLink = page.getByRole("link", { name: "Open Schooley Mitchell Brand Profile" });
  await cardLink.focus(); await expect(cardLink).toBeFocused(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/crm\/brands\/schooley-mitchell$/);
  await expect(page.getByRole("heading", { name: "Schooley Mitchell" })).toBeVisible();
  await expect(page.getByRole("navigation").locator('[aria-current="page"]')).toHaveCount(1);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Brand Library" })).toHaveAttribute("aria-current", "page");
});
