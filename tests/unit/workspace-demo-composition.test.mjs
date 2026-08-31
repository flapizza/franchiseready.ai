import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) =>
  readFile(path.join(root, relativePath), "utf8");

test("demo composition constructs the existing demo dependency set", async () => {
  const composition = await source(
    "feature/platform/composition/DemoWorkspaceComposition.ts",
  );
  const constructors = [
    "SeedAssessmentRepository",
    "SeedBrandRepository",
    "SeedCandidateRepository",
    "SeedDemoScenarioRepository",
    "DemoCandidateActivityRepository",
    "DemoConsultantPipelineRepository",
    "DemoTaskRepository",
    "DemoCalendarRepository",
    "DemoEmailRepository",
    "DemoEmailDeliveryService",
    "DemoEngagementPlaybookRepository",
    "DemoReferralDeliveryService",
    "DemoTeamOperationsRepository",
    "SeedIntelligenceEngine",
  ];

  for (const name of constructors) {
    assert.match(composition, new RegExp(`new ${name}\\(\\)`));
  }
  assert.match(composition, /conferenceAssessments: conferenceAssessmentStore/);
  assert.doesNotMatch(composition, /Supabase[A-Za-z]*(?:Repository|Client)/);
  assert.doesNotMatch(composition, /catch[\s\S]*(?:Demo|Seed)/);
});

test("demo composition resolves only the guarded conference demo identity", async () => {
  const composition = await source(
    "feature/platform/composition/DemoWorkspaceComposition.ts",
  );
  assert.match(composition, /getConferenceDemoUser\(\)/);
  assert.match(composition, /if \(!user\) return null/);
  assert.match(composition, /kind: "demo"/);
  assert.match(composition, /kind: "demo-identity"/);
  assert.match(composition, /kind: "demo-workspace"/);
  assert.match(composition, /if \(session\.kind !== "demo"\)/);
  assert.match(composition, /throw new Error/);
});

test("demo presentation is serializable and its indicator is wired through presentation data", async () => {
  const composition = await source(
    "feature/platform/composition/DemoWorkspaceComposition.ts",
  );
  const indicator = await source(
    "feature/layout/components/DemoWorkspaceIndicator.tsx",
  );
  const shell = await source("feature/layout/components/AppShell.tsx");

  assert.match(composition, /label: "Demo Workspace — temporary data"/);
  assert.match(composition, /Changes may reset and are not production records/);
  assert.match(indicator, /Demo workspace data notice/);
  assert.match(shell, /presentation\.temporaryDataIndicator/);
  assert.match(shell, /DemoWorkspaceIndicator/);
});

test("demo test reset and failure routes retain both access and session guards", async () => {
  const guardedRoutes = [
    "app/(protected)/crm/test-reset/route.ts",
    "app/(protected)/crm/test-email-engagement/route.ts",
    "app/(protected)/crm/test-referral-delivery/route.ts",
  ];

  for (const route of guardedRoutes) {
    const contents = await source(route);
    assert.match(contents, /isConferenceDemoAccessEnabled\(\)/);
    assert.match(contents, /getConferenceDemoUser\(\)/);
  }

  const access = await source("lib/auth/demo-access.ts");
  assert.match(access, /process\.env\.NODE_ENV === "development"/);
  assert.match(access, /process\.env\.PLAYWRIGHT_TEST_MODE === "true"/);
  assert.match(access, /process\.env\.CONFERENCE_DEMO_ACCESS === "true"/);
});
