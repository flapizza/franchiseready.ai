import { expect, test, type Page } from "@playwright/test";

async function enter(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  await page.request.post("/crm/test-reset");
}

test("Candidate 360 and full playbook explain high-engagement and converge with Mission Control", async ({ page }) => {
  await enter(page);
  await page.goto("/crm/candidates/sarah-williams");
  const summary = page.getByRole("region", { name: "Send a personal follow-up" });
  await expect(summary).toContainText("Send a personal follow-up");
  await summary.getByRole("link", { name: /Open Full Playbook/ }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/sarah-williams\/playbook$/);
  await expect(page.getByRole("heading", { name: "Send a personal follow-up" })).toBeVisible();
  await expect(page.getByText(/Repeated opens and a tracked-link click/).first()).toBeVisible();
  const upcoming = page.getByRole("heading", { name: "Upcoming steps" }).locator("xpath=parent::section");
  await expect(upcoming).toContainText("Review referral readiness");
  await expect(upcoming.locator("li").first()).toContainText("2");

  await page.goto("/crm");
  const currentAction = page.getByRole("link", { name: "Send a personal follow-up" });
  await expect(currentAction).toBeVisible();
  await expect(currentAction).toHaveAttribute("href", "/crm/candidates/sarah-williams/playbook");
});

test("playbook composes concern, presentation, referral, and calendar strategies from evidence", async ({ page }) => {
  await enter(page);
  await page.goto("/crm/candidates/mike-lavalle/playbook");
  await expect(page.getByRole("heading", { name: "Plan an alternate follow-up" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Clarify the unresolved fit concern" })).toBeVisible();

  await page.goto("/crm/candidates/christine-williams/playbook");
  await expect(page.getByRole("heading", { name: "Clarify the unresolved fit concern" })).toBeVisible();

  await page.goto("/crm/candidates/jared-wirsig/playbook");
  await expect(page.getByText(/Brand Strategy|Brand Presentation/).first()).toBeVisible();
  const addMeeting = page.getByRole("link", { name: /Add Meeting/ });
  await expect(addMeeting).toHaveAttribute("href", "/crm/calendar?candidateId=jared-wirsig");

  await page.goto("/crm/candidates/sarah-williams/playbook");
  await expect(page.getByText("Review referral readiness")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Referral Studio" })).toHaveAttribute("href", "/crm/candidates/sarah-williams/referral");
});

test("consultant decisions and TaskService provenance persist without automatic execution", async ({ page }) => {
  await enter(page);
  await page.goto("/crm/candidates/sarah-williams/playbook");
  await page.getByRole("button", { name: "Create Task" }).click();
  await expect(page.getByRole("status")).toContainText("Task created from the playbook");
  await page.reload();
  await expect(page.getByText("Send a personal follow-up").first()).toBeVisible();
  await page.goto("/crm/tasks");
  await page.getByRole("button", { name: /^Today/ }).click();
  const task = page.locator("article").filter({ hasText: "Send a personal follow-up" });
  await expect(task).toContainText("Engagement Playbook");

  await page.goto("/crm/candidates/mike-lavalle/playbook");
  await page.getByRole("button", { name: "Skip Step" }).click();
  await expect(page.getByRole("status")).toContainText("Step skipped");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Clarify the unresolved fit concern" })).toBeVisible();

  await page.goto("/crm/candidates/jared-wirsig/playbook");
  await page.getByRole("button", { name: "Mark Complete" }).click();
  await expect(page.getByRole("status")).toContainText("Step completed");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Reserve the next candidate conversation" })).toBeVisible();

  await page.goto("/crm/candidates/christine-williams/playbook");
  await page.getByRole("button", { name: "Dismiss Recommendation" }).click();
  await expect(page.getByRole("status")).toContainText("Step dismissed");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Review the evidence-backed strategy" })).toBeVisible();

  await page.goto("/crm/candidates/elena-rodriguez/playbook");
  await page.getByRole("button", { name: "Accept Recommendation" }).click();
  await expect(page.getByRole("status")).toContainText("Nothing was executed automatically");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Respond to the candidate reply" })).toBeVisible();

  await page.request.post("/crm/test-reset");
  await page.goto("/crm/candidates/mike-lavalle/playbook");
  await expect(page.getByRole("heading", { name: "Plan an alternate follow-up" })).toBeVisible();
});

test("recent communication activates cadence-safe Wait Monitor and evidence can re-plan deterministically", async ({ page }) => {
  await enter(page);
  await page.goto("/crm/communications?compose=1&candidate=michael-chen");
  const composer = page.getByRole("dialog", { name: "Compose email" });
  await expect(composer.getByLabel("Candidate")).toHaveValue("michael-chen");
  await composer.getByLabel("Subject").fill("Recent assessment follow-up");
  await composer.getByLabel("Message").fill("Review when convenient; no immediate response is required.");
  await composer.getByRole("button", { name: "Send Email" }).click();
  await expect(composer.getByRole("status")).toContainText("Demo delivery recorded");
  await page.goto("/crm/candidates/michael-chen/playbook");
  await expect(page.getByRole("heading", { name: "Wait for candidate engagement" })).toBeVisible();
  await expect(page.getByText(/cadence guardrail/)).toBeVisible();
  const title = await page.getByRole("heading", { level: 2 }).first().textContent();
  await page.reload();
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(title!);

  await page.request.post("/crm/test-email-engagement", { data: { candidateId: "sarah-williams", messageId: "email-seed-sarah-williams", type: "reply", eventId: "playbook-replan-reply" } });
  await page.goto("/crm/candidates/sarah-williams/playbook");
  await expect(page.getByRole("heading", { name: "Respond to the candidate reply" })).toBeVisible();
});

test("playbook has no horizontal page overflow at supported desktop and laptop sizes", async ({ page }) => {
  await enter(page);
  await page.goto("/crm/candidates/sarah-williams/playbook");
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1600, height: 900 }, { width: 1366, height: 768 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("[data-engagement-playbook]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Send a personal follow-up" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
