import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const path = resolve(file);
  const context = { exports: {}, URL, TextEncoder, FormData, Object, Date, process,
    require: (name) => {
      if (name in mocks) return mocks[name];
      if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`, mocks);
      if (name.startsWith('.')) return load(resolve(dirname(path), name), mocks);
      return require(name);
    },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports;
}
const validation = load('feature/auth/utils/validation.ts');
const { hasRecentRecoveryClaim } = load('feature/auth/utils/recovery-session.ts');
const form = (values) => { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; };
const values = { currentPassword: 'Old-password-123!', password: 'New-password-456!', confirmPassword: 'New-password-456!' };

test('password policy and confirmation reject invalid changes', () => {
  assert.equal(validation.changePasswordSchema.safeParse(values).success, true);
  assert.equal(validation.updatePasswordSchema.safeParse({ password: 'a'.repeat(11), confirmPassword: 'a'.repeat(11) }).success, false);
  assert.equal(validation.updatePasswordSchema.safeParse({ password: 'a'.repeat(12), confirmPassword: 'a'.repeat(12) }).success, true);
  for (const patch of [{ currentPassword: '' }, { password: 'short', confirmPassword: 'short' }, { confirmPassword: 'mismatch' }, { password: '        ', confirmPassword: '        ' }, { password: values.currentPassword, confirmPassword: values.currentPassword }, { password: '😀'.repeat(20), confirmPassword: '😀'.repeat(20) }]) {
    assert.equal(validation.changePasswordSchema.safeParse({ ...values, ...patch }).success, false);
  }
});

function fixture({ authenticated = true, wrong = false, otherUser = false, recovery = true, resetThrows = false, resetError = false, signOutError = false } = {}) {
  const calls = [];
  const user = { id: 'owner-a', email: 'owner@example.test' };
  const auth = {
    getUser: async () => ({ data: { user: authenticated ? user : null }, error: null }),
    getClaims: async () => ({ data: { claims: { sub: user.id, exp: Date.now() / 1000 + 3600, amr: [{ method: recovery ? 'recovery' : 'password', timestamp: Math.floor(Date.now() / 1000) }] } }, error: null }),
    signOut: async (options) => { calls.push(['signOut', options.scope]); return { error: signOutError ? {} : null }; },
    updateUser: async () => { calls.push(['update']); return { data: { user }, error: null }; },
    resetPasswordForEmail: async (_email, options) => { calls.push(['reset', options.redirectTo]); if (resetThrows) throw new Error('sensitive provider error'); return { error: resetError ? { message: 'account unknown' } : null }; },
  };
  const verifier = { auth: { ...auth, signInWithPassword: async (credentials) => {
    calls.push(['verify', credentials.email]);
    return { data: { user: wrong ? null : otherUser ? { id: 'owner-b' } : user, session: wrong ? null : {} }, error: wrong ? {} : null };
  } } };
  const mocks = {
    '@/lib/supabase/server': { createServerSupabaseClient: async () => ({ auth }) },
    '@/lib/env': { getPublicEnvironment: () => ({ APP_URL: 'https://app.frangroove.com', NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public' }) },
    '@supabase/supabase-js': { createClient: () => verifier },
    'next/navigation': { redirect: (path) => { throw new Error(`REDIRECT:${path}`); } },
  };
  return { calls, change: load('feature/auth/actions/change-password.ts', mocks).changePassword, ...load('feature/auth/actions/password-reset.ts', mocks) };
}

test('unauthenticated, wrong password, and mismatched identity cannot update', async () => {
  for (const options of [{ authenticated: false }, { wrong: true }, { otherUser: true }]) {
    const f = fixture(options);
    assert.equal((await f.change({}, form(values))).status, 'error');
    assert.equal(f.calls.some(([name]) => name === 'update'), false);
  }
  const f = fixture();
  const result = await f.change({}, form({ password: values.password, confirmPassword: values.confirmPassword }));
  assert.equal(result.status, 'error');
  assert.equal(f.calls.length, 0);
  assert.equal(JSON.stringify(result).includes(values.password), false);
});

test('successful change verifies the session email and signs out after update', async () => {
  const f = fixture();
  await assert.rejects(f.change({}, form({ ...values, email: 'attacker@example.test', userId: 'owner-b' })), /REDIRECT:\/login\?password=updated/);
  assert.equal(JSON.stringify(f.calls), JSON.stringify([['verify', 'owner@example.test'], ['update'], ['signOut', 'global'], ['signOut', 'local']]));
});

test('recovery requests are neutral for success, provider rejection, and transport failure', async () => {
  const messages = [];
  for (const options of [{}, { resetError: true }, { resetThrows: true }]) {
    const f = fixture(options);
    const result = await f.requestPasswordReset({}, form({ email: 'someone@example.test' }));
    assert.equal(result.status, 'success');
    messages.push(result.message);
    assert.equal(f.calls[0][1], 'https://app.frangroove.com/auth/callback?next=%2Fauth%2Fupdate-password');
    assert.doesNotMatch(JSON.stringify(result), /someone|sensitive|unknown/);
  }
  assert.equal(new Set(messages).size, 1);
});

test('recovery requires a recent verified recovery claim for the same user', () => {
  const now = Date.now();
  const claims = { sub: 'owner-a', exp: now / 1000 + 3600, amr: [{ method: 'recovery', timestamp: now / 1000 - 10 }] };
  assert.equal(hasRecentRecoveryClaim(claims, 'owner-a', now), true);
  assert.equal(hasRecentRecoveryClaim(claims, 'owner-b', now), false);
  assert.equal(hasRecentRecoveryClaim(claims, 'owner-a', now + 16 * 60 * 1000), false);
  assert.equal(hasRecentRecoveryClaim({ ...claims, exp: now / 1000 - 1 }, 'owner-a', now), false);
  assert.equal(hasRecentRecoveryClaim({ ...claims, amr: [{ method: 'password', timestamp: now / 1000 }] }, 'owner-a', now), false);
});

test('reset completion accepts recovery and denies ordinary or absent sessions', async () => {
  const valid = fixture();
  await assert.rejects(valid.updatePassword({}, form(values)), /REDIRECT:\/login\?password=updated/);
  assert.equal(valid.calls[0][0], 'update');
  for (const options of [{ recovery: false }, { authenticated: false }]) {
    const f = fixture(options);
    assert.equal((await f.updatePassword({}, form(values))).status, 'error');
    assert.equal(f.calls.length, 0);
  }
});

test('a sign-out failure after a password update still reports success and a safe continuation', async () => {
  for (const action of ['change', 'updatePassword']) {
    const f = fixture({ signOutError: true });
    const result = await f[action]({}, form(values));
    assert.equal(result.status, 'success');
    assert.match(result.message, /password has been updated/);
    assert.equal(JSON.stringify(result).includes(values.password), false);
  }
});

test('successful callbacks resolve malicious next values to the canonical application origin', async () => {
  const mocks = {
    '@/lib/env': { getPublicEnvironment: () => ({ APP_URL: 'https://app.frangroove.com' }) },
    '@/lib/supabase/server': { createServerSupabaseClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: null }) } }) },
    'next/server': { NextResponse: { redirect: (url) => new Response(null, { status: 303, headers: { location: url.href } }) } },
  };
  const { GET } = load('app/(public)/auth/callback/route.ts', mocks);
  for (const next of ['//example.invalid', '/.//example.invalid', '/%2e//example.invalid', '/\\example.invalid', '/%2fexample.invalid', 'https://example.invalid']) {
    const response = await GET(new Request(`https://spoofed.invalid/auth/callback?code=local-test&next=${encodeURIComponent(next)}`));
    assert.equal(new URL(response.headers.get('location')).origin, 'https://app.frangroove.com');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(response.headers.get('location'), /code=/);
  }
  const valid = await GET(new Request('https://app.frangroove.com/auth/callback?code=local-test&next=%2Fauth%2Fupdate-password'));
  assert.equal(valid.headers.get('location'), 'https://app.frangroove.com/auth/update-password');
  const invalid = await GET(new Request('https://app.frangroove.com/auth/callback?error=expired&error_description=sensitive'));
  assert.equal(invalid.headers.get('location'), 'https://app.frangroove.com/auth/update-password?error=invalid');
});
