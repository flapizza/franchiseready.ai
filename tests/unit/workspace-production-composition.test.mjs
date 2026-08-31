import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("production composition contains only existing production-capable adapters", async () => {
  const composition = await source("feature/platform/composition/ProductionWorkspaceComposition.ts");
  for (const name of [
    "SupabaseCandidateRepository", "SupabaseAssessmentRepository", "SupabaseDiscoveryRepository",
    "ConnectedEmailAccountRepository", "ProductionEmailRepository", "ProductionEmailMessageService",
    "ProductionCommunicationsWorkspaceRuntime",
  ]) assert.match(composition, new RegExp(`new ${name}\\(`));
  assert.doesNotMatch(composition, /Seed[A-Z]|Demo[A-Z]|conferenceAssessmentStore|demoCandidateOverlayStore|demoConsultant/);
  assert.match(composition, /temporaryDataIndicator: null/);
});

test("demo composition contains no production persistence dependency", async () => {
  const composition = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  assert.doesNotMatch(composition, /Supabase|ProductionEmail|ConnectedEmailAccount/);
});

test("production identity and membership are resolved server-side", async () => {
  const resolver = await source("feature/platform/composition/ProductionWorkspaceSessionResolver.ts");
  assert.match(resolver, /client\.auth\.getUser\(\)/);
  assert.match(resolver, /\.from\("organization_memberships"\)/);
  assert.match(resolver, /workspace-selection-required/);
  assert.match(resolver, /invitation-available/);
  assert.match(resolver, /status: "suspended"/);
  assert.doesNotMatch(resolver, /user_metadata/);
});

test("shared shell consumes truthful presentation identity and capabilities", async () => {
  const topBar = await source("feature/layout/components/TopBar.tsx");
  const sidebar = await source("feature/layout/components/Sidebar.tsx");
  const shell = await source("feature/layout/components/AppShell.tsx");
  assert.doesNotMatch(topBar, /demoConsultant/);
  assert.match(topBar, /presentation\.identity/);
  assert.match(topBar, /presentation\.kind === "demo"/);
  assert.doesNotMatch(sidebar, /demoTeamViewer/);
  assert.match(sidebar, /presentation\.capabilities\.includes/);
  assert.match(shell, /presentation\.temporaryDataIndicator/);
});

test("demo and production sessions are rejected at the opposite composer boundary", async () => {
  const demo = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  const production = await source("feature/platform/composition/ProductionWorkspaceComposition.ts");
  assert.match(demo, /if \(session\.kind !== "demo"\)/);
  assert.match(production, /createProductionWorkspaceComposition\([\s\S]*session: ProductionWorkspaceSession/);
});
