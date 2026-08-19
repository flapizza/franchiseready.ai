import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok()).toBeTruthy();
}

async function dragCard(page: Page, source: ReturnType<Page["locator"]>, target: ReturnType<Page["locator"]>) {
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
  await source.dispatchEvent("dragstart", { dataTransfer });
  await target.dispatchEvent("dragenter", { dataTransfer });
  await target.dispatchEvent("dragover", { dataTransfer });
  await target.dispatchEvent("drop", { dataTransfer });
}

test("consultant customizes pipeline while AI workspaces remain available", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/settings/pipeline");
  await expect(page.getByRole("heading", { name: "Pipeline Configuration" })).toBeVisible();

  await page.getByLabel("Stage name 5").fill("Concept Review");
  await page.getByRole("button", { name: "Add Custom Stage" }).click();
  const custom = page.locator('[data-stage-id^="custom-"]');
  await custom.getByLabel(/Stage name/).fill("Meet the Team");
  await custom.getByLabel(/FranGroove AI Mapping/).selectOption("franchisor-process");
  await custom.getByRole("button", { name: /Move Meet the Team up/ }).click();
  await page.getByLabel("Enable Franchisor Discovery").uncheck();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Pipeline changes saved" })).toBeVisible();

  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();
  await expect(page.getByRole("heading", { name: "Concept Review", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meet the Team", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Franchisor Discovery", exact: true })).toHaveCount(0);

  await dragCard(page, page.locator('[data-candidate-id="jared-wirsig"] [data-drag-handle]'), page.locator('[data-pipeline-stage-id^="custom-"]'));
  await expect(page.locator('[data-pipeline-stage-id^="custom-"] [data-candidate-id="jared-wirsig"]')).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Meet the Team", { exact: true }).first()).toBeVisible();
  await page.goto("/settings/pipeline");
  await page.locator('[data-stage-id^="custom-"]').getByRole("button", { name: "Remove Stage" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /contains 1 candidate/ })).toBeVisible();
  await expect(page.locator('[data-stage-id^="custom-"]')).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig");
  await expect(page.getByText("Meet the Team", { exact: true }).first()).toBeVisible();
  await page.goto("/crm/candidates/jared-wirsig/strategy");
  await expect(page.getByRole("heading", { name: "Jared Wirsig" })).toBeVisible();
});

test("adding a custom stage is immediate, focused, duplicate-safe, and removable", async ({ page }) => {
  await enterDemoAndReset(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto("/settings/pipeline");
  const customStages = page.locator('[data-stage-id^="custom-"]');
  const initialCount = await customStages.count();
  const add = page.getByRole("button", { name: "Add Custom Stage" });
  await add.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(customStages).toHaveCount(initialCount + 1);
  const created = customStages.last();
  await expect(created).toBeInViewport();
  await expect(created.getByLabel(/Stage name/)).toBeFocused();
  await expect(page.getByRole("button", { name: "Add Custom Stage" })).toBeEnabled();
  await created.getByRole("button", { name: "Remove Stage" }).click();
  await expect(customStages).toHaveCount(initialCount);

  await page.getByRole("button", { name: "Add Custom Stage" }).click();
  const persisted = customStages.last();
  await persisted.getByLabel(/Stage name/).fill("Temporary Review");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Pipeline changes saved" })).toBeVisible();
  await persisted.getByRole("button", { name: "Remove Stage" }).click();
  await expect(page.locator('input[value="Temporary Review"]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('input[value="Temporary Review"]')).toHaveCount(0);
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();
  await expect(page.getByRole("heading", { name: "Temporary Review", exact: true })).toHaveCount(0);
  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
});

test("in-use disable is rejected and reset restores recommendations", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/settings/pipeline");
  await page.getByLabel("Enable Discovery").uncheck();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Move 2 candidates out/ })).toBeVisible();
  await page.getByRole("button", { name: "Reset to Recommended Pipeline" }).click();
  await expect(page.getByText(/Recommended pipeline restored/)).toBeVisible();
});

test("Pipeline Settings hydrates from one ordered server snapshot", async ({ page }) => {
  await enterDemoAndReset(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/settings/pipeline");
  await expect(page.getByRole("heading", { name: "Pipeline Configuration" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Move New Candidate up" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move New Candidate down" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Discovery up" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Discovery down" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Closed / Lost down" })).toBeDisabled();

  await page.getByRole("button", { name: "Move Assessment Pending down" }).click();
  await expect(page.getByLabel("Stage name 2")).toHaveValue("Assessment Complete");
  await page.getByLabel("Stage name 5").fill("Concept Review");
  await page.getByRole("button", { name: "Add Custom Stage" }).click();
  const custom = page.locator('[data-stage-id^="custom-"]');
  await custom.getByLabel(/Stage name/).fill("Funding Confirmed");
  await custom.getByLabel(/FranGroove AI Mapping/).selectOption("qualification");
  await page.getByLabel("Enable Franchisor Discovery").uncheck();
  await expect(page.getByRole("button", { name: "Move Franchisor Discovery up" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move Franchisor Discovery down" })).toBeDisabled();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Pipeline changes saved" })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Stage name 2")).toHaveValue("Assessment Complete");
  await expect(page.getByLabel("Stage name 3")).toHaveValue("Assessment Pending");
  await expect(page.locator('input[value="Concept Review"]')).toBeVisible();
  await expect(page.locator('input[value="Funding Confirmed"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Move Funding Confirmed down" })).toBeDisabled();
  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
});
