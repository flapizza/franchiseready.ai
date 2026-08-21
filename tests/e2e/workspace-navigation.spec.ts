import { expect, test, type Page } from "@playwright/test";

async function enterDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
}

test("primary workspace navigation uses valid queues and correct active states", async ({ page }) => {
  await enterDemo(page);

  const navigation = page.getByRole("navigation");
  await expect(navigation.getByRole("link", { name: "Mission Control" })).toHaveAttribute("aria-current", "page");

  for (const workspace of [
    { name: "Candidates", path: "/crm/candidates", heading: "Candidates" },
    { name: "Discovery Copilot", path: "/crm/discovery", heading: "Discovery work queue" },
    { name: "Brand Strategy", path: "/crm/strategy", heading: "Brand Strategy" },
    { name: "Brand Library", path: "/crm/brands", heading: "Brand Library" },
    { name: "Referral Studio", path: "/crm/referrals", heading: "Referral Studio" },
  ]) {
    const destination = new RegExp(`${workspace.path}$`);
    await page.getByRole("navigation").getByRole("link", { name: workspace.name }).click();
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("heading", { name: workspace.heading }).last()).toBeVisible();
    await expect(navigation.getByRole("link", { name: workspace.name })).toHaveAttribute("aria-current", "page");
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  }

  await page.getByRole("navigation").getByRole("link", { name: "Brand Library" }).click();
  await page.getByRole("link", { name: /Open .* Brand Profile/ }).first().click();
  await expect(page).toHaveURL(/\/crm\/brands\/[^/]+$/);
  await expect(navigation.getByRole("link", { name: "Brand Library" })).toHaveAttribute("aria-current", "page");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);

  await page.goto("/crm/candidates/candidate-demo/strategy");
  await expect(navigation.getByRole("link", { name: "Brand Strategy" })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Candidates" })).not.toHaveAttribute("aria-current", "page");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);

  await page.goto("/crm/candidates/jared-wirsig/strategy/presentation");
  await expect(navigation.getByRole("link", { name: "Brand Strategy" })).toHaveAttribute("aria-current", "page");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);

  await page.goto("/crm/candidates/candidate-demo/referral");
  await expect(navigation.getByRole("link", { name: "Referral Studio" })).toHaveAttribute("aria-current", "page");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);

  await page.goto("/crm/candidate-demo/discovery");
  await expect(navigation.getByRole("link", { name: "Discovery Copilot" })).toHaveAttribute("aria-current", "page");
});

test("workspace views separate active work from completed history", async ({ page }) => {
  await enterDemo(page);
  await page.goto("/crm/discovery");
  await expect(page.getByText("Robert King")).toHaveCount(0);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page.getByText("Robert King")).toBeVisible();

  await page.goto("/crm/strategy");
  await expect(page.getByText("Robert King")).toHaveCount(0);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page.getByText("Robert King")).toBeVisible();

  await page.goto("/crm/referrals");
  await expect(page.getByText("Robert King")).toHaveCount(0);
  await page.getByRole("link", { name: "Completed" }).click();
  await expect(page.getByText("Robert King")).toBeVisible();
  await expect(page.getByRole("link", { name: "View Referral History" })).toBeVisible();
});

test("settings remains inside the authenticated shell", async ({ page }) => {
  await enterDemo(page);
  await page.goto("/settings/profile");
  await expect(page.getByRole("heading", { name: "Professional Identity", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Mission Control" })).toBeVisible();
});

test("pipeline exposes a synchronized top scroll control and card destinations", async ({ page }) => {
  await enterDemo(page);
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();
  const top = page.getByLabel("Pipeline top horizontal scroll");
  await expect(top).toBeVisible();
  await top.evaluate((element) => { element.scrollLeft = 300; element.dispatchEvent(new Event("scroll")); });
  await expect.poll(() => page.locator("section").filter({ has: top }).locator("div.overflow-x-auto").last().evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "Open Robert King Candidate 360" })).toHaveAttribute("href", "/crm/candidates/robert-king");
  await expect(page.getByRole("link", { name: "View Referral History" })).toHaveAttribute("href", "/crm/candidates/robert-king/referral");
});
