import { expect, test } from "@playwright/test";

const apiUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
const email = required("PACK2A_TEST_EMAIL");
const password = required("PACK2A_TEST_PASSWORD");

test.beforeAll(async () => {
  const response = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { display_name: "Pack 2A Consultant" } }),
  });
  expect(response.status, "local production test user should be created").toBe(200);
});

test("production Contacts persist one permanent identity through candidate promotion", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/crm");
  await expect(page).toHaveURL(/\/onboarding$/);

  await page.getByLabel("Organization name").fill("Pack 2A Local Verification");
  await page.getByLabel("Your display name").fill("Pack 2A Consultant");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page).toHaveURL(/\/crm$/);

  await page.getByRole("navigation").getByRole("link", { name: "Contacts" }).click();
  await expect(page.locator("main").getByRole("heading", { name: "Contacts", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Add Contact" }).first().click();
  const add = page.getByRole("form", { name: "Add contact" });
  await add.getByLabel("First name").fill("Grace");
  await add.getByLabel("Last name").fill("Hopper");
  await add.getByLabel("Primary email").fill("  PACK2A.GRACE@EXAMPLE.TEST  ");
  await add.getByLabel("Primary phone").fill("+1 (555) 010-4242");
  await add.getByLabel("City").fill("Arlington");
  await add.getByLabel("State / province").fill("VA");
  await add.getByLabel("Postal code").fill("22201");
  await add.getByLabel("Source").fill("Pack 2A Browser Verification");
  await add.getByRole("button", { name: "Add Contact" }).click();
  await expect(page.getByRole("heading", { name: "Contact created" })).toBeVisible();
  await page.getByRole("link", { name: "Open Contact Detail" }).click();
  await expect(page).toHaveURL(/\/crm\/contacts\/contact_/);
  const contactUrl = page.url();
  await expect(page.getByRole("heading", { name: "Grace Hopper" })).toBeVisible();

  await page.goto("/crm/contacts?q=pack2a.grace%40example.test");
  await expect(page.getByText("pack2a.grace@example.test", { exact: true }).first()).toBeVisible();
  await page.goto(contactUrl);
  await page.getByRole("link", { name: "Edit Contact" }).click();
  const edit = page.getByRole("form", { name: "Edit contact" });
  await edit.getByLabel("Preferred name").fill("Amazing Grace");
  await edit.getByLabel("Title / occupation").fill("Computer Scientist");
  await edit.getByRole("button", { name: "Save Changes" }).click();
  await expect(edit.getByRole("status")).toContainText("Contact updated");
  await page.reload();
  await expect(edit.getByLabel("Preferred name")).toHaveValue("Amazing Grace");
  await page.goto(contactUrl);
  await expect(page.getByRole("heading", { name: "Amazing Grace Hopper" })).toBeVisible();

  await page.getByRole("link", { name: "Add Contact" }).first().click();
  const duplicate = page.getByRole("form", { name: "Add contact" });
  await duplicate.getByLabel("First name").fill("Different");
  await duplicate.getByLabel("Last name").fill("Person");
  await duplicate.getByLabel("Primary email").fill("pack2a.grace@example.test");
  await duplicate.getByRole("button", { name: "Add Contact" }).click();
  await expect(duplicate.getByRole("alert")).toContainText("already exists");

  await page.goto(contactUrl);
  await page.getByRole("button", { name: "Promote to Candidate" }).click();
  const candidateLink = page.getByRole("link", { name: "Open Candidate 360" });
  await expect(candidateLink).toBeVisible();
  await candidateLink.click();
  await expect(page).toHaveURL(/\/crm\/candidates\/cand_/);
  await expect(page.getByRole("heading", { name: "Grace Hopper" })).toBeVisible();

  await page.goto(contactUrl);
  await expect(page.getByRole("link", { name: "Open Candidate 360" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Promote to Candidate" })).toHaveCount(0);
});

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the local production Contacts test.`);
  return value;
}
