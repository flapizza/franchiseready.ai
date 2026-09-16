import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /Enter Conference Demo as/i }).click();
  await expect(page).toHaveURL(/\/crm$/);
  await page.goto('/crm/campaigns/new?audience=list&id=list_demo_newsletter');
  await expect(page.getByRole('textbox', { name: 'Email canvas' })).toBeVisible();
}
async function save(page: Page) {
  await page.getByLabel('Campaign name').fill('Composer workspace proof');
  await page.getByLabel('Subject line').fill('Hello {{first_name}}');
  await page.getByLabel('Sender display name').fill('Alex Morgan');
  await page.getByLabel('Reply-to address').fill('alex@example.test');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  await expect(page).toHaveURL(/\/crm\/campaigns\/camp_/);
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();
}

test('composer layouts, collapse, preview and unsaved exit preserve the live editor', async ({ page }, info) => {
  await enter(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  expect((await page.locator('#composer-controls').boundingBox())!.width).toBe(280);
  await page.screenshot({ path: info.outputPath('composer-controls-open.png') });
  const canvas = page.getByRole('textbox', { name: 'Email canvas' });
  await canvas.fill('My unsaved email');
  await canvas.press('Control+a');
  await page.getByRole('button', { name: 'Bold', exact: true }).click();
  for (const width of [1440, 1280, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('[data-app-sidebar]')).toBeHidden();
    await expect(page.locator('[data-app-topbar]')).toBeHidden();
    await page.getByRole('button', { name: 'Hide controls', exact: true }).click();
    await expect(canvas).toContainText('My unsaved email');
    const observations = await page.locator('.studio-canvas').evaluate(el => ({ width: el.getBoundingClientRect().width, top: el.getBoundingClientRect().top, overflow: document.documentElement.scrollWidth > innerWidth }));
    expect(observations.width).toBeLessThanOrEqual(600);
    if (width >= 1024) expect(observations.width).toBe(600);
    expect(observations.overflow).toBe(false);
    expect(observations.top).toBeLessThan(480);
    await page.screenshot({ path: info.outputPath(`composer-${width}.png`) });
    await info.attach(`layout-${width}`, { body: JSON.stringify(observations), contentType: 'application/json' });
    await page.getByRole('button', { name: 'Show controls', exact: true }).click();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Preview email', exact: true }).click();
  await expect(canvas).toBeHidden();
  await page.getByRole('button', { name: 'Mobile preview', exact: true }).click();
  expect((await page.locator('iframe').boundingBox())!.width).toBeLessThanOrEqual(390);
  await page.getByText('Plain-text alternative', { exact: true }).click();
  await expect(page.locator('pre')).toContainText('My unsaved email');
  await page.getByRole('button', { name: 'Desktop preview', exact: true }).click();
  await page.getByRole('button', { name: 'Back to editing', exact: true }).click();
  await expect(canvas).toBeFocused();
  await expect(canvas.locator('strong')).toHaveText('My unsaved email');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(canvas.locator('strong')).toHaveCount(0);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect(canvas.locator('strong')).toHaveText('My unsaved email');
  page.once('dialog', d => d.dismiss());
  await page.getByRole('link', { name: 'Back to Marketing' }).click();
  await expect(canvas).toBeVisible();
  page.once('dialog', d => d.accept());
  await page.getByRole('link', { name: 'Back to Marketing' }).click();
  await expect(page).toHaveURL(/\/crm\/campaigns$/);
  await expect(page.locator('[data-app-sidebar]')).toBeVisible();
  await expect(page.locator('[data-app-topbar]')).toBeVisible();
});

test('saved delivery controls retain state and confirmations with browser-only action mocks', async ({ page }) => {
  await enter(page);
  await save(page);
  const requests: unknown[][] = [];
  let response: object | undefined;
  // Fulfilled entirely in the browser: no delivery action reaches the server.
  await page.route('**/crm/campaigns/camp_*', async route => {
    if (route.request().method() !== 'POST' || !response) return route.continue();
    requests.push(JSON.parse(route.request().postData()!));
    const value = response; response = undefined;
    await route.fulfill({ contentType: 'text/x-component', body: `0:{"a":"$@1","b":"local-mock","f":[]}\n1:${JSON.stringify(value)}\n` });
  });
  await page.getByRole('button', { name: 'Send Test Email', exact: true }).click();
  await page.getByLabel('Test recipient').fill('local@example.test');
  await page.getByRole('button', { name: 'Hide controls', exact: true }).click();
  await page.getByRole('button', { name: 'Show controls', exact: true }).click();
  await expect(page.getByLabel('Test recipient')).toHaveValue('local@example.test');
  response = { ok: false, error: 'Local mock: no submission' };
  await page.getByRole('button', { name: 'Send this test email', exact: true }).click();
  await expect(page.getByRole('alert').filter({hasText:'Local mock'})).toContainText('Local mock');
  await page.getByRole('button', { name: 'Preview email', exact: true }).click();
  await page.getByRole('button', { name: 'Back to editing', exact: true }).click();
  response = { ok: false, error: 'Local mock: same request retained' };
  await page.getByRole('button', { name: 'Send this test email', exact: true }).click();
  await expect(page.getByRole('alert').filter({hasText:'Local mock'})).toContainText('same request retained');
  expect(requests[0]).toEqual(requests[1]);
  await page.getByRole('button', { name: 'Send Test Email', exact: true }).click();
  response = { ok: true, review: { campaignName: 'Composer workspace proof', subject: 'Hello Jordan', senderName: 'Alex Morgan', audienceLabel: 'Local fixture', eligible: 1, matching: 1, complianceReady: true, reviewToken: 'local-review' } };
  await page.getByRole('button', { name: 'Review Audience', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm and send now', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(requests).toHaveLength(3);
  await page.getByRole('textbox', { name: 'Email canvas' }).fill('New unsaved content');
  await expect(page.getByRole('button', { name: 'Send Test Email', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Review Audience', exact: true })).toBeDisabled();
});

test('media selection and branding controls use local UI fixtures', async ({ page }) => {
  const asset = { public_id: 'asset_' + 'a'.repeat(32), default_alt: 'Local image', width: 120, height: 120, thumbnailUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' };
  const branding = { version: 1, name: 'Alex Morgan', title: 'Consultant', company: 'Local company', email: 'alex@example.test', phone: '', postalAddress: '100 Local Street', font: 'arial', primaryColor: '#172033', accentColor: '#2563eb', logo: null, headshot: null, website: '', linkedIn: '', scheduling: '' };
  await page.route('**/api/marketing/media', route => route.fulfill({ json: { assets: [asset] } }));
  await page.route('**/crm/campaigns/new**', async route => {
    if (route.request().method() !== 'POST' || route.request().postData() !== '[]') return route.continue();
    await route.fulfill({ contentType: 'text/x-component', body: `0:{"a":"$@1","b":"local-mock","f":[]}\n1:${JSON.stringify({ ok: true, branding, canManage: true })}\n` });
  });
  await enter(page);
  await page.getByText('Company branding & signature', { exact: true }).click();
  await expect(page.getByLabel('Sender postal address')).toHaveValue('100 Local Street');
  await page.getByRole('button', { name: 'Choose company logo', exact: true }).click();
  await page.getByRole('button', { name: 'Select image 1', exact: true }).click();
  await expect(page.getByText('Company logo selected', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Media library', exact: true }).click();
  await page.getByRole('button', { name: 'Select image 1', exact: true }).click();
  const canvas = page.getByRole('textbox', { name: 'Email canvas' });
  await expect(canvas.locator('.studio-image')).toHaveCount(1);
  await page.getByRole('button', { name: 'Hide controls', exact: true }).click();
  await page.getByRole('button', { name: 'Show controls', exact: true }).click();
  await expect(page.getByText('Company logo selected', { exact: true })).toBeVisible();
});

test('sent, sending and unsupported client document fixtures keep the CRM shell', async ({ page }) => {
  await enter(page); await save(page);
  const url = page.url();
  for (const status of ['sent', 'sending', 'unsupported']) {
    await page.route(url, async route => {
      const original = await route.fetch();
      let body = (await original.text()).replaceAll('\\"status\\":\\"draft\\"', `\\"status\\":\\"${status}\\"`);
      if (status === 'unsupported') body = body.replaceAll('\\"content\\":{\\"version\\":2', '\\"content\\":{\\"version\\":-1,\\"original\\":{}');
      await route.fulfill({ response: original, body });
    });
    await page.goto(url);
    await expect(page.getByText(status === 'unsupported' ? 'This document needs a compatible editor' : 'Campaign history · Read-only', { exact: true })).toBeVisible();
    await expect(page.locator('[data-campaign-composer]')).toHaveCount(0);
    await expect(page.locator('[data-app-sidebar]')).toBeVisible();
    await page.unroute(url);
  }
});


for (const width of [1440, 390]) {
  test('exclusive delivery panels and close focus at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await enter(page); await save(page);
    const testTrigger = page.getByRole('button', { name: 'Send Test Email', exact: true });
    const reviewTrigger = page.getByRole('button', { name: 'Review Audience', exact: true });
    const testClose = page.getByRole('button', { name: 'Close test email panel' });
    const reviewClose = page.getByRole('button', { name: 'Close audience review panel' });
    const recipient = page.getByLabel('Test recipient');
    const testRequests: unknown[] = [];
    await page.route('**/crm/campaigns/camp_*', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const args = JSON.parse(route.request().postData()!);
      const isTest = typeof args[0] === 'object' && 'recipient' in args[0];
      if (isTest) testRequests.push(args[0]);
      const value = isTest ? { ok: false, error: 'Local mock: no submission' } : { ok: true, review: {
        campaignName: 'Composer workspace proof', subject: 'Hello Jordan', senderName: 'Alex Morgan',
        audienceLabel: 'Local fixture', eligible: 1, matching: 1, complianceReady: true, reviewToken: 'local-review',
      } };
      await route.fulfill({ contentType: 'text/x-component', body: '0:{"a":"$@1","b":"local-mock","f":[]}\n1:' + JSON.stringify(value) + '\n' });
    });
    await testTrigger.click();
    await expect(testClose).toBeFocused();
    await expect(testClose).toBeInViewport();
    await recipient.fill('local@example.test');
    await page.getByRole('button', { name: 'Send this test email', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Local mock' })).toBeVisible();
    // No manual close between the two trigger clicks.
    await reviewTrigger.click();
    await expect(reviewClose).toBeFocused();
    await expect(reviewClose).toBeInViewport();
    await expect(recipient).toBeHidden();
    await expect(page.getByRole('button', { name: 'Send this test email', exact: true })).toHaveCount(0);
    await expect(testTrigger).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Confirm and send now', exact: true })).toBeFocused();
    await testTrigger.click();
    await expect(testClose).toBeFocused();
    await expect(page.getByRole('button', { name: 'Confirm and send now', exact: true })).toHaveCount(0);
    await expect(recipient).toHaveValue('local@example.test');
    await page.keyboard.press('Tab');
    await expect(recipient).toBeFocused();
    await page.getByRole('button', { name: 'Send this test email', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Local mock' })).toBeVisible();
    expect(testRequests).toHaveLength(2);
    expect(testRequests[1]).toEqual(testRequests[0]);
    await testClose.focus(); await page.keyboard.press('Enter');
    await expect(testTrigger).toBeFocused();
    await expect(recipient).toBeHidden();
    await reviewTrigger.click();
    await expect(reviewClose).toBeFocused();
    await expect(reviewClose).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.keyboard.press('Enter');
    await expect(reviewTrigger).toBeFocused();
    await expect(page.getByRole('button', { name: 'Confirm and send now', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
