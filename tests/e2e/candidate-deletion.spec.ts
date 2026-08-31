import { expect, test } from "@playwright/test";

test("conference demo protects newly created candidates from destructive deletion", async ({ page }) => {
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

  await expect(page.getByRole("heading", { name: "Deletion Smoke" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Candidate" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Confirm Delete" })).toHaveCount(0);

  await page.goto("/crm/candidates");
  await expect(page.getByText("Deletion Smoke", { exact: true })).toBeVisible();
});
