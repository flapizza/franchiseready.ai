import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['account-security.spec.ts', 'owner-login-navigation.spec.ts'],
  workers: 1,
  fullyParallel: false,
  timeout: 90000,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'off', screenshot: 'off', video: 'off' },
  webServer: { cwd: process.cwd(), command: 'node node_modules/next/dist/bin/next start -p 3000', url: 'http://127.0.0.1:3000/login', reuseExistingServer: false, timeout: 120000 },
});
