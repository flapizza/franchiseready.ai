import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset"); expect(response.ok()).toBeTruthy();
}

async function buildOrderedSet(page: Page) {
  await page.goto("/crm/candidates/jared-wirsig/strategy");
  const recommendations = page.locator('article[aria-label$=" recommendation"]');
  const firstName = await recommendations.nth(0).getByRole("heading").innerText();
  const secondName = await recommendations.nth(1).getByRole("heading").innerText();
  const scores = [await recommendations.nth(0).getByText(/%/).first().innerText(), await recommendations.nth(1).getByText(/%/).first().innerText()];
  await recommendations.nth(0).getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.locator(`article[aria-label="${secondName} recommendation"]`).getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByLabel("Presentation Set").getByRole("button", { name: `Move ${secondName} up` }).click();
  return { firstName, secondName, scores };
}

test("Brand Presentation follows consultant order through summary and referral handoff", async ({ page }) => {
  await enterDemoAndReset(page);
  const { firstName, secondName, scores } = await buildOrderedSet(page);
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page).toHaveURL(/\/strategy\/presentation\?brandId=/);
  await expect(page.getByRole("heading", { name: secondName })).toBeVisible();
  await expect(page.getByText("Presentation Order #1 · AI Rank #2", { exact: false })).toBeVisible();
  await expect(page.getByText("30-Second Overview", { exact: true })).toBeVisible();
  await expect(page.getByText("Why FranGroove Matched This Brand", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to Emphasize" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Questions to Ask" })).toBeVisible();
  await page.getByLabel("Strong Interest").check();
  await page.getByLabel("Consultant Note").fill("Loves the B2B model but wants to validate outbound sales expectations.");
  await page.getByRole("button", { name: "Save & Next Brand" }).click();
  await expect(page.getByRole("heading", { name: firstName })).toBeVisible();
  await page.getByLabel("Interested", { exact: true }).check();
  await page.getByRole("button", { name: "Complete Presentation" }).click();
  await expect(page.getByText("Brand Presentation Complete", { exact: true })).toBeVisible();
  await expect(page.getByLabel(`${secondName} presentation summary`).getByText("Reaction: Strong Interest", { exact: true })).toBeVisible();
  await page.getByLabel(`${secondName} presentation summary`).getByRole("button", { name: "Refer", exact: true }).click();
  await expect(page.getByRole("link", { name: "Open Referral Studio" })).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig/strategy");
  await expect(page.locator(`article[aria-label="${firstName} recommendation"]`).getByText(scores[0], { exact: true })).toBeVisible();
  await expect(page.locator(`article[aria-label="${secondName} recommendation"]`).getByText(scores[1], { exact: true })).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig/strategy/presentation?summary=1");
  await page.getByRole("link", { name: "Open Referral Studio" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByRole("checkbox", { name: new RegExp(secondName) })).toBeVisible();
});

test("presentation reaction and note persist after navigating away", async ({ page }) => {
  await enterDemoAndReset(page); await buildOrderedSet(page);
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page).toHaveURL(/\/strategy\/presentation\?brandId=/);
  const brandName = await page.locator("main header h1").innerText();
  await page.getByLabel("Neutral").check(); await page.getByLabel("Consultant Note").fill("Candidate wants a follow-up discussion.");
  await page.getByRole("button", { name: "Save & Next Brand" }).click();
  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Presentation In Progress", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Continue Brand Presentation" }).click();
  await page.getByRole("link", { name: "Previous Brand" }).click();
  await expect(page.getByRole("heading", { name: brandName })).toBeVisible();
  await expect(page.getByLabel("Neutral")).toBeChecked();
  await expect(page.getByLabel("Consultant Note")).toHaveValue("Candidate wants a follow-up discussion.");
});

test("historical presentation opens retained history without restarting", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/robert-king/strategy");
  await page.getByRole("link", { name: "Review Brand Presentation" }).click();
  await expect(page.getByText("Historical Brand Presentation", { exact: true })).toBeVisible();
  await expect(page.getByText(/Presented: \d+ brands/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Brand Presentation" })).toHaveCount(0);
});

test("candidate-specific concern questions are conversational and preserve canonical questions", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/candidates/elena-rodriguez/strategy");
  await page.getByLabel("ERA Group recommendation").getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  const questions = page.getByRole("heading", { name: "Questions to Ask" }).locator("..");
  await expect(questions.getByText("How comfortable are you developing executive relationships?", { exact: false })).toBeVisible();
  await expect(questions.getByText("How well does this opportunity fit the lifestyle you're looking for?", { exact: false })).toBeVisible();
  await expect(questions.getByText("Discovery", { exact: true })).toBeVisible();
  await expect(page.getByText("How does compare lifestyle alignment affect your interest in this opportunity?", { exact: true })).toHaveCount(0);
});
