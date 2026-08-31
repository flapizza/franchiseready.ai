import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset"); expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("consultant manages independent referrals for multiple recommended brands", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig/strategy"); await page.getByRole("link", { name: "Open Referral Studio" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig\/referral$/);
  await expect(page.locator("header").getByRole("heading", { name: "Referral Studio", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended Opportunities" })).toBeVisible();
  const checkboxes = page.getByRole("checkbox"); await expect(checkboxes).toHaveCount(6);
  await page.getByRole("checkbox", { name: /ERA Group/ }).check(); await page.getByRole("checkbox", { name: /Schooley Mitchell/ }).check();
  await expect(page.getByRole("button", { name: "Prepare 2 Referrals" })).toBeVisible(); await page.getByRole("button", { name: "Prepare 2 Referrals" }).click();
  await expect(page.getByText("2 referral packages prepared.")).toBeVisible();
  const prepared = page.getByRole("heading", { name: "Prepared Referrals" }).locator("..");
  await expect(prepared.getByText("ERA Group", { exact: true })).toBeVisible(); await expect(prepared.getByText("Schooley Mitchell", { exact: true })).toBeVisible();

  await prepared.locator("article").filter({ hasText: "ERA Group" }).getByRole("link", { name: "Review Package" }).click();
  await expect(page).toHaveURL(/referralId=referral%3Ajared-wirsig%3Aera-group/);
  await expect(page.getByRole("heading", { name: "ERA Group package" })).toBeVisible();
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();
  await expect(page.getByText("Demo delivery recorded; no external email was sent.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Prepared Referrals" }).locator("..").locator("article").filter({ hasText: "Schooley Mitchell" }).getByRole("link", { name: "Review Package" })).toBeVisible();

  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Referral Package Prepared — ERA Group", { exact: true })).toBeVisible();
  await expect(page.getByText("Referral Package Prepared — Schooley Mitchell", { exact: true })).toBeVisible();
  await expect(page.getByText("Referral Package Approved — ERA Group", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Referral Sent — ERA Group", { exact: true })).toHaveCount(1);
  await expect(page.getByText("2 Referrals · 1 Sent", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates"); await page.getByPlaceholder("Search name, email, or location").fill("Jared Wirsig");
  await expect(page.getByText("2 referrals · 1 sent", { exact: true })).toBeVisible();
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
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig"); await expect(page.getByText("Referral Sent — Summit Franchise Co", { exact: true })).toBeVisible();
});

test("Elena can direct an early referral without changing readiness, AI Match, unresolved evidence, or lifecycle", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await enterDemoAndReset(page); await page.goto("/crm/candidates/elena-rodriguez/strategy");
  const strategyCard = page.locator('article[aria-label$=" recommendation"]').first();
  const brandName = await strategyCard.getByRole("heading").innerText();
  const aiMatch = await strategyCard.getByText(/%/).first().innerText();
  await expect(page.getByLabel("Candidate Readiness").getByText("88%", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Referral Readiness").getByText("Referral Readiness · Needs Attention", { exact: true })).toBeVisible();

  await page.goto("/crm/candidates/elena-rodriguez/referral");
  await expect(page.getByLabel("Referral Readiness").getByText("Referral Readiness: Needs Attention", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: new RegExp(brandName) }).check();
  await page.getByRole("button", { name: "Prepare Referral Anyway" }).click();
  await expect(page.getByText("1 referral package prepared.")).toBeVisible();
  const provenance = page.getByLabel("Consultant-Directed Referral");
  await expect(provenance.getByText(/Earlier Than Recommended/)).toBeVisible();
  await expect(provenance.getByText(/Lifecycle preserved: brand-matching/)).toBeVisible();
  await expect(page.getByRole("heading", { name: `${brandName} package` })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Validated Strengths" }).locator("..").getByText("Discovery buying signal", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "Supporting Evidence" }).locator("..").getByText("Discovery buying signal", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();

  await page.goto("/crm/candidates/elena-rodriguez/strategy");
  await expect(page.locator(`article[aria-label="${brandName} recommendation"]`).getByText(aiMatch, { exact: true })).toBeVisible();
  await expect(page.getByLabel("Candidate Readiness").getByText("88%", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Referral Readiness").getByText("Referral Readiness · Needs Attention", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates/elena-rodriguez");
  await expect(page.getByText("Brand Strategy", { exact: true }).first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("Review Package preserves Sarah Williams ownership and Strategy referral selection", async ({ page }) => {
  await enterDemoAndReset(page); await page.goto("/crm/referrals");
  const sarah = page.locator("article").filter({ hasText: "Sarah Williams" });
  await sarah.getByRole("link", { name: "Review Package" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/sarah-williams\/referral\?referralId=referral%3Asarah-williams%3Aera-group$/);
  await expect(page.locator("header").getByRole("heading", { name: "Sarah Williams" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ERA Group package" })).toBeVisible();
  await expect(page.getByTestId("package-referral:sarah-williams:era-group")).toBeVisible();
  await expect(page.getByText("Elena Rodriguez", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();
  await expect(page.getByText(/Sent to ERA Group on behalf of/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toHaveCount(0);

  await page.goto("/crm/candidates/sarah-williams/strategy");
  const presentation = page.getByLabel("Presentation Set");
  await expect(presentation.getByLabel("ERA Group presentation")).toBeVisible();
  await expect(presentation.getByRole("button", { name: "Refer", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("invalid or cross-candidate package resolution remains in Referral Studio with an explicit not-found state", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/elena-rodriguez/referral?referralId=referral%3Asarah-williams%3Aera-group");
  await expect(page).toHaveURL(/\/crm\/candidates\/elena-rodriguez\/referral/);
  await expect(page.getByRole("heading", { name: "Referral package could not be resolved" })).toBeVisible();
  await expect(page.getByText("does not exist or does not belong to this candidate", { exact: false })).toBeVisible();
  await expect(page).not.toHaveURL(/\/strategy/);
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toHaveCount(0);
});

test("failed approved delivery can retry without a second approval", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/jared-wirsig/referral");
  await page.getByRole("checkbox", { name: /ERA Group/ }).check();
  await page.getByRole("button", { name: "Prepare Referral" }).click();
  const configured = await page.request.post("/crm/test-referral-delivery", { data: { referralId: "referral:jared-wirsig:era-group" } });
  expect(configured.ok()).toBeTruthy();
  await page.getByRole("button", { name: "Approve & Send Referral" }).click();
  await expect(page.getByText("Delivery Failed", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry Delivery" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve & Send Referral" })).toHaveCount(0);
  await page.getByRole("button", { name: "Retry Delivery" }).click();
  await expect(page.getByText("Referral Sent", { exact: true })).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Referral Package Approved — ERA Group", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Referral Delivery Failed — ERA Group", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Referral Sent — ERA Group", { exact: true })).toHaveCount(1);
});

test("Awarded historical referral is read-only and does not trigger delivery", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/robert-king/referral");
  await expect(page.getByText("Completed Referral History", { exact: true })).toBeVisible();
  await expect(page.getByText("Sent", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Approve|Retry Delivery/ })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Completed Referral History", { exact: true })).toBeVisible();
});

test("report attachments are opt-in and consultant intelligence requires an external-sharing decision",async({page})=>{
  await enterDemoAndReset(page);await page.goto("/crm/candidates/jared-wirsig/referral");await page.getByRole("checkbox",{name:/ERA Group/}).check();await page.getByRole("button",{name:"Prepare Referral"}).click();
  const candidate=page.getByRole("checkbox",{name:/Candidate Assessment Report/});const consultant=page.getByRole("checkbox",{name:/Consultant Intelligence Report/});await expect(candidate).not.toBeChecked();await expect(consultant).not.toBeChecked();
  await consultant.check();await expect(page.getByText(/internal consultant intelligence and Discovery guidance/)).toBeVisible();await page.getByRole("button",{name:"Save Attachments"}).click();await expect(page.getByText("Supporting document selections saved.")).toBeVisible();await page.reload();await expect(consultant).toBeChecked();await expect(candidate).not.toBeChecked();
});
