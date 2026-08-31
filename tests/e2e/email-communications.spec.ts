import { expect, test, type Page } from "@playwright/test";

async function enterDemoAndReset(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  const reset = await page.request.post("/crm/test-reset"); expect(reset.ok(), `${reset.status()} ${await reset.text()}`).toBeTruthy();
  return errors;
}

async function compose(page: Page, subject: string, body: string) {
  await page.getByRole("button", { name: "Compose Email" }).click();
  await expect(page.getByRole("region", { name: /Compose email to/ })).toContainText("Jim Wood <jim@frangroove.ai>");
  await page.getByLabel("Subject").fill(subject); await page.getByLabel("Message").fill(body);
  await page.getByRole("button", { name: "Send Email" }).dblclick();
  await expect(page.getByLabel("Email history").locator("article", { hasText: subject })).toHaveCount(1);
}

test("compose, delivery, engagement, timeline, and integrity remain candidate-owned", async ({ page }) => {
  const errors = await enterDemoAndReset(page); await page.goto("/crm/candidates/sarah-williams");
  await expect(page.getByRole("heading", { name: "Sarah Williams" })).toBeVisible();
  const stageBefore = await page.getByRole("heading", { name: "Sarah Williams" }).locator("..").locator("span").first().textContent();
  await page.goto("/crm/candidates/sarah-williams/strategy");
  const matchesBefore = await page.getByText(/AI Match \d+%/).allTextContents();
  await page.goto("/crm/candidates/sarah-williams");
  await expect(page.getByRole("region", { name: /Compose email to/ })).toHaveCount(0);
  await expect(page.getByLabel("Email history").locator("summary").filter({ hasText: "ERA Group information and next steps" })).toBeVisible();
  const composeButton = page.getByRole("button", { name: "Compose Email" });
  await composeButton.focus(); await expect(composeButton).toBeFocused(); await composeButton.press("Enter");
  await expect(page.getByRole("region", { name: "Compose email to Sarah Williams" })).toBeVisible();
  await page.getByLabel("Subject").fill("Cancelled draft"); await page.getByLabel("Message").fill("Do not save this message."); await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("region", { name: /Compose email to/ })).toHaveCount(0); await expect(composeButton).toBeFocused(); await expect(page.getByText("Cancelled draft", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Compose Email" }).click();
  await expect(page.getByRole("region", { name: /Compose email to/ })).toContainText("Sarah Williams <sarah.williams@example.com>");
  await page.getByLabel("Subject").fill("Conference follow-up");
  await page.getByLabel("Message").fill("Please review https://www.eragroup.com and https://cal.example.com/jim");
  await page.getByRole("button", { name: "Send Email" }).click();
  await expect(page.getByRole("region", { name: /Compose email to/ })).toHaveCount(0); await expect(composeButton).toBeFocused();
  const history = page.getByLabel("Email history"); await expect(history.locator("article").first()).toContainText("Conference follow-up");
  const record = history.locator("article", { hasText: "Conference follow-up" }); const item = record.locator("details"); await expect(item).toHaveCount(1); await item.locator("summary").click();
  await expect(item).toContainText("Delivered"); await expect(item).toContainText("no external email was transmitted");
  const messageId = await record.getAttribute("data-message-id"); expect(messageId).toBeTruthy();
  for (const [eventId, type] of [["open-one", "open"], ["open-two", "open"]] as const) {
    const response = await page.request.post("/crm/test-email-engagement", { data: { candidateId: "sarah-williams", messageId, type, eventId } }); expect(response.ok()).toBeTruthy();
  }
  const click = await page.request.post("/crm/test-email-engagement", { data: { candidateId: "sarah-williams", messageId, type: "link-click", linkId: `${messageId}:link:1`, eventId: "click-one" } }); expect(click.ok()).toBeTruthy();
  const duplicate = await page.request.post("/crm/test-email-engagement", { data: { candidateId: "sarah-williams", messageId, type: "open", eventId: "open-two" } }); expect((await duplicate.json()).status).toBe("duplicate-ignored");
  await page.reload(); const updated = page.locator("article", { hasText: "Conference follow-up" }).locator("details"); await updated.locator("summary").click();
  await expect(updated).toContainText("Open Count"); await expect(updated).toContainText("2"); await expect(updated).toContainText("First Open"); await expect(updated).toContainText("Last Open"); await expect(updated).toContainText("eragroup.com"); await expect(updated).toContainText("Click Count: 1");
  await expect(page.getByText("Email opened 2 times", { exact: true })).toBeVisible(); await expect(page.getByText("Link Clicked", { exact: true }).first()).toBeVisible(); await expect(page.getByText("Email Delivered", { exact: true }).first()).toBeVisible();
  expect(await page.getByRole("heading", { name: "Sarah Williams" }).locator("..").locator("span").first().textContent()).toBe(stageBefore);
  await page.goto("/crm/candidates/sarah-williams/strategy"); expect(await page.getByText(/AI Match \d+%/).allTextContents()).toEqual(matchesBefore);
  const wrongOwner = await page.request.post("/crm/test-email-engagement", { data: { candidateId: "elena-rodriguez", messageId, type: "open" } }); expect(wrongOwner.status()).toBe(404);
  expect(errors).toEqual([]);
});

test("failed delivery retries the same canonical message", async ({ page }) => {
  const errors = await enterDemoAndReset(page);
  const configured = await page.request.post("/crm/test-email-engagement", { data: { candidateId: "mike-lavalle", type: "fail-next-delivery" } }); expect(configured.ok()).toBeTruthy();
  await page.goto("/crm/candidates/mike-lavalle"); await compose(page, "Retry-safe follow-up", "This message should be preserved.");
  let record = page.locator("article", { hasText: "Retry-safe follow-up" }); const detail = record.locator("details"); await expect(detail).not.toHaveAttribute("open", ""); await expect(record).toContainText("Failed · Retry available");
  const id = await record.getAttribute("data-message-id"); await record.getByRole("button", { name: "Retry Send" }).click(); await expect(record).toContainText("Delivered · No engagement yet"); await page.reload();
  record = page.locator("article", { hasText: "Retry-safe follow-up" }); expect(await record.getAttribute("data-message-id")).toBe(id); await expect(record).toHaveCount(1); await record.locator("summary").click(); await expect(record).toContainText("Delivered · No engagement yet");
  expect(errors).toEqual([]);
});

test("seeded communication states remain explainable and Mission Control surfaces engagement", async ({ page }) => {
  const errors = await enterDemoAndReset(page); await page.goto("/crm/candidates/sarah-williams");
  const seeded = page.locator("details", { hasText: "ERA Group information and next steps" }); await seeded.locator("summary").click();
  await expect(seeded).toContainText("Open Count"); await expect(seeded).toContainText("3"); await expect(seeded).toContainText("ERA Group website"); await expect(seeded).toContainText("Click Count: 1");
  await page.goto("/crm"); await expect(page.getByText("Email Engagement", { exact: true })).toBeVisible(); await expect(page.getByText(/Follow up while recent interest is active/)).toBeVisible();
  expect(errors).toEqual([]);
});
