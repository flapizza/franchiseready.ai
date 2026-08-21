import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok()).toBeTruthy();
}
function monitor(page: Page) { const errors: string[] = []; page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); }); page.on("pageerror", (error) => errors.push(error.message)); return errors; }

test("candidate task creation, edit, completion, history, and lifecycle integrity", async ({ page }) => {
  await enterDemoAndReset(page); const errors = monitor(page);
  await page.goto("/crm/candidates/candidate-demo");
  const stage = await page.getByText(/Brand Strategy|Discovery/, { exact: true }).first().textContent();
  await page.getByRole("button", { name: "Add Task" }).click();
  const form = page.getByRole("form", { name: "Create task" });
  await form.getByLabel("Task title").fill("Call John about next steps");
  await form.getByLabel("Priority").selectOption("urgent");
  await form.getByLabel("Notes").fill("Confirm timing and spouse availability.");
  await form.getByRole("button", { name: "Save Task" }).click();
  await expect(page.getByLabel("Tasks and follow-up").getByText("Call John about next steps", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Open All Tasks" }).click();
  await expect(page).toHaveURL(/\/crm\/tasks/);
  await page.getByRole("button", { name: /All/ }).click();
  const task = page.locator("[data-task-id]").filter({ hasText: "Call John about next steps" });
  const taskId = await task.getAttribute("data-task-id");
  await task.getByRole("button", { name: "View Call John about next steps" }).click();
  await task.getByRole("button", { name: "Edit" }).click();
  await task.getByLabel("Task title").fill("Call John and confirm next steps");
  await task.getByLabel("Priority").selectOption("high");
  await task.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(`[data-task-id="${taskId}"]`)).toContainText("Call John and confirm next steps");
  await expect(page.locator(`[data-task-id="${taskId}"]`)).toHaveCount(1);
  await page.locator(`[data-task-id="${taskId}"]`).getByRole("button", { name: "Complete" }).click();
  await page.reload(); await page.getByRole("button", { name: /Completed/ }).click();
  await expect(page.locator(`[data-task-id="${taskId}"]`)).toContainText("Call John and confirm next steps");
  await page.goto("/crm/candidates/candidate-demo");
  await expect(page.getByText(stage ?? "", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Task Completed")).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("overdue and today work surface in Tasks and Mission Control", async ({ page }) => {
  await enterDemoAndReset(page); const errors = monitor(page);
  await page.goto("/crm/tasks");
  await page.getByRole("button", { name: /Overdue/ }).click();
  const overdueTask = page.locator('[data-task-id="task-seed-overdue-mike"]');
  await expect(overdueTask.getByText("Follow up on Discovery concerns")).toBeVisible();
  await expect(overdueTask.getByLabel("Overdue")).toBeVisible();
  await page.getByRole("button", { name: /Today/ }).click();
  await expect(page.getByText("Prepare for Discovery call")).toBeVisible();
  await page.goto("/crm");
  await expect(page.getByRole("heading", { name: "Tasks Requiring Attention" })).toBeVisible();
  await expect(page.getByText("Follow up on Discovery concerns")).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("recommendations remain advisory, accept once with provenance, and dismiss persistently", async ({ page }) => {
  await enterDemoAndReset(page); const errors = monitor(page);
  await page.goto("/crm/tasks");
  const emailRecommendation = page.locator('[data-recommendation-id*="email:"]').first();
  await expect(emailRecommendation).toBeVisible();
  const firstId = await emailRecommendation.getAttribute("data-recommendation-id");
  const title = await emailRecommendation.locator("p").first().textContent();
  await emailRecommendation.getByRole("button", { name: "Create Task" }).click();
  await page.getByRole("button", { name: /All/ }).click();
  const accepted = page.locator("[data-task-id]").filter({ hasText: title ?? "" });
  await expect(accepted).toHaveCount(1);
  await accepted.getByRole("button", { name: new RegExp(`View ${title}`) }).click();
  await expect(accepted).toContainText("Why:");
  await expect(accepted).toContainText("Email engagement");
  await page.reload(); await page.getByRole("button", { name: /All/ }).click();
  await expect(page.locator("[data-task-id]").filter({ hasText: title ?? "" })).toHaveCount(1);
  await expect(page.locator(`[data-recommendation-id="${firstId}"]`)).toHaveCount(0);
  const dismiss = page.locator("[data-recommendation-id]").first(); const dismissId = await dismiss.getAttribute("data-recommendation-id");
  await dismiss.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.locator(`[data-recommendation-id="${dismissId}"]`)).toHaveCount(0);
  await page.reload();
  await expect(page.locator(`[data-recommendation-id="${dismissId}"]`)).toHaveCount(0);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("task ownership guard, navigation, reset, and custom pipeline independence", async ({ page }) => {
  await enterDemoAndReset(page); const errors = monitor(page);
  await page.goto("/crm/candidates/mike-lavalle");
  const task = page.locator('[data-task-id="task-seed-overdue-mike"]');
  await expect(task).toBeVisible();
  await task.locator('input[name="expectedCandidateId"]').evaluate((input: HTMLInputElement) => { input.value = "candidate-demo"; });
  await task.getByRole("button", { name: "Complete" }).click();
  await expect(task.getByRole("alert")).toContainText("does not belong");
  await page.goto("/crm/tasks");
  await expect(page.getByRole("link", { name: "Tasks" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Candidates" })).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Resolve Discovery follow-up", { exact: false }).first()).toBeVisible();
  const response = await page.request.post("/crm/test-reset"); expect(response.ok()).toBeTruthy();
  await page.reload(); await page.getByRole("button", { name: /Overdue/ }).click();
  await expect(page.getByText("Follow up on Discovery concerns")).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});
