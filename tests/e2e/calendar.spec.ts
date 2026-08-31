import { expect, test, type Page } from "@playwright/test";
async function enter(page: Page) { await page.goto("/login"); await page.getByRole("button", { name: /Enter Conference Demo as/i }).click(); await expect(page).toHaveURL(/\/crm$/); expect((await page.request.post("/crm/test-reset")).ok()).toBeTruthy(); }
function monitor(page: Page) { const errors: string[] = []; page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); }); page.on("pageerror", (error) => errors.push(error.message)); return errors; }

test("Calendar views expose candidate-linked Meeting Briefs by keyboard", async ({ page }) => {
  await enter(page); const errors = monitor(page); await page.goto("/crm/calendar"); const john = page.locator("article").filter({ hasText: "Discovery Call" }); await expect(john.getByRole("link", { name: "John Smith" })).toHaveAttribute("href", "/crm/candidates/candidate-demo"); await john.getByText("View Meeting").focus(); await page.keyboard.press("Enter"); await expect(john.getByRole("region", { name: "Meeting Brief" })).toContainText("Family alignment remains unresolved"); await page.getByRole("button", { name: "Upcoming" }).click(); await expect(page.getByText(/Follow-Up.*Elena Rodriguez/)).toBeVisible(); await page.getByRole("button", { name: "Past" }).click(); await expect(page.getByText(/Brand Presentation Recap.*Jared Wirsig/)).toBeVisible(); expect(errors).toEqual([]);
});

test("new meeting uses selectable times, linked defaults, overrides, and midnight rollover", async ({ page }) => {
  await enter(page); const errors = monitor(page); await page.goto("/crm/calendar"); await page.getByRole("button", { name: "Add Meeting" }).click(); const form = page.getByRole("form", { name: "Create meeting" });
  await form.getByLabel("Start Date").fill("2099-08-20"); await expect(form.getByLabel("End Date")).toHaveValue("2099-08-20"); await form.getByLabel("Start Time").selectOption("14:00"); await expect(form.getByLabel("End Time")).toHaveValue("15:00");
  await form.getByLabel("Start Time").selectOption("16:00"); await expect(form.getByLabel("End Time")).toHaveValue("17:00"); await form.getByLabel("End Time").selectOption("17:30"); await form.getByLabel("Start Time").selectOption("18:00"); await expect(form.getByLabel("End Time")).toHaveValue("19:30");
  await form.getByLabel("Start Time").selectOption("23:30"); await expect(form.getByLabel("End Time")).toHaveValue("01:00"); await expect(form.getByLabel("End Date")).toHaveValue("2099-08-21"); expect(errors).toEqual([]);
});

test("invalid ranges show inline validation and are not created", async ({ page }) => {
  await enter(page); await page.goto("/crm/calendar"); await page.getByRole("button", { name: "Add Meeting" }).click(); const form = page.getByRole("form", { name: "Create meeting" }); await form.getByLabel("Title").fill("Invalid range meeting"); await form.getByLabel("Start Date").fill("2099-08-20"); await form.getByLabel("Start Time").selectOption("14:00"); await form.getByLabel("End Time").selectOption("13:30"); await expect(form.getByRole("alert")).toContainText("must be after"); await form.getByRole("button", { name: "Schedule Meeting" }).click(); await expect(form.getByRole("alert")).toBeVisible(); await page.reload(); await expect(page.getByText("Invalid range meeting")).toHaveCount(0);
});

test("editing preserves the stored duration instead of applying the new-event default", async ({ page }) => {
  await enter(page); await page.goto("/crm/calendar?event=meeting-john-discovery"); const form = page.getByRole("form", { name: "Edit meeting" }); await expect(form.getByLabel("Start Time")).toHaveValue("14:00"); await expect(form.getByLabel("End Time")).toHaveValue("14:30");
});

test("Candidate 360 keeps candidate preselection and refined scheduling", async ({ page }) => {
  await enter(page); const errors = monitor(page); await page.goto("/crm/candidates/candidate-demo"); await page.getByRole("link", { name: "Add Meeting" }).click(); const form = page.getByRole("form", { name: "Create meeting" }); await expect(form.getByLabel("Candidate")).toHaveValue("candidate-demo"); await form.getByLabel("Title").fill("Decision Follow-Up — John Smith"); await form.getByLabel("Start Date").fill("2099-06-10"); await form.getByLabel("Start Time").selectOption("10:00"); await expect(form.getByLabel("End Date")).toHaveValue("2099-06-10"); await expect(form.getByLabel("End Time")).toHaveValue("11:00"); await form.getByRole("button", { name: "Schedule Meeting" }).click(); await page.getByRole("button", { name: "Upcoming" }).click(); await expect(page.getByText("Decision Follow-Up — John Smith")).toHaveCount(1); expect(errors).toEqual([]);
});

test("completion stays advisory until explicit follow-up acceptance", async ({ page }) => {
  await enter(page); await page.goto("/crm/calendar"); const john = page.locator("article").filter({ hasText: "Discovery Call" }); await john.getByText("View Meeting").click(); await john.getByLabel("Meeting notes").fill("Family alignment confirmed."); await john.getByLabel("Completed").check(); await john.getByLabel("Meeting notes").locator("xpath=ancestor::form").getByRole("button", { name: "Save" }).click(); await expect(john).toHaveCount(0, { timeout: 15_000 }); await page.getByRole("button", { name: "Past" }).click(); const completed = page.locator("article").filter({ hasText: "Discovery Call" }); await completed.getByText("View Meeting").click(); await expect(completed).toContainText("Suggested follow-up");
});
