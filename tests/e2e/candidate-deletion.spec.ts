import { expect, test } from "@playwright/test";

test("confirmed candidate deletion removes a newly created candidate from CRM", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();

  await page.goto("/crm/candidates/new");
  await page.getByLabel("First Name").fill("Deletion");
  await page.getByLabel("Last Name").fill("Smoke");
  await page.getByLabel("Email").fill("deletion.smoke@example.test");
  await page.getByRole("button", { name: /Create Candidate/i }).click();
  await page.getByRole("link", { name: "Open candidate record" }).click();

  await page.getByRole("button", { name: "Delete Candidate" }).click();
  await expect(page.getByRole("button", { name: "Confirm Delete" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm Delete" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/[^/]+$/);

  await page.getByLabel("I understand this action cannot be undone.").check();
  await page.getByRole("button", { name: "Confirm Delete" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates$/);
  await expect(page.getByText("Deletion Smoke", { exact: true })).toHaveCount(0);
});
