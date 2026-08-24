import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 3100;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-layout", testMatch: /candidate-360-layout\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-calendar", testMatch: /calendar\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-team", testMatch: /team-mission-control\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-communications", testMatch: /communications-workspace\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-playbook", testMatch: /engagement-playbook\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-handoff", testMatch: /candidate-handoff\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    { name: "firefox-continuity", testMatch: /ifpg-demo-continuity\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${E2E_PORT}`,
    url: `${E2E_BASE_URL}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PLAYWRIGHT_TEST_MODE: "true",
      CONFERENCE_DEMO_ACCESS: "true",
    },
  },
});
