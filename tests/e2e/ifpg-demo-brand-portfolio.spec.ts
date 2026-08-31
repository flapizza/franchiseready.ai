import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const response = await page.request.post("/crm/test-reset");
  expect(response.ok(), `${response.status()} ${await response.text()}`).toBeTruthy();
}

test("expanded Brand Library presents six contrasting and clearly labeled concepts", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/brands");
  await expect(page.getByRole("heading", { name: "Brand Library" })).toBeVisible();
  await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(6);
  await expect(page.getByText("Curated Demo", { exact: true })).toHaveCount(3);
  await expect(page.getByText("Existing Demo Profile", { exact: true })).toHaveCount(3);
  const routeWise = page.getByLabel("RouteWise Mobile Services brand card");
  await expect(routeWise).toContainText("Mobile Consumer Services");
  await expect(routeWise).toContainText("Owner-operator");
  await expect(routeWise).toContainText("$65,000");
  await page.getByRole("link", { name: "Open BrightPath Home Services Brand Profile" }).click();
  await expect(page).toHaveURL(/\/crm\/brands\/brightpath-home-services$/);
  await expect(page.getByRole("heading", { name: "BrightPath Home Services" })).toBeVisible();
  await expect(page.getByText("Curated manager-led home-services concept", { exact: false })).toBeVisible();
  await expect(page.getByText("Local service hub coordinating technicians", { exact: false })).toBeVisible();
  await expect(page.getByText("Curated concept: technician recruiting and local-market activation", { exact: true })).toBeVisible();
});

test("John Sarah and Jared receive differentiated portfolio rankings", async ({ page }) => {
  await enterDemoAndReset(page);
  const names = async () => page.locator('article[aria-label$=" recommendation"] h3').allTextContents();

  await page.goto("/crm/candidates/candidate-demo/strategy");
  expect(await names()).toEqual(["ERA Group", "Schooley Mitchell", "ActionCOACH", "RouteWise Mobile Services", "BrightPath Home Services", "Harbor & Hound Market"]);
  await expect(page.getByLabel("ERA Group recommendation")).toContainText("John's strongest alignment");
  await expect(page.getByLabel("Harbor & Hound Market recommendation")).toContainText("Not Financially Qualified");
  await expect(page.getByLabel("Harbor & Hound Market recommendation")).toContainText("thresholds exceed the current financial profile");

  await page.goto("/crm/candidates/sarah-williams/strategy");
  expect((await names()).slice(0, 2)).toEqual(["ERA Group", "BrightPath Home Services"]);

  await page.goto("/crm/candidates/jared-wirsig/strategy");
  expect((await names()).slice(0, 2)).toEqual(["ActionCOACH", "ERA Group"]);
});

test("a curated concept can be presented and canonical reset restores the empty set", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates/candidate-demo/strategy");
  await page.getByLabel("RouteWise Mobile Services recommendation").getByRole("button", { name: "Add to Presentation Set" }).click();
  await page.getByRole("button", { name: "Start Brand Presentation" }).click();
  await expect(page.getByText("Brand Presentation · John Smith", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "RouteWise Mobile Services" })).toBeVisible();
  await expect(page.getByText("Curated mobile-service concept", { exact: false })).toBeVisible();
  const reset = await page.request.post("/crm/test-reset");
  expect(reset.ok()).toBeTruthy();
  await page.goto("/crm/candidates/candidate-demo/strategy");
  await expect(page.getByLabel("Presentation Set")).toContainText("Select one or more recommendations");
});
