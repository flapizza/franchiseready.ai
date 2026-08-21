import { expect, test, type Page } from "@playwright/test";

async function enter(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();
}

function monitor(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("manager command center exposes authorized hierarchy, metrics, assignment, and candidate handoff", async ({ page }) => {
  await enter(page); const errors = monitor(page);
  await page.goto("/crm/team");
  await expect(page.locator("[data-team-mission-control]")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Carolinas Growth Team" })).toBeVisible();
  await expect(page.locator("[data-team-metric]")).toHaveCount(6);
  await expect(page.locator('[data-team-member="leader-maya"]')).toContainText("Team Leader");
  await expect(page.locator('[data-team-member="consultant-leo"]')).toContainText("Leo Grant");
  await expect(page.locator('[data-team-candidate="sarah-williams"] [data-assigned-consultant="consultant-leo"]')).toContainText("Leo Grant");
  await page.locator('[data-team-candidate="sarah-williams"]').getByRole("link", { name: "Sarah Williams", exact: true }).click();
  await expect(page).toHaveURL(/\/crm\/candidates\/sarah-williams$/);
  await expect(page.getByRole("heading", { name: "Sarah Williams" })).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});

test("team leader and consultant scopes change pipeline, attention, and drill-down deterministically", async ({ page }) => {
  await enter(page); const errors = monitor(page);
  await page.goto("/crm/team");
  await page.locator('[data-team-scope="leader-maya"]').click();
  await expect(page).toHaveURL(/scope=leader-maya/);
  await expect(page.locator("[data-consultant-drilldown]")).toContainText("Maya Chen");
  await expect(page.locator("[data-team-candidate]")).toHaveCount(4);
  await expect(page.locator('[data-team-candidate="elena-rodriguez"]')).toBeVisible();
  await expect(page.locator('[data-team-candidate="sarah-williams"]')).toBeVisible();
  await expect(page.locator('[data-team-candidate="mike-lavalle"]')).toHaveCount(0);
  await expect(page.locator('[data-attention-item="attention-sarah-williams"]')).toBeVisible();

  await page.locator('[data-team-scope="consultant-avery"]').click();
  await expect(page.locator("[data-consultant-drilldown]")).toContainText("Avery Brooks");
  await expect(page.locator("[data-team-candidate]")).toHaveCount(3);
  await expect(page.locator('[data-team-candidate="mike-lavalle"]')).toBeVisible();
  await expect(page.locator('[data-team-candidate="sarah-williams"]')).toHaveCount(0);

  expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();
  await page.reload();
  await expect(page.locator("[data-team-candidate]")).toHaveCount(3);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("team navigation and command center remain usable at a compact desktop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await enter(page); const errors = monitor(page);
  await page.getByRole("link", { name: "Team Command Center" }).click();
  await expect(page).toHaveURL(/\/crm\/team$/);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Team Command Center" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Candidate movement" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Intervene with purpose" })).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
});
