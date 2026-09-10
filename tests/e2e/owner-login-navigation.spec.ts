import { test, expect } from '@playwright/test';

// Opt-in, real local Auth login: no injected cookies, API login or storage state.
test.describe('owner login navigation', () => {
  test.skip(!process.env.LOCAL_OWNER_LOGIN_PASSWORD, 'Requires the isolated local owner-login runner.');

  test('plain form login opens the application and supports protected navigation', async ({ page, context }) => {
    expect(['127.0.0.1', 'localhost']).toContain(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname);
    expect(await context.cookies()).toEqual([]);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env.LOCAL_OWNER_LOGIN_EMAIL!);
    await page.getByLabel('Password').fill(process.env.LOCAL_OWNER_LOGIN_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/crm$/);
    await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
    for (const path of ['/crm/contacts', '/crm/candidates', '/crm/brands', '/crm/campaigns', '/settings/profile']) {
      await page.locator(`a[href="${path}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
    await page.goto('/login');
    await expect(page).toHaveURL(/\/crm$/);
    expect(errors).toEqual([]);
  });

  test('a protected destination survives real form login', async ({ page }) => {
    await page.goto('/crm/contacts');
    await expect(page).toHaveURL(/\/login\?next=%2Fcrm%2Fcontacts$/);
    await page.getByLabel('Email address').fill(process.env.LOCAL_OWNER_LOGIN_EMAIL!);
    await page.getByLabel('Password').fill(process.env.LOCAL_OWNER_LOGIN_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/crm\/contacts$/);
    await expect(page.getByRole('button', { name: 'Sign Out', exact: true })).toBeVisible();
  });
});
