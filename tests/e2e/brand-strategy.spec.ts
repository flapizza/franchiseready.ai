import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("consultant reviews evidence-backed Brand Strategy and advances referral readiness", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig");
  await page.getByRole("link", { name: "Review Brand Strategy" }).click();

  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig\/strategy$/);
  await expect(page.getByRole("heading", { name: "Brand Strategy for Jared Wirsig" })).toBeVisible();
  await expect(page.locator("header").getByRole("heading", { name: "Brand Strategy", exact: true })).toBeVisible();
  await expect(page.getByText("Top Recommendation", { exact: true })).toBeVisible();
  await expect(page.getByText(/is the recommended lead presentation\./)).toBeVisible();
  await expect(page.getByText(/^Why .+ leads$/i)).toBeVisible();
  const candidateReadiness = page.getByLabel("Candidate Readiness");
  await expect(candidateReadiness.getByText(/\d+%/)).toBeVisible();
  await expect(candidateReadiness.getByText("Referral", { exact: true })).toHaveCount(0);
  await expect(candidateReadiness.getByText("Awarded", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Financially Qualified", { exact: true }).first()).toBeVisible();
  const referralGate = page.getByLabel("Referral Readiness");
  await expect(referralGate.getByText("Referral Readiness · Recommended", { exact: true })).toBeVisible();
  await expect(referralGate.getByRole("heading", { name: "Referral Readiness: Recommended" })).toBeVisible();
  await expect(referralGate.getByText(/\d+%/)).toHaveCount(0);
  await expect(referralGate.getByRole("link", { name: "Open Referral Studio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ranked alternatives" })).toBeVisible();

  await referralGate.getByRole("link", { name: "Open Referral Studio" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig\/referral$/);
});

test("candidate with readiness concerns receives advisory guidance and retains consultant authority", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/elena-rodriguez/strategy");
  await expect(page.getByRole("heading", { name: "Brand Strategy for Elena Rodriguez" })).toBeVisible();
  const referralGate = page.getByLabel("Referral Readiness");
  await expect(referralGate.getByText("Referral Readiness · Needs Attention", { exact: true })).toBeVisible();
  await expect(referralGate.getByRole("heading", { name: "Referral Readiness: Needs Attention" })).toBeVisible();
  await expect(referralGate.getByRole("link", { name: "Prepare Referral Anyway" })).toBeVisible();
});
