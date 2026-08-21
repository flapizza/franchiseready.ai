import { expect, test, type Page } from "@playwright/test";

async function enter(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  await page.request.post("/crm/test-reset");
  await page.goto("/crm/communications");
}

test("communications center scans seeded engagement and filters deterministically", async ({ page }) => {
  await enter(page);
  await expect(page.getByRole("heading", { name: "Unified Communications" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Communications" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation").locator('[aria-current="page"]')).toHaveCount(1);
  await expect(page.locator("[data-message-row]")).toHaveCount(4);

  for (const [filter, candidate] of [["Replied", "Elena Rodriguez"], ["Opened", "Sarah Williams"], ["Clicked", "Sarah Williams"], ["No Engagement", "Mike Lavalle"], ["Failed Delivery", "Robert King"], ["Needs Follow-Up", "Sarah Williams"]] as const) {
    await page.getByRole("link", { name: new RegExp(`^${filter}`) }).click();
    await expect(page.locator("[data-message-row]").filter({ hasText: candidate }).first()).toBeVisible();
  }

  await page.getByLabel("Search communications").fill("financing");
  await page.getByLabel("Search communications").press("Enter");
  await expect(page.locator("[data-message-row]")).toHaveCount(1);
  await expect(page.locator("[data-message-row]")).toContainText("Elena Rodriguez");
});

test("message detail preserves candidate context, counts, links, compose, and task handoff", async ({ page }) => {
  await enter(page);
  await page.locator('[data-message-row="email-seed-sarah-williams"]').click();
  const detail = page.locator('[data-message-detail="email-seed-sarah-williams"]');
  await expect(detail).toContainText("Opened");
  await expect(detail).toContainText("3×");
  await expect(detail.getByLabel("Tracked links")).toContainText("ERA Group website");
  await expect(detail.getByLabel("Tracked links")).toContainText("1 click");
  await expect(detail.getByRole("link", { name: "Sarah Williams" })).toHaveAttribute("href", "/crm/candidates/sarah-williams");

  await detail.getByRole("button", { name: "Create Task" }).click();
  await expect(detail.getByRole("status")).toContainText("Follow-up task created");
  await page.goto("/crm/tasks");
  await page.getByRole("button", { name: /^Upcoming/ }).click();
  await expect(page.getByText("Follow up: ERA Group information and next steps", { exact: true })).toBeVisible();

  await page.goto("/crm/communications");
  await page.getByRole("button", { name: "Compose Email" }).click();
  const composer = page.getByRole("dialog", { name: "Compose email" });
  await composer.getByLabel("Candidate").selectOption("mike-lavalle");
  await composer.getByLabel("Subject").fill("Communications workspace follow-up");
  await composer.getByLabel("Message").fill("A deliberate consultant-controlled follow-up.");
  await composer.getByRole("button", { name: "Send Email" }).click();
  await expect(composer.getByRole("status")).toContainText("Demo delivery recorded");
  await page.reload();
  await expect(page.locator("[data-message-row]").filter({ hasText: "Communications workspace follow-up" })).toHaveCount(1);
});

test("failed delivery retries one message and demo reset restores the baseline", async ({ page }) => {
  await enter(page);
  await page.getByRole("link", { name: /^Failed Delivery/ }).click();
  const row = page.locator('[data-message-row="email-seed-robert-king"]');
  await expect(row).toHaveCount(1);
  await page.locator('[data-message-detail="email-seed-robert-king"]').getByRole("button", { name: "Retry Send" }).click();
  await expect(page.locator('[data-message-row="email-seed-robert-king"]')).toHaveCount(0);
  await page.goto("/crm/communications");
  await expect(page.locator('[data-message-row="email-seed-robert-king"]')).toHaveCount(1);
  await expect(page.locator('[data-message-row="email-seed-robert-king"]')).not.toContainText("Delivery failed");

  await page.request.post("/crm/test-reset");
  await page.goto("/crm/communications?filter=failed");
  await expect(page.locator('[data-message-row="email-seed-robert-king"]')).toHaveCount(1);
  await expect(page.locator('[data-message-row="email-seed-robert-king"]')).toContainText("Delivery failed");
});

test("communications remains usable across supported laptop and desktop viewports", async ({ page }) => {
  await enter(page);
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1600, height: 900 }, { width: 1366, height: 768 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("[data-communications-workspace]")).toBeVisible();
    await expect(page.getByLabel("Communication messages")).toBeVisible();
    await expect(page.getByLabel("Communication detail")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await page.goto("/crm");
  await expect(page.getByRole("link", { name: "Open Communications" }).first()).toHaveAttribute("href", /\/crm\/communications\?message=/);
});
