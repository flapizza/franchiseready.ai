import { expect, test } from "@playwright/test";

test("authenticated shell signs out and protects the CRM session", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);

  const signOut = page.getByRole("button", { name: "Sign Out" });
  await expect(signOut).toBeVisible();
  await expect(signOut).toBeEnabled();
  await signOut.click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto("/crm");
  await expect(page).toHaveURL(/\/login\?next=%2Fcrm$/);
});
