import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { BrandIntelligenceRuntime } from "../../feature/brand-library/runtime/BrandIntelligenceRuntime";

const email = "bi-consultant@example.test";
const password = "Local-fixture-only-password-2026";
const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const brands = ["ERA Group", "Schooley Mitchell", "ActionCOACH", "RouteWise Mobile Services", "BrightPath Home Services", "Harbor & Hound Market"];
const slugs = ["era-group", "schooley-mitchell", "actioncoach", "routewise-mobile-services", "brightpath-home-services", "harbor-and-hound-market"];
test.beforeAll(() => {
  expect(process.env.PERSISTENCE_MODE).toBe("supabase");
  expect(["127.0.0.1", "localhost"]).toContain(new URL(endpoint).hostname);
});
async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
}
test("authenticated persisted library, filters, six profiles and desktop visual evidence", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await login(page);
  for (const width of [1440, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/crm/brands");
    await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(6);
    for (const name of brands) await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`library-${width}.png`), fullPage: true });
    await page.getByLabel("Search brands").fill("ERA Group");
    await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(1);
    await page.getByLabel("Search brands").fill("");
    await page.getByLabel("Category", { exact: true }).selectOption("Business Coaching");
    await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(1);
    await page.getByLabel("Category", { exact: true }).selectOption("");
    await page.getByLabel("Ownership style").selectOption("owner-operator");
    expect(await page.locator('article[aria-label$=" brand card"]').count()).toBeGreaterThan(0);
    await page.getByLabel("Ownership style").selectOption("");
    await page.getByLabel("Profile completeness").selectOption("unknown-not-reviewed");
    await expect(page.getByRole("heading", { name: "No profiles match these filters" })).toBeVisible();
    await page.getByLabel("Profile completeness").selectOption("");
    await page.getByRole("link", { name: "Open ERA Group Brand Profile" }).click();
    await expect(page).toHaveURL(/\/crm\/brands\/brand_[a-f0-9]+$/);
    await expect(page.getByText("Local demo profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Developing profile", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("22 of 34 core facts known", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "What this business actually does" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Key diligence gaps" })).toBeVisible();
    await expect(page.getByText("Existing IFPG demo profile", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Unknown — not yet reviewed", { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`era-${width}.png`), fullPage: true });
    await page.locator("main").getByRole("link", { name: "Brand Intelligence", exact: true }).click();
    await expect(page).toHaveURL(/\/crm\/brands$/);
    await page.getByRole("link", { name: "Open RouteWise Mobile Services Brand Profile" }).click();
    await expect(page).toHaveURL(/\/crm\/brands\/brand_[a-f0-9]+$/);
    await expect(page.getByRole("heading", { name: "RouteWise Mobile Services", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`routewise-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  for (let i = 0; i < slugs.length; i++) {
    const expected = await new BrandIntelligenceRuntime().getById(slugs[i]);
    expect(expected).not.toBeNull();
    await page.goto(`/crm/brands/${slugs[i]}`);
    await expect(page.getByRole("heading", { name: brands[i], exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What this business actually does" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why FranGroove believes these facts" })).toBeVisible();
    await expect(page.getByText(expected!.consultantIntelligence.businessSummary.value!, { exact: true })).toBeVisible();
    await expect(page.getByText(`${expected!.completeness.knownFields} of ${expected!.completeness.totalFields} core facts known`, { exact: false }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/canonical facts|weighted coverage|database|service.role/i);
  }
  expect(errors).toEqual([]);
});

test("unknown and temporarily inaccessible persisted profiles return 404 without demo fallback", async ({ page }) => {
  await login(page);
  expect((await page.goto("/crm/brands/unknown-brand"))?.status()).toBe(404);
  const admin = createClient(endpoint, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  // Local-only access mutation proves the actual page reads persistence. Restore even on failure.
  const { error } = await admin.from("brand_identities").update({ visibility: "restricted" }).eq("slug", "era-group");
  expect(error).toBeNull();
  try {
    expect((await page.goto("/crm/brands/era-group"))?.status()).toBe(404);
    await page.goto("/crm/brands");
    await expect(page.locator('article[aria-label$=" brand card"]')).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "ERA Group", exact: true })).toHaveCount(0);
  } finally {
    const restored = await admin.from("brand_identities").update({ visibility: "shared" }).eq("slug", "era-group");
    expect(restored.error).toBeNull();
  }
});

test("repository failure shows a safe boundary and retry recovers persisted content", async ({ page }) => {
  await login(page);
  // Fixed local Docker target only. Restore the migration's grant even if assertions fail.
  const sql = (statement: string) => execFileSync("docker", ["exec", "supabase_db_franchiseready-web", "psql", "-U", "postgres", "-d", "postgres", "-X", "-v", "ON_ERROR_STOP=1", "-c", statement], { windowsHide: true, stdio: "pipe" });
  sql("REVOKE SELECT ON public.brand_fact_definitions FROM authenticated");
  try {
    for (const route of ["/crm/brands", "/crm/brands/era-group"]) {
      await page.goto(route);
      await expect(page.locator('section[role="alert"]')).toContainText("We could not load Brand Intelligence.");
      await expect(page.locator("body")).not.toContainText(/permission denied|brand_fact_definitions|42501|Supabase/i);
      await expect(page.getByRole("heading", { name: "ERA Group", exact: true })).toHaveCount(0);
    }
  } finally {
    sql("GRANT SELECT ON public.brand_fact_definitions TO authenticated");
  }
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ERA Group", exact: true })).toBeVisible();
  await expect(page.getByText("Local demo profile", { exact: true })).toBeVisible();
});
