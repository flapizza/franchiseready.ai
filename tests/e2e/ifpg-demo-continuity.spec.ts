import { expect, test, type Page } from "@playwright/test";

async function enterAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const reset = await page.request.post("/crm/test-reset");
  expect(reset.ok(), `${reset.status()} ${await reset.text()}`).toBeTruthy();
}

test("IFPG primary journey preserves Jared and brand evidence through consultant-controlled handoff", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await enterAndReset(page);

  const action = page.getByRole("heading", { name: "AI Recommended Actions" }).locator("xpath=ancestor::section").locator("article").filter({ hasText: "Jared Wirsig" });
  await expect(action).toContainText("Presentation");
  await action.getByRole("link", { name: "Open Candidate Journey" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig$/);
  await expect(page.getByRole("heading", { name: "Jared Wirsig" })).toBeVisible();
  await expect(page.getByText("Present Brand Strategy", { exact: true }).first()).toBeVisible();

  await page.getByRole("link", { name: "Open Full Playbook" }).click();
  await expect(page.getByText(/Jared Wirsig ·/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why this plan" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Jared Wirsig" }).click();
  await page.getByRole("link", { name: "Review Brand Strategy" }).click();

  const era = page.locator('article[aria-label="ERA Group recommendation"]');
  const actionCoach = page.locator('article[aria-label="ActionCOACH recommendation"]');
  await expect(era).toContainText("Why"); await expect(actionCoach).toContainText("Why");
  expect(await era.locator("p.mt-4").first().textContent()).not.toBe(await actionCoach.locator("p.mt-4").first().textContent());
  await era.getByRole("button", { name: "Add to Presentation Set" }).click();
  await actionCoach.getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page.getByText("Why FranGroove Matched This Brand", { exact: true })).toBeVisible();
  await page.getByLabel("Strong Interest").check();
  await page.getByLabel("Consultant Note").fill("Validate the candidate's expectations for business development and owner involvement.");
  await page.getByRole("button", { name: "Save & Next Brand" }).click();
  await expect(page).toHaveURL(/brandId=actioncoach$/);
  const interested = page.getByLabel("Interested", { exact: true });
  await interested.check(); await expect(interested).toBeChecked();
  const completePresentation = page.getByRole("button", { name: "Complete Presentation" });
  await completePresentation.click();
  await expect(page.getByText("Brand Presentation Complete", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByLabel("ERA Group presentation summary").getByRole("button", { name: "Refer", exact: true }).click();
  await page.getByRole("link", { name: "Open Referral Studio" }).click();
  await expect(page.getByRole("checkbox", { name: /ERA Group/ })).toBeVisible();
  await page.getByRole("checkbox", { name: /ERA Group/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();

  const handoff = page.getByRole("article", { name: /Candidate Handoff Package for Jared Wirsig and ERA Group/ });
  await expect(handoff.getByRole("heading", { name: "Why This Brand" })).toBeVisible();
  await expect(handoff.getByRole("heading", { name: "Areas to Validate" })).toBeVisible();
  await page.getByRole("link", { name: "Draft Introduction Email" }).click();
  await expect(page.getByLabel("Handoff draft context")).toContainText("Jared Wirsig → ERA Group");
  const composer = page.getByRole("dialog", { name: "Compose email" });
  await expect(composer.getByRole("combobox", { name: "Candidate" })).toHaveValue("jared-wirsig");
  await expect(composer).toBeVisible();
  await expect(page.getByText("Email accepted by Gmail.")).toHaveCount(0);
  await page.getByRole("link", { name: "Return to Candidate Handoff Package" }).click();
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("IFPG reset restores the complete mutable journey and remains repeatable", async ({ page }) => {
  await enterAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig/referral");
  await page.getByRole("checkbox", { name: /ERA Group/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
  await page.getByRole("button", { name: "Edit Introduction" }).click();
  await page.getByLabel("Private consultant note").fill("Temporary conference rehearsal note.");
  await page.getByRole("button", { name: "Save Introduction" }).click();
  await page.getByRole("button", { name: "Mark Package Ready" }).click();
  await expect(page.getByRole("button", { name: "Handoff Ready" })).toBeDisabled();
  await page.goto("/crm/candidates/jared-wirsig/strategy");
  await page.locator('article[aria-label="ERA Group recommendation"]').getByRole("button", { name: "Add to Presentation Set" }).click();

  const reset = await page.request.post("/crm/test-reset"); expect(reset.ok()).toBeTruthy();
  await page.goto("/crm/candidates/jared-wirsig/strategy");
  await expect(page.getByLabel("Presentation Set")).toContainText("Select one or more recommendations");
  await page.goto("/crm/candidates/jared-wirsig/referral");
  await expect(page.getByRole("heading", { name: "Prepared Referrals" })).toHaveCount(0);
  await page.getByRole("checkbox", { name: /ERA Group/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
  await expect(page.getByRole("article", { name: /Candidate Handoff Package for Jared Wirsig and ERA Group/ })).toBeVisible();
  await expect(page.getByText("Temporary conference rehearsal note.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mark Package Ready" })).toBeEnabled();
});

test("IFPG Mission Control opens the deterministic John Smith candidate story", async ({ page }) => {
  await enterAndReset(page);
  const spotlight = page.getByText("IFPG Candidate Story").locator("xpath=ancestor::section");
  await expect(spotlight.getByRole("heading", { name: "John Smith" })).toBeVisible();
  await spotlight.getByRole("link", { name: "Open John Smith Candidate 360" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/candidate-demo$/);
  const journey = page.getByRole("navigation", { name: "Candidate story" });
  await expect(journey.getByRole("link", { name: "1. Assessment Intelligence" })).toHaveAttribute("href", "/crm/candidates/candidate-demo#assessment-intelligence");
  await expect(journey.getByRole("link", { name: "2. Discovery" })).toHaveAttribute("href", "/crm/candidate-demo/discovery");
  await expect(journey.getByRole("link", { name: "3. Brand Strategy" })).toHaveAttribute("href", "/crm/candidates/candidate-demo/strategy");
  await expect(journey.getByRole("link", { name: "4. Brand Presentation" })).toHaveAttribute("href", "/crm/candidates/candidate-demo/strategy/presentation");
  await expect(journey.getByRole("link", { name: "5. Referral Studio" })).toHaveAttribute("href", "/crm/candidates/candidate-demo/referral");
  await journey.getByRole("link", { name: "2. Discovery" }).click();
  await expect(page.getByRole("heading", { name: "John Smith", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "John Smith Candidate 360" })).toHaveAttribute("href", "/crm/candidates/candidate-demo");
  await page.getByRole("button", { name: "Start Discovery" }).click();
  await page.getByRole("button", { name: "Mark next best question asked" }).click();
  await page.getByLabel("Consultant meeting notes").fill("Temporary rehearsal note that must not survive reset.");
  await page.getByRole("button", { name: "End Discovery" }).click();
  await page.getByRole("button", { name: "Begin Validation" }).click();

  await page.goto("/crm/candidates/candidate-demo");
  await page.getByRole("navigation", { name: "Candidate story" }).getByRole("link", { name: "3. Brand Strategy" }).click();
  await expect(page.getByRole("heading", { name: "Brand Strategy for John Smith" })).toBeVisible();
  await expect(page.locator('article[aria-label$=" recommendation"]')).toHaveCount(6);
  await page.locator('article[aria-label="ERA Group recommendation"]').getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page.getByText("Brand Presentation · John Smith", { exact: true })).toBeVisible();
  await page.getByLabel("Strong Interest").check();
  await page.getByLabel("Consultant Note").fill("Temporary John presentation reaction.");
  await page.getByRole("button", { name: "Complete Presentation" }).click();
  await expect(page.getByText("Brand Presentation Complete", { exact: true })).toBeVisible();
  await page.getByLabel("ERA Group presentation summary").getByRole("button", { name: "Refer", exact: true }).click();
  await page.getByRole("link", { name: "Open Referral Studio" }).click();
  await page.getByRole("checkbox", { name: /ERA Group/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Demo delivery recorded; no external email was sent.")).toBeVisible();

  const resetResult = await page.evaluate(async () => {
    sessionStorage.setItem("frangroove.conference-assessment.v1", "stale rehearsal draft");
    const response = await fetch("/crm/test-reset", { method: "POST" });
    return { ok: response.ok, body: await response.json() };
  });
  expect(resetResult).toEqual({ ok: true, body: { status: "reset", baseline: "ifpg-conference-demo-v1" } });
  await page.goto("/crm");
  await expect(page.getByText("IFPG Candidate Story").locator("xpath=ancestor::section").getByRole("heading", { name: "John Smith" })).toBeVisible();
  await page.goto("/crm/candidates/candidate-demo");
  await expect(page.getByText("Discovery", { exact: true }).first()).toBeVisible();
  await page.goto("/crm/candidates/candidate-demo/strategy");
  await expect(page.getByLabel("Presentation Set")).toContainText("Select one or more recommendations");
  await page.goto("/crm/candidates/candidate-demo/referral");
  await expect(page.getByRole("heading", { name: "Prepared Referrals" })).toHaveCount(0);
  await page.goto("/crm/candidate-demo/discovery");
  await expect(page.getByText("Temporary rehearsal note that must not survive reset.")).toHaveCount(0);
});
