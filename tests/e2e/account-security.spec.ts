import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
const email = process.env.LOCAL_OWNER_LOGIN_EMAIL!;
const initial = process.env.LOCAL_OWNER_LOGIN_PASSWORD!;
const changed = 'Local-security-changed-2026!';
async function login(page: Page, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}
async function passwordFields(page: Page, password: string) {
  await page.getByLabel('New password', { exact: true }).fill(password);
  await page.getByLabel('Confirm new password', { exact: true }).fill(password);
}

test('local password change and recovery preserve identity and login navigation', async ({ page }) => {
  expect(['127.0.0.1', 'localhost']).toContain(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname);
  const errors: string[] = [];
  page.on('pageerror', () => errors.push('pageerror'));
  page.on('console', message => { if (message.type() === 'error') errors.push('console error'); });
  await page.goto('/settings/security');
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings%2Fsecurity$/);
  await login(page, initial);
  await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/settings/profile');
  await page.getByRole('navigation', { name: 'Settings navigation' }).getByRole('link', { name: 'Security', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Security', exact: true })).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('button', { name: 'Change Password', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/security-${width}.png`, fullPage: true });
  }
  await page.getByLabel('Current password', { exact: true }).fill('Wrong-local-password!');
  await passwordFields(page, changed);
  await page.getByRole('button', { name: 'Change Password', exact: true }).click();
  await expect(page.getByText('We could not verify your current password. Please try again.')).toBeVisible();
  await page.getByLabel('Current password', { exact: true }).fill(initial);
  await passwordFields(page, changed);
  await page.getByRole('button', { name: 'Change Password', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?password=updated$/);
  await expect(page.getByRole('status')).toContainText('Your password has been updated');
  await login(page, initial);
  await expect(page.getByText('We could not sign you in with those details. Please try again.')).toBeVisible();
  await login(page, changed);
  await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/auth/update-password');
  await expect(page.getByRole('alert').filter({ hasText: 'This recovery link' })).toContainText('invalid or has expired');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/crm');
  await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await page.goto('/settings/security');
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByRole('link', { name: 'Forgot password?', exact: true }).click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ path: `test-results/forgot-password-${width}.png`, fullPage: true });
  }
  await page.getByLabel('Email address').fill('account-security-absent@example.test');
  await page.getByRole('button', { name: 'Send reset instructions' }).click();
  await expect(page.getByRole('status')).toContainText('If an account exists');
  const neutralResponse = await page.getByRole('status').textContent();
  const mailOrigin = process.env.LOCAL_AUTH_MAIL_URL!;
  expect(['localhost', '127.0.0.1']).toContain(new URL(mailOrigin).hostname);
  const previousMail = await (await fetch(`${mailOrigin}/api/v1/messages`)).json();
  const previousIds = new Set(previousMail.messages.map((message: { ID: string }) => message.ID));
  await page.getByLabel('Email address').fill(email);
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/forgot-password'),
    page.getByRole('button', { name: 'Send reset instructions' }).click(),
  ]);
  await expect(page.getByRole('status')).toContainText('If an account exists');
  expect(await page.getByRole('status').textContent()).toBe(neutralResponse);

  let recoveryLink = '';
  await expect.poll(async () => {
    const response = await fetch(`${mailOrigin}/api/v1/messages`);
    const { messages } = await response.json() as { messages: { ID: string; Subject: string; To: { Address: string }[] }[] };
    const message = messages.find(entry => !previousIds.has(entry.ID) && /reset/i.test(entry.Subject) && entry.To.some(recipient => recipient.Address === email));
    if (!message) return false;
    const body = await (await fetch(`${mailOrigin}/api/v1/message/${message.ID}`)).json();
    recoveryLink = String(body.HTML).match(/href="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&') ?? '';
    return !!recoveryLink;
  }, { timeout: 15000 }).toBe(true);
  expect(['localhost', '127.0.0.1']).toContain(new URL(recoveryLink).hostname);
  // Same local Auth instance, optionally exposed through a temporary host port.
  const authLink = new URL(recoveryLink);
  const localApi = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  authLink.host = localApi.host;
  recoveryLink = authLink.href;
  try { await page.goto(recoveryLink); } catch { throw new Error('Local recovery navigation failed; link withheld'); }
  await expect(page.getByRole('button', { name: 'Update Password', exact: true })).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/recovery-${width}.png`, fullPage: true });
  }
  await passwordFields(page, initial);
  await page.getByRole('button', { name: 'Update Password', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?password=updated$/);
  await login(page, changed);
  await expect(page.getByText('We could not sign you in with those details. Please try again.')).toBeVisible();
  await login(page, initial);
  await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/auth/callback?code=invalid&next=/.//example.invalid');
  expect(new URL(page.url()).origin).toBe('http://127.0.0.1:3000');
  await expect(page.getByRole('alert').filter({ hasText: 'This recovery link' })).toContainText('invalid or has expired');
  expect(errors).toEqual([]);
});

test('explicit local next survives login and malicious next stays on origin', async ({ page }) => {
  await page.goto('/crm/contacts');
  await expect(page).toHaveURL(/\/login\?next=%2Fcrm%2Fcontacts$/);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(initial);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/crm\/contacts$/);
  await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await page.goto('/login?next=%2F.%2F%2Fexample.invalid');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(initial);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await page.goto('/crm');
  await expect(page).toHaveURL(/\/crm$/);
});
