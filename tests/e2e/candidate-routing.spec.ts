import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  try {
    await page.waitForURL(/\/crm$/, { timeout: 15_000 });
  } catch {
    await page.reload();
    await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  }
  await expect(page).toHaveURL(/\/crm$/, { timeout: 15_000 });
  expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy();
}

async function expectCandidate360(page: Page, href: string, name: string) {
  await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

test("every visible Candidate CRM card resolves to canonical Candidate 360", async ({ page }) => {
  await enterDemoAndReset(page);
  await page.goto("/crm/candidates");
  await page.getByRole("button", { name: "pipeline" }).click();

  const cards = page.getByRole("link", { name: /^Open .+ Candidate 360$/ });
  const candidates = await cards.evaluateAll((links) => links.map((link) => ({
    href: link.getAttribute("href")!,
    name: link.getAttribute("aria-label")!.replace(/^Open /, "").replace(/ Candidate 360$/, ""),
  })));
  expect(candidates.length).toBeGreaterThanOrEqual(3);

  for (const candidate of candidates) {
    expect(candidate.href).toMatch(/^\/crm\/candidates\/[^/]+$/);
    await page.goto("/crm/candidates");
    await page.getByRole("button", { name: "pipeline" }).click();
    await page.locator(`[data-candidate-id="${candidate.href.split("/").at(-1)}"]`).getByText(candidate.name, { exact: true }).click();
    await expectCandidate360(page, candidate.href, candidate.name);
  }
});

test("task and Mission Control candidate links resolve to canonical Candidate 360", async ({ page }) => {
  await enterDemoAndReset(page);

  await page.goto("/crm/tasks");
  await page.getByRole("button", { name: /Overdue/ }).click();
  await page.getByRole("button", { name: "View Follow up on Discovery concerns" }).click();
  const taskLink = page.getByRole("link", { name: /^Open Mike Lavalle$/ });
  await expect(taskLink).toHaveAttribute("href", "/crm/candidates/mike-lavalle");
  await taskLink.click();
  await expectCandidate360(page, "/crm/candidates/mike-lavalle", "Mike Lavalle");

  await page.goto("/crm");
  const prioritySection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Priority Candidates" }) });
  const missionLink = prioritySection.getByRole("link", { name: "Open Candidate" }).first();
  const missionHref = await missionLink.getAttribute("href");
  const missionName = await missionLink.evaluate((link) => link.closest("article")!.querySelector("h3")!.textContent!);
  expect(missionHref).toMatch(/^\/crm\/candidates\/[^/]+$/);
  await missionLink.click();
  await expectCandidate360(page, missionHref!, missionName!);
});

test("unknown canonical candidate IDs return the legitimate not-found response", async ({ page }) => {
  await enterDemoAndReset(page);
  const response = await page.goto("/crm/candidates/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("manual candidate invitation opens the current full assessment, never the obsolete one-question engine",async({page})=>{
  await enterDemoAndReset(page);await page.goto("/crm/candidates/new");
  await page.getByLabel("First name").fill("Route");await page.getByLabel("Last name").fill("Regression");await page.getByLabel("Email").fill("route.regression@example.com");await page.getByRole("button",{name:/Create Candidate/i}).click();
  await expect(page.getByText("Candidate created",{exact:true})).toBeVisible();await page.getByRole("button",{name:/Send Assessment/i}).click();await page.getByRole("link",{name:"Open Assessment"}).click();
  await expect(page).toHaveURL(/\/assessment\/start\?invitation=/);await expect(page.getByRole("heading",{name:"Tell us a little about yourself"})).toBeVisible();await expect(page).not.toHaveURL(/\/assessment\/demo/);await expect(page.getByText(/How ready are you to take the next step/i)).toHaveCount(0);
});
