import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", testMatch: ["marketing-media.spec.ts","marketing-production-persistence.spec.ts", "marketing-provider-unavailable.spec.ts"],
  workers: 1, timeout: 180000, reporter: "list",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3116", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { cwd: process.cwd(), command: "node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3116", url: "http://127.0.0.1:3116/login", reuseExistingServer: false, timeout: 120000 },
});
