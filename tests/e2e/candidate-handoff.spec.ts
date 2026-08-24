import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndPrepare(page: Page, brand = "ERA Group") {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const reset = await page.request.post("/crm/test-reset"); expect(reset.ok()).toBeTruthy();
  await page.goto("/crm/candidates/jared-wirsig/referral");
  await page.getByRole("checkbox", { name: new RegExp(brand) }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
}

test("Candidate Handoff Package is evidence-based, consultant-owned, and print-ready", async ({ page }) => {
  await enterDemoAndPrepare(page);
  const handoffDocument = page.getByRole("article", { name: /Candidate Handoff Package for Jared Wirsig and ERA Group/ });
  await expect(handoffDocument.getByRole("heading", { name: "Executive Overview" })).toBeVisible();
  await expect(handoffDocument.getByText("Candidate-reported liquid capital", { exact: true })).toBeVisible();
  await expect(handoffDocument.getByText("Candidate-supplied information; not independently verified by FranGroove.")).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "What the Candidate Is Looking For" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Discovery Highlights" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Why This Brand" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Candidate Strengths" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Areas to Validate" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Candidate Questions" })).toBeVisible();
  await expect(handoffDocument.getByRole("heading", { name: "Suggested Focus for the First Conversation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toBeVisible();

  await page.getByRole("button", { name: "Edit Introduction" }).click();
  await page.getByLabel("Private consultant note").fill("Please focus the first call on the executive ownership model.");
  await page.getByRole("button", { name: "Save Introduction" }).click();
  await page.reload();
  await expect(handoffDocument.getByRole("heading", { name: "Franchisor-facing Consultant Note" })).toBeVisible();
  await expect(handoffDocument.getByText("Please focus the first call on the executive ownership model.")).toBeVisible();
  await page.getByRole("button", { name: "Mark Package Ready" }).click();
  await expect(page.getByRole("button", { name: "Handoff Ready" })).toBeDisabled();

  await page.emulateMedia({ media: "print" });
  const media = await page.evaluate(() => ({ navigation: getComputedStyle(document.querySelector("nav")!).visibility,
    handoff: getComputedStyle(document.querySelector(".handoff-document")!).visibility }));
  expect(media.navigation).toBe("hidden"); expect(media.handoff).toBe("visible");
});

test("handoff rationale changes by brand and introduction opens the existing unsent composer", async ({ page }) => {
  await enterDemoAndPrepare(page, "ERA Group");
  const eraRationale = await page.getByRole("article", { name: /Candidate Handoff Package/ }).getByRole("heading", { name: "Why This Brand" }).locator("..").textContent();
  await page.goto("/crm/candidates/jared-wirsig/referral");
  await page.getByRole("checkbox", { name: /ActionCOACH/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
  await page.getByRole("heading", { name: "Prepared Referrals" }).locator("..").locator("article").filter({ hasText: "ActionCOACH" }).getByRole("link", { name: "Review Package" }).click();
  const actionRationale = await page.getByRole("article", { name: /Candidate Handoff Package/ }).getByRole("heading", { name: "Why This Brand" }).locator("..").textContent();
  expect(actionRationale).not.toBe(eraRationale);
  await page.getByRole("link", { name: "Draft Introduction Email" }).click();
  await expect(page).toHaveURL(/\/crm\/communications\?compose=1/);
  await expect(page.getByRole("dialog", { name: "Compose email" })).toBeVisible();
  await expect(page.getByLabel("Subject")).toHaveValue(/Introduction: Jared Wirsig/);
  await expect(page.getByText("Draft only until you choose Send Email.", { exact: false })).toBeVisible();
  await expect(page.getByText("Email accepted by Gmail.")).toHaveCount(0);
});
