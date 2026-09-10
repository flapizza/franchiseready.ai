import { test, expect, type Page } from "@playwright/test";

test.skip(!process.env.IFPG_EMAIL || !process.env.IFPG_PASSWORD, "Requires an explicitly provisioned persisted workspace.");
async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(process.env.IFPG_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.IFPG_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/crm$/);
}
async function geometry(page: Page) {
  const size = await page.locator("[data-workspace-scroll]").evaluate(e => ({ width: e.clientWidth, scroll: e.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const width of [1440, 1023, 768, 390]) test(`persisted consultant journey at ${width}px`, async ({ page }, info) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setViewportSize({ width, height: 1000 });
  await signIn(page);
  await expect(page.locator("[data-persisted-mission-control]")).toBeVisible();
  await expect(page.getByRole("region", { name: "Practice summary" })).toContainText("Completed assessments");
  await geometry(page);
  await page.screenshot({ path: info.outputPath(`mission-control-${width}.png`), fullPage: true });
  // Discover destinations from actual rendered candidate data, not fixture IDs.
  const attention = page.locator('section[aria-labelledby="attention-heading"] a').first();
  const candidatePath = await attention.getAttribute("href");
  expect(candidatePath).toMatch(/^\/crm\/candidates\/[^/]+$/);
  await attention.click();
  await expect(page.locator("[data-candidate-360-workspace]")).toBeVisible();
  await expect(page.getByText("Profile Confidence", { exact: true })).toBeVisible();
  await expect(page.getByText("Buying Confidence", { exact: true })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Candidate journey" }).getByRole("link", { name: "Brand Referral Engine", exact: true }).click();
  await expect(page.locator("[data-brand-referral-engine]")).toBeVisible();
  await expect(page.locator("[data-brand-result]")).toHaveCount(6);
  await geometry(page);
  const cards = page.locator("[data-brand-result]");
  await cards.nth(0).getByRole("button", { name: /^Compare / }).click();
  await cards.nth(1).getByRole("button", { name: /^Compare / }).click();
  const comparison = page.locator("#brand-comparison");
  await expect(comparison).toContainText("2 of 3 brands selected");
  await expect(comparison.locator("article")).toHaveCount(2);
  await expect(comparison).toContainText("Liquid capital");
  await geometry(page);
  await comparison.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath(`comparison-${width}.png`), fullPage: true });
  await cards.nth(0).getByRole("link", { name: /Brand Intelligence$/ }).click();
  await expect(page.getByRole("heading", { name: "What this business actually does" })).toBeVisible();
  await geometry(page);
  await page.getByRole("navigation", { name: "Candidate context" }).getByRole("link", { name: /Return to .*Brand Referral Engine/ }).click();
  await page.locator("[data-brand-result]").first().getByRole("link", { name: /^Prepare handoff/ }).click();
  await expect(page.locator("[data-handoff-preview]")).toBeVisible();
  await expect(page.getByText(/Nothing transmitted/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Financial context" })).toBeVisible();
  await geometry(page);
  await page.screenshot({ path: info.outputPath(`handoff-${width}.png`), fullPage: true });
  await page.getByRole("navigation", { name: "Candidate journey" }).getByRole("link", { name: "Mission Control", exact: true }).click();
  await expect(page.locator("[data-persisted-mission-control]")).toBeVisible();
  if (width < 1024) {
    await page.locator("summary").filter({ hasText: /^Menu$/ }).click();
    await page.getByRole("link", { name: "Brand Referral Engine", exact: true }).click();
  } else await page.locator("[data-app-sidebar]").getByRole("link", { name: "Brand Referral Engine", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Brand Referral Engine", exact: true }).last()).toBeVisible();
  expect(errors).toEqual([]);
});
