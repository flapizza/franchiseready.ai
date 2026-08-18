import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset"); expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("consultant builds an ordered multi-brand strategy and hands referral intent to Referral Studio", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/strategy"); await page.getByRole("link", { name: "Review Strategy" }).first().click();
  await expect(page.getByRole("heading", { name: /Brand Strategy for/ })).toBeVisible();
  const recommendations = page.locator('article[aria-label$=" recommendation"]'); await expect(recommendations).toHaveCount(3);
  const first = recommendations.nth(0); const second = recommendations.nth(1);
  const firstName = await first.getByRole("heading").innerText(); const secondName = await second.getByRole("heading").innerText();
  const firstScore = await first.getByText(/%/).first().innerText(); const secondScore = await second.getByText(/%/).first().innerText();
  await first.getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.locator(`article[aria-label="${secondName} recommendation"]`).getByRole("button", { name: "Add to Presentation Set" }).click();
  const presentationSet = page.getByLabel("Presentation Set");
  await expect(presentationSet.locator('article[aria-label$=" presentation"]')).toHaveCount(2);
  await presentationSet.getByRole("button", { name: `Move ${secondName} up` }).click();
  await expect(presentationSet.locator('article[aria-label$=" presentation"]').first()).toContainText(secondName);
  await expect(page.locator(`article[aria-label="${firstName} recommendation"]`).getByText(firstScore, { exact: true })).toBeVisible();
  await expect(page.locator(`article[aria-label="${secondName} recommendation"]`).getByText(secondScore, { exact: true })).toBeVisible();

  await page.getByLabel(`${firstName} Candidate Reaction`).selectOption("strong-interest");
  await page.getByLabel(`${firstName} Consultant Note`).fill("Likes recurring revenue; wants validation on owner hours.");
  await page.getByLabel(`${firstName} presentation`).getByRole("button", { name: "Save Candidate Response" }).click();
  await page.getByLabel(`${secondName} Candidate Reaction`).selectOption("not-interested");
  await page.getByLabel(`${secondName} presentation`).getByRole("button", { name: "Save Candidate Response" }).click();
  await expect(page.locator(`article[aria-label="${firstName} recommendation"]`).getByText(firstScore, { exact: true })).toBeVisible();
  await expect(page.locator(`article[aria-label="${secondName} recommendation"]`).getByText(secondScore, { exact: true })).toBeVisible();

  await page.getByLabel(`${firstName} presentation`).getByRole("button", { name: "Refer", exact: true }).click();
  await page.getByLabel(`${secondName} presentation`).getByRole("button", { name: "Refer", exact: true }).click();
  await expect(page.getByText("Ready for Referral", { exact: true }).first()).toBeVisible();
  await page.getByRole("link", { name: "Open Referral Studio" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await expect(page.getByRole("checkbox", { name: new RegExp(firstName) })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: new RegExp(secondName) })).toBeVisible();
});

test("advisory referral readiness still permits presentation and candidate response", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/elena-rodriguez/strategy");
  const card = page.locator('article[aria-label$=" recommendation"]').first(); const name = await card.getByRole("heading").innerText();
  await card.getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByLabel(`${name} Candidate Reaction`).selectOption("interested");
  await page.getByLabel(`${name} presentation`).getByRole("button", { name: "Save Candidate Response" }).click();
  await expect(page.getByLabel("Referral Readiness").getByText("Referral Readiness · Needs Attention", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Prepare Referral Anyway" })).toBeVisible();
  await page.goto("/crm/candidates/elena-rodriguez/referral"); await expect(page.getByLabel("Referral Readiness").getByText("Referral Readiness: Needs Attention", { exact: true })).toBeVisible();
});

test("completed strategy renders retained historical decisions", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/robert-king/strategy");
  await expect(page.getByRole("heading", { name: "Completed Strategy History" })).toBeVisible();
  await expect(page.getByLabel("Presentation Set").locator('article[aria-label$=" presentation"]')).not.toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add to Presentation Set" })).toHaveCount(0);
});
