import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) =>
  readFile(path.join(root, relativePath), "utf8");

async function filesBelow(relativeDirectory) {
  const directory = path.join(root, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(relativeDirectory, entry.name);
      return entry.isDirectory() ? filesBelow(relativePath) : [relativePath];
    }),
  );
  return nested.flat();
}

test("workspace composition contracts are server-only and adapter-free", async () => {
  const files = (await filesBelow("feature/platform/composition")).filter(
    (file) => file.endsWith(".ts"),
  );
  assert.ok(files.length >= 2);

  for (const file of files) {
    const contents = await source(file);
    assert.match(contents, /^import "server-only";/);
    if (/[/\\](?:Demo|Production)Workspace|resolveWorkspaceComposition/.test(file)) continue;
    assert.doesNotMatch(contents, /repositories\//i);
    assert.doesNotMatch(contents, /(?:Seed|Demo|Supabase)[A-Za-z]*Repository/);
    assert.doesNotMatch(contents, /create(?:Demo|Production)WorkspaceComposition/);
  }

  const composition = await source(
    "feature/platform/composition/WorkspaceComposition.ts",
  );
  assert.match(composition, /interface WorkspaceSessionResolver/);
  assert.match(composition, /resolve\(\): Promise<WorkspaceResolution>/);
  assert.match(composition, /interface WorkspaceComposer/);
  assert.match(
    composition,
    /compose\([\s\S]*session: WorkspaceSession,[\s\S]*Promise<WorkspaceComposition/,
  );
});

test("workspace selection is explicit and production never falls back to demo", async () => {
  const selector = await source("feature/platform/composition/resolveWorkspaceComposition.ts");
  assert.match(selector, /getPersistenceMode\(\) === "demo"/);
  assert.match(selector, /resolveProductionWorkspaceSession\(\)/);
  assert.match(selector, /createProductionWorkspaceComposition/);
  assert.doesNotMatch(selector, /catch/);
});

test("candidate factory preserves its characterized demo and production selection", async () => {
  const factory = await source(
    "feature/crm/repositories/candidate-repository-factory.ts",
  );
  assert.match(factory, /getPersistenceMode\(\) === "demo"/);
  assert.match(factory, /mode: "demo" as const, repository: new SeedCandidateRepository\(\)/);
  assert.match(factory, /resolveAuthenticatedWorkspaceContext\(\)/);
  assert.match(factory, /mode: "supabase" as const, repository: new SupabaseCandidateRepository\(client, workspace\)/);
  assert.doesNotMatch(factory, /catch[\s\S]*SeedCandidateRepository/);
});

test("production assessment and Discovery factories still fail closed in demo mode", async () => {
  const assessment = await source(
    "feature/assessment-engine/production/repository-factory.ts",
  );
  const discovery = await source(
    "feature/discovery/production/repository-factory.ts",
  );

  for (const factory of [assessment, discovery]) {
    assert.match(factory, /getPersistenceMode\(\)!=="supabase"|getPersistenceMode\(\) !== "supabase"/);
    assert.match(factory, /throw new Error/);
    assert.doesNotMatch(factory, /Seed[A-Za-z]*Repository|Demo[A-Za-z]*Repository/);
  }
});

test("no new protected route or server action bypasses the future composition boundary", async () => {
  const grandfathered = new Set([
    "app/(protected)/crm/candidates/conference/[candidateId]/report/route.ts",
    "app/(protected)/crm/test-email-engagement/route.ts",
    "app/(protected)/crm/test-referral-delivery/route.ts",
    "app/(protected)/crm/test-reset/route.ts",
    "feature/assessment-engine/conference/actions.ts",
  ]);
  const candidates = [
    ...(await filesBelow("app/(protected)")),
    ...(await filesBelow("feature")),
  ].filter((file) =>
    file.startsWith("app/") ||
    file.includes("/actions/") ||
    /(?:^|\/)[^/]*actions\.ts$/.test(file),
  );
  const directAdapterImport =
    /^import[\s\S]*?from\s+["'][^"']*(?:repositories|demo\/data|ConferenceAssessmentStore)[^"']*["'];?/gm;
  const violations = [];

  for (const file of candidates) {
    if (!/\.(?:ts|tsx)$/.test(file)) continue;
    const normalized = file.replaceAll("\\", "/");
    const contents = await source(file);
    if (directAdapterImport.test(contents) && !grandfathered.has(normalized)) {
      violations.push(normalized);
    }
    directAdapterImport.lastIndex = 0;
  }

  assert.deepEqual(violations.sort(), []);
});

test("protected routes and actions select dependencies only through workspace composition", async () => {
  const approvedDemoOnly = new Set([
    "app/(protected)/crm/candidates/conference/[candidateId]/report/route.ts",
    "app/(protected)/crm/test-email-engagement/route.ts",
    "app/(protected)/crm/test-referral-delivery/route.ts",
    "app/(protected)/crm/test-reset/route.ts",
    "feature/assessment-engine/conference/actions.ts",
  ]);
  const files = [...(await filesBelow("app/(protected)")), ...(await filesBelow("feature"))]
    .filter((file) => /\.(?:ts|tsx)$/.test(file))
    .filter((file) => file.startsWith("app/") || file.replaceAll("\\", "/").includes("/actions/"));
  const prohibited = /getPersistenceMode|PERSISTENCE_MODE|resolveAuthenticatedWorkspaceContext|createCandidateRepository|createDiscoveryRepository|createAuthenticatedAssessmentRepository|new (?:Seed|Demo|Supabase)[A-Za-z]+|demoConsultant|demoCandidateOverlayStore/;
  const violations = [];
  for (const file of files) {
    const normalized = file.replaceAll("\\", "/");
    if (approvedDemoOnly.has(normalized)) continue;
    if (prohibited.test(await source(file))) violations.push(normalized);
  }
  assert.deepEqual(violations.sort(), []);
});
