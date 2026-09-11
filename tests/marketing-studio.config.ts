import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", testMatch: ["marketing-studio.spec.ts", "marketing-segments-campaigns.spec.ts", "marketing-campaign-delivery.spec.ts"],
  workers: 1, fullyParallel: false, timeout: 90000, reporter: "list",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3115", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { cwd: process.cwd(), command: "node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3115", url: "http://127.0.0.1:3115/login", reuseExistingServer: false, timeout: 120000 },
});
