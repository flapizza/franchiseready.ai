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
    { name: "Referral Studio", path: "/crm/referrals", heading: "Referral Studio" },
  ]) {
    const destination = new RegExp(`${workspace.path}$`);
    await Promise.all([
      page.waitForURL(destination),
      page.getByRole("navigation").getByRole("link", { name: workspace.name }).click(),
    ]);
    await expect(page).toHaveURL(destination);
    await expect(page.getByRole("heading", { name: workspace.heading }).last()).toBeVisible();
    await expect(navigation.getByRole("link", { name: workspace.name })).toHaveAttribute("aria-current", "page");
  }

  await page.goto("/crm/candidates/candidate-demo/strategy");
  await expect(navigation.getByRole("link", { name: "Brand Strategy" })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Candidates" })).not.toHaveAttribute("aria-current", "page");

  await page.goto("/crm/candidates/candidate-demo/referral");
  await expect(navigation.getByRole("link", { name: "Referral Studio" })).toHaveAttribute("aria-current", "page");

  await page.goto("/crm/candidate-demo/discovery");
  await expect(navigation.getByRole("link", { name: "Discovery Copilot" })).toHaveAttribute("aria-current", "page");
});
