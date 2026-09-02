import { expect, test, type Page } from "@playwright/test";
async function enterDemo(page: Page) { await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/); }
test("Contacts to Segment to ready Campaign without delivery", async ({ page }) => {
  await enterDemo(page); await page.goto("/crm/segments/new"); await page.getByLabel("Segment name").fill("Carolina Semi-Absentee");
  await page.getByRole("button", { name: "Preview audience" }).click(); await expect(page.getByText("Current audience preview")).toBeVisible();
  await page.getByRole("button", { name: "Save Segment" }).click(); await expect(page).toHaveURL(/\/crm\/segments\/seg_/);
  await page.getByRole("link", { name: "Create Campaign from Segment" }).click(); await page.getByLabel("Campaign name").fill("Carolina Opportunity Update");
  await page.getByLabel("Subject line").fill("Ideas for {{first_name}}"); await page.getByLabel("Sender display name").fill("Alex Morgan"); await page.getByLabel("Reply-to address").fill("alex@example.test");
  await page.getByLabel("Email heading").fill("A focused shortlist"); await page.getByLabel("Body content").fill("Hi {{preferred_name}},\nHere are franchise opportunities selected for you."); await page.getByLabel("Footer content").fill("FranGroove - opted-in audience.");
  await page.getByRole("button", { name: "Refresh counts" }).click(); await expect(page.getByText("Sendable").locator("..")).toContainText("3");
  await page.getByRole("button", { name: "Mark Ready" }).click(); await expect(page).toHaveURL(/\/crm\/campaigns\/camp_/); await expect(page.getByText("ready", { exact: true })).toBeVisible(); await expect(page.getByText(/not sent/i)).toBeVisible();
});
test("Campaign supports a static List and responsive authoring", async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await enterDemo(page); await page.goto("/crm/campaigns/new?audience=list&id=list_demo_newsletter"); await expect(page.getByLabel("Audience type")).toHaveValue("list"); await expect(page.getByLabel("Campaign audience")).toHaveValue("list_demo_newsletter"); expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBeFalsy(); });
