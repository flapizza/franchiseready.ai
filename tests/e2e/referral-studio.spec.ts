import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset"); expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("consultant manages independent referrals for multiple recommended brands", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig/strategy"); await page.getByRole("link", { name: "Prepare Referral" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig\/referral$/);
  await expect(page.locator("header").getByRole("heading", { name: "Referral Studio", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended Opportunities" })).toBeVisible();
  const checkboxes = page.getByRole("checkbox"); await expect(checkboxes).toHaveCount(3);
  await page.getByRole("checkbox", { name: /ERA Group/ }).check(); await page.getByRole("checkbox", { name: /Schooley Mitchell/ }).check();
  await expect(page.getByRole("button", { name: "Prepare 2 Referrals" })).toBeVisible(); await page.getByRole("button", { name: "Prepare 2 Referrals" }).click();
  await expect(page.getByText("2 referral packages prepared.")).toBeVisible();
  const prepared = page.getByRole("heading", { name: "Prepared Referrals" }).locator("..");
  await expect(prepared.getByText("ERA Group", { exact: true })).toBeVisible(); await expect(prepared.getByText("Schooley Mitchell", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /ERA Group.*Ready for Review/ }).click();
  await expect(page.getByRole("heading", { name: "ERA Group package" })).toBeVisible();
  await page.getByRole("button", { name: "Approve Referral Package" }).click(); await expect(page.getByText("Referral package approved.")).toBeVisible();
  await page.getByRole("button", { name: "Record Introduction" }).click(); await expect(page.getByText(/Introduction Recorded/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Schooley Mitchell.*Ready for Review/ })).toBeVisible();

  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Referral Package Prepared — ERA Group", { exact: true })).toBeVisible();
  await expect(page.getByText("Referral Package Prepared — Schooley Mitchell", { exact: true })).toBeVisible();
  await expect(page.getByText("Candidate Introduced — ERA Group", { exact: true })).toBeVisible();
  await expect(page.getByText("2 Referrals · 1 Introduced", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates"); await page.getByPlaceholder("Search name, email, or location").fill("Jared Wirsig");
  await expect(page.getByText("2 referrals · 1 introduced", { exact: true })).toBeVisible();
});

test("consultant-selected outside brand gets a generic unscored package", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/jared-wirsig/referral");
  await page.getByRole("button", { name: "Refer to Another Brand" }).click();
  await page.getByLabel("Brand name").fill("Summit Franchise Co"); await page.getByLabel("Referral contact name").fill("Alex Morgan"); await page.getByLabel("Referral contact email").fill("alex@summit.example");
  await page.getByRole("button", { name: "Prepare Consultant-Selected Referral" }).click();
  await expect(page.getByRole("heading", { name: "Summit Franchise Co package" })).toBeVisible();
  await expect(page.getByText("Consultant-Selected Referral", { exact: true })).toBeVisible();
  await expect(page.getByText("FranGroove has not evaluated or scored this brand match.")).toBeVisible();
  await expect(page.getByText("Candidate Preferred Investment Range", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Approve Referral Package" }).click(); await page.getByRole("button", { name: "Record Introduction" }).click();
  await expect(page.getByText(/Introduction Recorded/).first()).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig"); await expect(page.getByText("Candidate Introduced — Summit Franchise Co", { exact: true })).toBeVisible();
});

test("Referral Studio blocks a candidate who has not passed the canonical gate", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/elena-rodriguez/referral");
  await expect(page.getByText("Referral Gate · Not Yet Ready", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Referral Studio is blocked/ })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0); await expect(page.getByRole("button", { name: "Approve Referral Package" })).toHaveCount(0);
});
