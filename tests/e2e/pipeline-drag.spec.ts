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

test("dragging a card moves it once, updates counts, persists, and preserves candidate intelligence", async ({ page }) => {
  await enterDemoAndReset(page);
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();

  const sourceColumn = page.locator('[data-pipeline-stage-id="stage-discovery"]');
  const destinationColumn = page.locator('[data-pipeline-stage-id="stage-brand-strategy"]');
  const card = sourceColumn.locator('[data-candidate-id="candidate-demo"]');
  const sourceCount = Number((await sourceColumn.locator('span[aria-label*="candidates in"]').getAttribute("aria-label"))?.split(" ")[0]);
  const destinationCount = Number((await destinationColumn.locator('span[aria-label*="candidates in"]').getAttribute("aria-label"))?.split(" ")[0]);
  await dragCard(page, card.locator("[data-drag-handle]"), destinationColumn);
  await expect(destinationColumn.locator('[data-candidate-id="candidate-demo"]')).toBeVisible();
  await expect(sourceColumn.locator(`span[aria-label="${sourceCount - 1} candidates in Discovery"]`)).toBeVisible();
  await expect(destinationColumn.locator(`span[aria-label^="${destinationCount + 1} candidates in"]`)).toBeVisible();
  await expect(page).toHaveURL(/\/crm\/candidates$/);

  await page.reload();
  await page.getByRole("button", { name: "pipeline" }).click();
  await expect(page.locator('[data-pipeline-stage-id="stage-brand-strategy"] [data-candidate-id="candidate-demo"]')).toBeVisible();
  await page.locator('[data-candidate-id="candidate-demo"]').click({ position: { x: 140, y: 150 } });
  await expect(page).toHaveURL(/\/crm\/candidates\/candidate-demo$/);
  await expect(page.getByText("87%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Candidate moved from Discovery to Brand Strategy.")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Compose Email/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Brand Strategy/i }).first()).toBeVisible();
  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
});

test("card CTA remains independent from drag and normal card click opens Candidate 360", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();
  const card = page.locator('[data-candidate-id="jared-wirsig"]');
  await card.getByRole("link", { name: "Review Brand Strategy" }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig\/strategy$/);
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();
  await page.locator('[data-candidate-id="jared-wirsig"]').click({ position: { x: 140, y: 150 } });
  await expect(page).toHaveURL(/\/crm\/candidates\/jared-wirsig$/);
});
