import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("consultant-first candidate remains one identity through assessment and Discovery", async ({ page }) => {
  await enterDemoAndReset(page);
  const email = "conference.lifecycle@example.com";

  await page.goto("/crm/candidates/new");
  await page.getByLabel("First Name").fill("Conference");
  await page.getByLabel("Last Name").fill("Journey");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("City").fill("Charlotte");
  await page.getByLabel("State").fill("NC");
  await page.getByRole("button", { name: "Create Candidate" }).click();
  await expect(page.getByRole("heading", { name: "Candidate created" })).toBeVisible();

  await page.getByRole("link", { name: "Open candidate record" }).click();
  await expect(page.getByRole("heading", { name: "Conference Journey" })).toBeVisible();
  await expect(page.getByText("New Candidate", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Send Assessment" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Assessment Invitation Sent$/ })).toBeVisible();
  await page.getByRole("link", { name: "Open Assessment" }).click();

  await page.getByText("Very Comfortable", { exact: true }).click();
  await page.getByRole("button", { name: "Complete Assessment" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/candidate-/);
  await expect(page.getByText("Assessment Complete", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Assessment Completed", { exact: true }).first()).toBeVisible();

  await page.goto("/crm/candidates");
  await page.getByPlaceholder("Search name, email, or location").fill(email);
  await expect(page.getByText("1 candidate", { exact: true })).toBeVisible();
  await page.getByText(email, { exact: false }).first().click();
  await page.getByRole("button", { name: "Start Discovery" }).click();
  await expect(page).toHaveURL(/\/crm\/candidate-.*\/discovery/);

  const candidateId = page.url().match(/\/crm\/(candidate-[^/]+)\/discovery/)?.[1];
  expect(candidateId).toBeTruthy();
  await page.goto(`/crm/candidates/${candidateId}`);
  await expect(page.getByText("Discovery", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Discovery Started", { exact: true })).toBeVisible();
});

test("referral readiness gates transition and awarded removes active status", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Brand Matching", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark Referral Ready" }).click();
  await expect(page.getByText("Referral", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Referral Ready", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark Awarded" }).click();
  await expect(page.getByText("Awarded", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Candidate Awarded", { exact: true })).toBeVisible();
});
