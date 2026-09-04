import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();
}

test("consultant can browse, filter, and open canonical Brand Intelligence", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await enterDemoAndReset(page);
  await page.goto("/crm/brands");
  await expect(page.getByRole("heading", { name: "Brand Intelligence", exact: true })).toBeVisible();
  await expect(page.getByText("6", { exact: true }).first()).toBeVisible();
  await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(6);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Brand Intelligence" })).toHaveAttribute("aria-current", "page");

  await page.getByLabel("Search brands").fill("RouteWise");
  await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(1);
  await expect(page.getByLabel("RouteWise Mobile Services brand card")).toContainText("Owner-operator");
  await page.getByLabel("Search brands").fill("");
  await page.getByLabel("Category").selectOption("Business Coaching");
  await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(1);
  await page.getByRole("link", { name: "Open ActionCOACH Brand Profile" }).click();

  await expect(page).toHaveURL(/\/crm\/brands\/actioncoach$/);
  await expect(page.getByRole("heading", { name: "ActionCOACH" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What this business actually does" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What the franchisee does" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Strong fit indicators" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Potential friction" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Business at a glance" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Key diligence gaps" })).toBeVisible();
  await expect(page.getByText("Developing profile", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("22 of 34 core facts known", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Franchise economics" })).toBeVisible();
  await expect(page.getByText("Unknown — not yet reviewed", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why FranGroove believes these facts" })).toBeVisible();
  await expect(page.getByText("Existing IFPG demo profile", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Consultant decision support—not a purchase recommendation.", { exact: false })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("all canonical profiles render consultant intelligence without unsupported detail failures", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await enterDemoAndReset(page);
  for (const brandId of ["era-group", "schooley-mitchell", "actioncoach", "routewise-mobile-services", "brightpath-home-services", "harbor-and-hound-market"]) {
    await page.goto(`/crm/brands/${brandId}`);
    await expect(page.getByRole("heading", { name: "What this business actually does" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key diligence gaps" })).toBeVisible();
    await expect(page.getByText("Unknown — not yet reviewed", { exact: true }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/represented customer|current profile represents|franchisee is represented|deterministically synthesized|canonical facts|weighted coverage/i);
  }
  expect(browserErrors).toEqual([]);
});

test("invalid Brand Intelligence ID returns not found", async ({ page }) => {
  await enterDemoAndReset(page);
  const response = await page.goto("/crm/brands/not-a-brand");
  expect(response?.status()).toBe(404);
});

test("Candidate Workspace and deterministic IFPG matching remain unchanged", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/candidate-demo/strategy");
  await expect(page.getByRole("heading", { name: "Brand Strategy", exact: true })).toBeVisible();
  const recommendations = page.locator('article[aria-label$=" recommendation"] h3');
  await expect(recommendations).toHaveText(["ERA Group", "Schooley Mitchell", "ActionCOACH", "RouteWise Mobile Services", "BrightPath Home Services", "Harbor & Hound Market"]);
});
