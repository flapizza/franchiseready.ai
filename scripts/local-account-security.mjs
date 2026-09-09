import { execFileSync, spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const status = JSON.parse(execFileSync('cmd.exe', ['/d', '/s', '/c', 'npx supabase status --output json'], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }));
if (!['localhost', '127.0.0.1'].includes(new URL(status.API_URL).hostname)) throw new Error('Local Supabase required');
// Optional temporary loopback forwards when Windows reserves the CLI's ports.
if (process.argv.includes('--forwarded-ports')) {
  status.API_URL = 'http://127.0.0.1:15421';
  status.INBUCKET_URL = 'http://127.0.0.1:15424';
}
const email = 'account-security-local@example.test';
const password = 'Local-security-initial-2026!';
const auth = { persistSession: false, autoRefreshToken: false };
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, { auth });
const users = await admin.auth.admin.listUsers({ perPage: 1000 });
if (users.error) throw new Error('Local users unavailable');
const user = users.data.users.find((entry) => entry.email === email);
const setup = user ? await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true }) : await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (setup.error) throw new Error('Local fixture setup failed');
const client = createClient(status.API_URL, status.ANON_KEY, { auth });
if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('Local login failed');
if ((await client.rpc('bootstrap_first_workspace', { proposed_organization_name: 'Account Security Local', proposed_consultant_display_name: 'Security Tester' })).error) throw new Error('Local workspace fixture failed');
const membershipSnapshot = async () => {
  const result = await client.from('organization_memberships').select('id,organization_id,user_id,role,status').eq('user_id', setup.data.user.id).order('id');
  if (result.error) throw new Error('Local membership verification failed');
  return JSON.stringify(result.data);
};
const originalMembership = await membershipSnapshot();
await client.auth.signOut();
const env = { ...process.env, NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: '', APP_URL: 'http://127.0.0.1:3000', PERSISTENCE_MODE: 'supabase', PLAYWRIGHT_TEST_MODE: 'true', CONFERENCE_DEMO_ACCESS: 'false', RESEND_API_KEY: '', RESEND_FROM_EMAIL: '', RESEND_WEBHOOK_SECRET: '', LOCAL_OWNER_LOGIN_EMAIL: email, LOCAL_OWNER_LOGIN_PASSWORD: password, LOCAL_AUTH_MAIL_URL: status.INBUCKET_URL ?? 'http://127.0.0.1:54324' };
const run = (module, args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [module, ...args], { env, stdio: 'inherit', windowsHide: true });
  child.on('error', reject);
  child.on('exit', (code) => resolve(code ?? 1));
});
if (!process.argv.includes('--skip-build')) {
  const result = await run('node_modules/next/dist/bin/next', ['build']);
  if (result) process.exit(result);
}
function checkBrowserAssets(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checkBrowserAssets(path);
    else if (entry.name.endsWith('.js') && readFileSync(path, 'utf8').includes(status.SERVICE_ROLE_KEY)) throw new Error('Privileged credential found in browser assets');
  }
}
checkBrowserAssets('.next/static');
console.log('LOCAL_SERVICE_ROLE_ABSENT_FROM_BROWSER_ASSETS');
const browserResult = await run('node_modules/@playwright/test/cli.js', ['test', '--config=tests/account-security.config.ts']);
if (browserResult) process.exit(browserResult);
const finalLogin = await client.auth.signInWithPassword({ email, password });
if (finalLogin.error || finalLogin.data.user.id !== setup.data.user.id || await membershipSnapshot() !== originalMembership) throw new Error('Local account identity or membership changed');
await client.auth.signOut();
console.log('LOCAL_AUTH_IDENTITY_AND_WORKSPACE_MEMBERSHIP_UNCHANGED');
