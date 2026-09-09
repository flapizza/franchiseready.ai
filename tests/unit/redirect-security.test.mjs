import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const constants = { AUTH_ROUTES: { home: '/', login: '/login', signup: '/signup' }, PROTECTED_ROUTE_PREFIXES: ['/crm', '/settings'] };
const context = { exports: {}, require: () => constants, URL };
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../../lib/auth/routes.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { getSafeReturnPath } = context.exports;
const origin = 'https://app.frangroove.com';

test('malicious and ambiguous redirects fall back and resolve on the application origin', () => {
  for (const input of ['//example.invalid', '/.//example.invalid', '/%2e//example.invalid', '/a/..//example.invalid', '\\example.invalid', '/\\example.invalid', '/%2f%2fexample.invalid', '/%5cexample.invalid', '/%252fexample.invalid', 'https://example.invalid/path', 'https://franchiseready.local/crm', 'javascript:alert(1)', ' /crm', '/\n/example.invalid', '/%00example.invalid', '/%zz', 'crm', null]) {
    const result = getSafeReturnPath(input);
    assert.equal(new URL(result, origin).origin, origin, String(input));
    assert.equal(result, '/', String(input));
  }
});

test('legitimate paths and query strings retain their final local destination', () => {
  for (const input of ['/crm', '/crm/brands', '/settings/security', '/auth/update-password', '/auth/confirm', '/login', '/crm?tab=active&label=hello%20world', '/crm?next=https%3A%2F%2Fexample.invalid']) {
    assert.equal(getSafeReturnPath(input), input);
    assert.equal(new URL(getSafeReturnPath(input), origin).href, origin + input);
  }
});

test('an unsafe fallback cannot bypass the local origin contract', () => {
  assert.equal(getSafeReturnPath(null, '//example.invalid'), '/');
  assert.equal(getSafeReturnPath(null, '/crm'), '/crm');
});
