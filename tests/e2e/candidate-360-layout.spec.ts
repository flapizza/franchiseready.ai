import { expect, test, type Page } from "@playwright/test";

async function enterDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
}

async function expectViewportFill(page: Page) {
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    const shell = rect("[data-app-shell]"); const sidebar = rect("[data-app-sidebar]"); const topbar = rect("[data-app-topbar]"); const scroll = rect("[data-workspace-scroll]");
    const scrollStyle = getComputedStyle(document.querySelector("[data-workspace-scroll]")!);
    const surfaceStyle = getComputedStyle(document.querySelector("[data-workspace-surface]")!);
    return { viewportHeight: window.innerHeight, shellTop: shell.top, shellBottom: shell.bottom, sidebarTop: sidebar.top, sidebarBottom: sidebar.bottom, topbarBottom: topbar.bottom, scrollTop: scroll.top, scrollBottom: scroll.bottom, scrollOverflow: scrollStyle.overflowY, surfaceOverflow: surfaceStyle.overflowY };
  });
  expect(Math.abs(geometry.shellTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.shellBottom - geometry.viewportHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.sidebarTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.sidebarBottom - geometry.viewportHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.scrollTop - geometry.topbarBottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.scrollBottom - geometry.viewportHeight)).toBeLessThanOrEqual(1);
  expect(geometry.scrollOverflow).toBe("auto");
  expect(geometry.surfaceOverflow).toBe("visible");
}

async function expectSingleScrollOwner(page: Page) {
  const scroll = page.locator("[data-workspace-scroll]");
  await scroll.hover();
  await page.mouse.wheel(0, 1100);
  await expect.poll(() => scroll.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const state = await page.evaluate(() => {
    const shell = document.querySelector("[data-app-shell]")!.getBoundingClientRect(); const sidebar = document.querySelector("[data-app-sidebar]")!.getBoundingClientRect(); const topbar = document.querySelector("[data-app-topbar]")!.getBoundingClientRect(); const main = document.querySelector("[data-workspace-scroll]")!; const mainRect = main.getBoundingClientRect();
    return { innerHeight: window.innerHeight, windowScrollY: window.scrollY, documentScrollTop: document.documentElement.scrollTop, bodyScrollTop: document.body.scrollTop, documentScrollHeight: document.documentElement.scrollHeight, bodyScrollHeight: document.body.scrollHeight, htmlOverflow: getComputedStyle(document.documentElement).overflowY, bodyOverflow: getComputedStyle(document.body).overflowY, mainScrollTop: main.scrollTop, shellBottom: shell.bottom, sidebarTop: sidebar.top, sidebarBottom: sidebar.bottom, topbarTop: topbar.top, topbarPosition: getComputedStyle(document.querySelector("[data-app-topbar]")!).position, mainBottom: mainRect.bottom };
  });
  expect(state.windowScrollY).toBe(0);
  expect(state.documentScrollTop).toBe(0);
  expect(state.bodyScrollTop).toBe(0);
  expect(state.htmlOverflow).toBe("hidden");
  expect(state.bodyOverflow).toBe("hidden");
  expect(Math.abs(state.documentScrollHeight - state.innerHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.bodyScrollHeight - state.innerHeight)).toBeLessThanOrEqual(1);
  expect(state.mainScrollTop).toBeGreaterThan(0);
  expect(Math.abs(state.shellBottom - state.innerHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.sidebarTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.sidebarBottom - state.innerHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.mainBottom - state.innerHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(state.topbarTop)).toBeLessThanOrEqual(1);
  expect(state.topbarPosition).toBe("static");
}

test("Candidate 360 keeps workspace background light through its final padding", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await enterDemo(page);
  await page.goto("/crm/candidates/candidate-demo");

  await expect(page.getByRole("heading", { name: "John Smith" })).toBeVisible();
  const shell = page.locator("[data-app-shell]");
  const sidebar = page.locator("[data-app-sidebar]");
  const scroll = page.locator("[data-workspace-scroll]");
  const surface = page.locator("[data-workspace-surface]");
  const hero = page.locator("[data-candidate-hero]");
  const finalSection = page.locator("[data-candidate-final-section]");

  await expect(shell).toHaveClass(/bg-slate-100/);
  await expect(scroll).toHaveClass(/bg-slate-100/);
  await expect(surface).toHaveClass(/bg-slate-100/);
  await expect(sidebar).toHaveClass(/bg-slate-950/);
  expect(await shell.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(await sidebar.evaluate((element) => getComputedStyle(element).backgroundColor));
  await expect.poll(() => hero.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("gradient");
  await expectViewportFill(page);
  await expectSingleScrollOwner(page);

  const dimensions = await scroll.evaluate((element) => ({ scrollHeight: element.scrollHeight, clientHeight: element.clientHeight }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  await finalSection.scrollIntoViewIfNeeded();
  const bottomGap = await page.evaluate(() => {
    const finalCard = document.querySelector("[data-candidate-final-section]")!.getBoundingClientRect();
    const workspace = document.querySelector("[data-workspace-surface]")!.getBoundingClientRect();
    return workspace.bottom - finalCard.bottom;
  });
  expect(bottomGap).toBeGreaterThanOrEqual(32);
  expect(bottomGap).toBeLessThanOrEqual(96);

  await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(finalSection).toBeVisible();
  await expect(surface).toHaveClass(/bg-slate-100/);
  expect(errors, errors.join("\n")).toEqual([]);
});

test("Candidate 360 height chain fills short and common desktop viewports", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await enterDemo(page);
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1600, height: 900 }, { width: 1366, height: 768 }, { width: 1366, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/crm/candidates/david-thompson");
    await expect(page.getByRole("heading", { name: "David Thompson" })).toBeVisible();
    await expectViewportFill(page);
    await expectSingleScrollOwner(page);
    const frame = await page.locator("[data-workspace-frame]").evaluate((element) => ({ height: element.getBoundingClientRect().height, parentHeight: element.parentElement!.getBoundingClientRect().height }));
    expect(frame.height + 1).toBeGreaterThanOrEqual(frame.parentHeight);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test("authenticated workspaces never hand vertical scrolling to the document", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await enterDemo(page);

  for (const path of [
    "/crm",
    "/crm/candidates",
    "/crm/tasks",
    "/crm/candidates/candidate-demo",
    "/crm/discovery",
    "/crm/strategy",
    "/crm/brands",
    "/crm/referrals",
    "/settings/profile",
  ]) {
    await page.goto(path);
    const main = page.locator("[data-workspace-scroll]");
    await expect(main).toBeVisible();
    await main.hover();
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
    const geometry = await page.evaluate(() => {
      const sidebar = document.querySelector("[data-app-sidebar]")!.getBoundingClientRect();
      const main = document.querySelector("[data-workspace-scroll]")!;
      return {
        windowScrollY: window.scrollY,
        documentScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop,
        documentScrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        mainScrollable: main.scrollHeight - main.clientHeight > 2,
        mainScrollTop: main.scrollTop,
        sidebarTop: sidebar.top,
        sidebarBottom: sidebar.bottom,
      };
    });
    expect(geometry.windowScrollY, path).toBe(0);
    expect(geometry.documentScrollTop, path).toBe(0);
    expect(geometry.bodyScrollTop, path).toBe(0);
    expect(Math.abs(geometry.documentScrollHeight - geometry.innerHeight), path).toBeLessThanOrEqual(1);
    if (geometry.mainScrollable) expect(geometry.mainScrollTop, path).toBeGreaterThan(0);
    expect(Math.abs(geometry.sidebarTop), path).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.sidebarBottom - geometry.innerHeight), path).toBeLessThanOrEqual(1);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});
