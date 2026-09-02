import { expect, test, type Page } from "@playwright/test";

test.setTimeout(180_000);

const apiUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
const email = required("PACK2A_TEST_EMAIL");
const password = required("PACK2A_TEST_PASSWORD");
const csv = "First Name,Last Name,Email,Company,Source\nGrace,Hopper,PACK3A.GRACE@EXAMPLE.TEST,Compilers Inc.,Legacy Database";

test.beforeAll(async () => {
  expect(process.env.PERSISTENCE_MODE).toBe("supabase");
  const response = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { display_name: "Pack 3A Consultant" } }),
  });
  expect(response.status, "local production test user should be created").toBe(200);
});

test("fresh production user bootstraps then persists an imported organized Contact through Candidate promotion", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect((await page.context().cookies()).some((cookie) => cookie.name.includes("auth-token"))).toBeTruthy();

  const bootstrapResponse = await page.goto("/crm");
  expect(bootstrapResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: "Create your organization" })).toBeVisible();

  await page.getByLabel("Organization name").fill("Pack 3A Local Verification");
  await page.getByLabel("Your display name").fill("Pack 3A Consultant");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(page).toHaveURL(/\/crm$/);

  await page.getByRole("navigation").getByRole("link", { name: "Contacts" }).click();
  await expect(page.locator("main").getByRole("heading", { name: "Contacts", exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("link", { name: "Lists & Tags" }).click();
  await page.getByLabel("New list name").fill("Legacy Newsletter");
  await page.getByRole("button", { name: "Create List" }).click();
  await expect(page.getByRole("link", { name: "Legacy Newsletter" })).toBeVisible();
  await page.getByLabel("New tag name").fill("Mailchimp Import");
  await page.getByRole("button", { name: "Create Tag" }).click();
  await expect(page.getByRole("link", { name: "Mailchimp Import" })).toBeVisible();

  await importCsv(page, true);
  await expect(page.getByText("Created").locator("..")).toContainText("1");
  await expect(page.getByText("Matched").locator("..")).toContainText("0");
  await page.getByRole("link", { name: "View Contacts" }).click();
  await page.getByRole("link", { name: "Grace Hopper" }).first().click();
  await expect(page).toHaveURL(/\/crm\/contacts\/contact_/);
  const contactUrl = page.url();
  await expect(page.getByRole("heading", { name: "Grace Hopper" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Mailchimp Import/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Legacy Newsletter/ })).toBeVisible();
  await expect(page.getByText("unknown", { exact: true }).first()).toBeVisible();

  await importCsv(page, false);
  await expect(page.getByText("Created").locator("..")).toContainText("0");
  await expect(page.getByText("Matched").locator("..")).toContainText("1");

  await page.goto(contactUrl);
  await page.getByRole("button", { name: "Promote to Candidate" }).click();
  const candidateLink = page.getByRole("link", { name: "Open Candidate 360" });
  await expect(candidateLink).toBeVisible({ timeout: 20_000 });
  await candidateLink.click();
  await expect(page).toHaveURL(/\/crm\/candidates\/cand_/);
  await expect(page.getByRole("heading", { name: "Grace Hopper" })).toBeVisible();

});

async function importCsv(page: Page, organize: boolean) {
  await page.goto("/crm/contacts/import");
  const fileInput = page.getByLabel("CSV file");
  await expect(fileInput).toBeVisible();
  await expect.poll(() => fileInput.evaluate((element) => Object.keys(element).some((key) => key.startsWith("__reactProps")))).toBe(true);
  await fileInput.setInputFiles({ name: "legacy.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByRole("heading", { name: "Map fields" })).toBeVisible();
  await page.getByRole("button", { name: "Review import" }).click();
  if (organize) {
    await page.getByLabel("Mailchimp Import").check();
    await page.getByLabel("Add to list").selectOption({ label: "Legacy Newsletter" });
  }
  await page.getByRole("button", { name: "Import Contacts" }).click();
  await expect(page.getByRole("heading", { name: "Import results" })).toBeVisible();
}

function adminHeaders() {
  return { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" };
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the local production Contacts test.`);
  return value;
}
