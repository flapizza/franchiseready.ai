import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

async function completeCurrentAssessment(page: Page, email: string) {
  await page.getByLabel("First name").fill("Conference");
  await page.getByLabel("Last name").fill("Journey");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mobile phone").fill("704-555-0132");
  await page.getByLabel("Street address").fill("100 Conference Way");
  await page.getByLabel("City").fill("Charlotte");
  await page.getByLabel("State/Province").fill("NC");
  await page.getByLabel("ZIP/Postal code").fill("28202");
  await page.getByLabel("Current occupation/title").fill("Operations Executive");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("I understand and wish to continue.").check();
  await page.getByRole("button", { name: "Begin assessment" }).click();
  for (let section = 1; section <= 6; section += 1) {
    const groups = page.locator("fieldset");
    for (let index = 0; index < await groups.count(); index += 1) {
      const group = groups.nth(index);
      if (!(await group.locator("input:checked").count())) await group.locator("input").first().check();
    }
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByLabel("I don't have a major concern right now").check();
  await page.getByRole("button", { name: "Build my profile" }).click();
  await expect(page.getByRole("heading", { name: "Your Franchise Ownership Profile" })).toBeVisible({ timeout: 15_000 });
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
  await expect(page).toHaveURL(/\/crm\/candidates\/candidate-/);
  const candidateUrl = page.url();
  await expect(page.getByRole("heading", { name: "Conference Journey" })).toBeVisible();
  await expect(page.getByText("New Candidate", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Send Assessment" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Assessment Invitation Sent$/ })).toBeVisible();
  await page.getByRole("link", { name: "Open Assessment" }).click();
  await expect(page).toHaveURL(/\/assessment\/start\?invitation=/);
  await completeCurrentAssessment(page, email);
  await page.goto(candidateUrl);
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

test("awarded candidate is coherent and historical referral remains viewable", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/robert-king");
  await expect(page.getByText("Awarded", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Placement awarded. Referral history is complete.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Referral Ready" })).toHaveCount(0);
  await page.getByRole("link", { name: "View Referral History" }).first().click();
  await expect(page.getByRole("heading", { name: "Robert King" })).toBeVisible();
  await expect(page.getByText("Completed Referral History", { exact: true })).toBeVisible();
  await expect(page.getByText("Introduced", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Referral Studio is blocked/)).toHaveCount(0);
});
