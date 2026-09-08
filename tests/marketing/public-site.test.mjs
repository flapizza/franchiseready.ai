import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
const origin = process.env.MARKETING_TEST_URL ?? "http://127.0.0.1:3200";
test("public marketing layout, links, metadata, and server route isolation", async () => {
 const browser = await chromium.launch();
 try {
  for (const width of [390, 1440]) {
   const page = await browser.newPage({ viewport: { width, height: 900 } });
   const errors = [];
   page.on("pageerror", e => errors.push(e.message));
   page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
   const response = await page.goto(origin);
   assert.equal(response.status(), 200);
   await page.waitForLoadState("networkidle");
   assert.match(await page.title(), /FranGroove/);
   assert.ok(await page.locator("h1").evaluate(n => parseFloat(getComputedStyle(n).fontSize) >= 36), "Marketing typography must be styled");
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://frangroove.com');
   assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow');
   const text = await page.locator('body').innerText();
   assert.match(text, /franchise consultants/i);
   assert.match(text, /controlled rollout/i);
   assert.doesNotMatch(text, /hello@franchiseready|Schedule Instantly|30-minute personalized demo/);
   assert.equal(await page.locator('form').count(), 0);
   const links = await page.locator('a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
   assert.ok(links.includes('https://app.frangroove.com/login'));
   assert.ok(links.every(h => h === '/' || h.startsWith('#') || h === 'https://app.frangroove.com/login'));
   for (const hash of links.filter(h => h.startsWith('#'))) assert.equal(await page.locator(hash).count(), 1, hash);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
   assert.equal(await page.locator('img').evaluateAll(nodes => nodes.filter(n => !n.complete || !n.naturalWidth).length), 0);
   assert.deepEqual(errors, []);
   if(process.env.MARKETING_SCREENSHOT_DIR) await page.screenshot({path:`${process.env.MARKETING_SCREENSHOT_DIR}/marketing-${width}.png`,fullPage:true});
   await page.close();
  }
  const page = await browser.newPage();
  const paths = ['/login','/signup','/crm','/crm/contacts','/crm/candidates','/crm/brands','/crm/campaigns','/assessment','/assessment/invitation/example','/discovery','/settings/profile','/api/health','/api/internal/campaign-delivery','/api/webhooks/resend','/unsubscribe/example'];
  for (const path of paths) {
   const r = await page.request.get(origin + path, {maxRedirects:0});
   assert.equal(r.status(),404,path);
  }
  const demo = await page.goto(origin+'/request-demo');
  assert.equal(demo.status(),200);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://frangroove.com/request-demo');
  assert.equal(await page.locator('form').count(),0);
  assert.match(await page.locator('body').innerText(),/not open yet/);
 } finally {await browser.close();}
});
