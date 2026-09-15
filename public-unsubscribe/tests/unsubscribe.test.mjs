import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hashToken, isValidToken, unsubscribe } from "../lib/unsubscribe.ts";
import { readEnvironment } from "../lib/env.ts";
import { renderResponse } from "../lib/response.ts";

const VALID_TOKEN = "a".repeat(32);
const ENVIRONMENT = Object.freeze({
  supabaseUrl: "https://preview-project.supabase.co",
  supabasePublishableKey: "preview-publishable-key",
});

test("malformed, short, long, and illegal tokens are rejected before RPC", async () => {
  for (const token of ["", "a".repeat(31), "a".repeat(129), `${"a".repeat(31)}!`, "with spaces".padEnd(32, "a")]) {
    let calls = 0;
    const outcome = await unsubscribe(token, {
      environment: ENVIRONMENT,
      transport: async () => { calls += 1; return true; },
    });
    assert.equal(outcome, "unavailable");
    assert.equal(calls, 0);
  }
});

test("the exact existing token syntax and boundaries are accepted", () => {
  assert.equal(isValidToken("A0-".padEnd(32, "a")), true);
  assert.equal(isValidToken("Z".repeat(128)), true);
});

test("valid token is SHA-256 hashed and only token_digest reaches RPC", async () => {
  let received;
  const outcome = await unsubscribe(VALID_TOKEN, {
    environment: ENVIRONMENT,
    transport: async (_environment, input) => { received = input; return true; },
  });
  assert.equal(outcome, "success");
  assert.deepEqual(received, { token_digest: hashToken(VALID_TOKEN) });
  assert.equal(Object.keys(received).length, 1);
  assert.equal(JSON.stringify(received).includes(VALID_TOKEN), false);
});

test("default transport uses only the publishable apikey and digest payload", async (context) => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response("true", { status: 200, headers: { "content-type": "application/json" } });
  };
  context.after(() => { globalThis.fetch = originalFetch; });

  assert.equal(await unsubscribe(VALID_TOKEN, { environment: ENVIRONMENT }), "success");
  assert.equal(request.url, "https://preview-project.supabase.co/rest/v1/rpc/unsubscribe_marketing");
  assert.deepEqual(request.init.headers, {
    apikey: "preview-publishable-key",
    "content-type": "application/json",
  });
  assert.deepEqual(JSON.parse(request.init.body), { token_digest: hashToken(VALID_TOKEN) });
  assert.equal(request.init.credentials, "omit");
  assert.equal(request.init.cache, "no-store");
});

test("unknown, failed, and repeated RPC outcomes remain generic and idempotency-compatible", async () => {
  assert.equal(await unsubscribe(VALID_TOKEN, { environment: ENVIRONMENT, transport: async () => false }), "unavailable");
  assert.equal(await unsubscribe(VALID_TOKEN, { environment: ENVIRONMENT, transport: async () => { throw new Error("database details"); } }), "unavailable");
  assert.equal(await unsubscribe(VALID_TOKEN, { environment: ENVIRONMENT, transport: async () => true }), "success");
  assert.equal(await unsubscribe(VALID_TOKEN, { environment: ENVIRONMENT, transport: async () => true }), "success");
});

test("environment contract fails closed", () => {
  for (const source of [{}, { SUPABASE_URL: "https://preview.supabase.co" }, { SUPABASE_PUBLISHABLE_KEY: "key" }, { SUPABASE_URL: "not-a-url", SUPABASE_PUBLISHABLE_KEY: "key" }, { SUPABASE_URL: "http://preview.supabase.co", SUPABASE_PUBLISHABLE_KEY: "key" }]) {
    assert.throws(() => readEnvironment(source), /unavailable/);
  }
  assert.deepEqual(readEnvironment({ SUPABASE_URL: "https://preview.supabase.co", SUPABASE_PUBLISHABLE_KEY: "key" }), {
    supabaseUrl: "https://preview.supabase.co",
    supabasePublishableKey: "key",
  });
});

test("page responses are generic and never interpolate the raw token", async () => {
  const success = renderResponse("success");
  const unavailable = renderResponse("unavailable");
  assert.match(success, /You have been unsubscribed\./);
  assert.match(unavailable, /This link is unavailable\./);
  assert.doesNotMatch(success + unavailable, new RegExp(VALID_TOKEN));
  assert.doesNotMatch(success + unavailable, /contact|recipient|organization|email address/i);
});

test("public surface contains no protected application capability or forbidden credentials", async () => {
  const files = [
    "../app/layout.tsx",
    "../app/not-found.tsx",
    "../app/unsubscribe/[token]/page.tsx",
    "../lib/env.ts",
    "../lib/unsubscribe.ts",
    "../lib/response.ts",
    "../lib/one-click.ts",
    "../app/api/marketing/unsubscribe/[token]/route.ts",
    "../app/api/marketing/test-unsubscribe/[token]/route.ts",
    "../next.config.ts",
    "../proxy.ts",
  ];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), "utf8")))).join("\n");
  for (const forbidden of ["service_role", "RESEND_", "CAMPAIGN_DELIVERY", "VERCEL_AUTOMATION", "NEXT_PUBLIC_", "/crm", "/login", "createAdmin", "cookies("]) {
    assert.equal(source.includes(forbidden), false, `unexpected capability: ${forbidden}`);
  }
});
import { GET as testGet, POST as testPost } from '../app/api/marketing/test-unsubscribe/[token]/route.ts';
import { POST as normalPost } from '../app/api/marketing/unsubscribe/[token]/route.ts';
import { oneClick } from '../lib/one-click.ts';

const oneClickRequest = (body='List-Unsubscribe=One-Click') => new Request('https://public.example.test/unsubscribe', {method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});

test('public test GET/POST repeat safely through only the isolated RPC; normal POST uses normal consent RPC', async (context) => {
  const previous={fetch:globalThis.fetch,url:process.env.SUPABASE_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY};
  process.env.SUPABASE_URL=ENVIRONMENT.supabaseUrl;
  process.env.SUPABASE_PUBLISHABLE_KEY=ENVIRONMENT.supabasePublishableKey;
  const calls=[];
  globalThis.fetch=async(url,init)=>{calls.push({url,init});return Response.json(true);};
  context.after(()=>{globalThis.fetch=previous.fetch;for(const [key,value]of [['SUPABASE_URL',previous.url],['SUPABASE_PUBLISHABLE_KEY',previous.key]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  for(const handler of [testGet,testGet,testPost,testPost,normalPost,normalPost]){
    const response=await handler(oneClickRequest(),{params:Promise.resolve({token:VALID_TOKEN})});
    assert.equal(response.status,200);
    const body=await response.text();
    assert.match(body,handler===normalPost?/You have been unsubscribed/:/Test email acknowledged/);
    assert.ok(!body.includes(VALID_TOKEN));
    assert.equal(response.headers.get('set-cookie'),null);
    assert.match(response.headers.get('cache-control'),/no-store/);
  }
  assert.deepEqual(calls.map(c=>c.url.split('/').pop()),['unsubscribe_studio_test','unsubscribe_studio_test','unsubscribe_studio_test','unsubscribe_studio_test','unsubscribe_marketing','unsubscribe_marketing']);
  for(const call of calls){assert.deepEqual(JSON.parse(call.init.body),{token_digest:hashToken(VALID_TOKEN)});assert.equal(call.init.credentials,'omit');assert.equal(call.init.headers.authorization,undefined);}
});

test('one-click rejects invalid tokens, duplicate fields, wrong media types and oversized streams before RPC',async()=>{
  let calls=0;const apply=async()=>{calls++;return 'success';};
  for(const [raw,body,status]of [['bad','List-Unsubscribe=One-Click',400],[VALID_TOKEN,'List-Unsubscribe=No',400],[VALID_TOKEN,'List-Unsubscribe=One-Click&List-Unsubscribe=One-Click',400],[VALID_TOKEN,'List-Unsubscribe=One-Click&tenant=other',400],[VALID_TOKEN,'x'.repeat(1025),413]]){
    assert.equal((await oneClick(oneClickRequest(body),raw,apply)).status,status);
  }
  assert.equal((await oneClick(new Request('https://example.test',{method:'POST',body:'List-Unsubscribe=One-Click'}),VALID_TOKEN,apply)).status,400);
  assert.equal(calls,0);
});

test('one-click failures remain generic without reflecting tokens or backend details',async()=>{
  for(const apply of [async()=> 'unavailable',async()=>{throw Error('private tenant details');}]){
    const response=await oneClick(oneClickRequest(),VALID_TOKEN,apply,true);
    assert.equal(response.status,400);
    const body=await response.text();assert.doesNotMatch(body,/private tenant details/);assert.ok(!body.includes(VALID_TOKEN));
  }
});
