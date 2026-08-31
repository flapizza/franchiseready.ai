import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("production candidate resolution is explicitly unavailable and never demo-backed", async () => {
  const service = await source("feature/crm/services/ProductionCandidateResolutionService.ts");
  const composition = await source("feature/platform/composition/ProductionWorkspaceComposition.ts");
  assert.match(service, /status: "unavailable", reason: "not-implemented"/);
  assert.doesNotMatch(service, /Demo|Seed|Overlay/);
  assert.match(composition, /new ProductionCandidateResolutionService\(\)/);
  assert.doesNotMatch(composition, /DemoCandidateResolutionService/);
});

test("demo candidate resolution and intake activity remain composition-owned", async () => {
  const composition = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  assert.match(composition, /new DemoCandidateResolutionService\(candidates\)/);
  assert.match(composition, /new DemoCandidateIntakeActivitySink\(\)/);
});

test("candidate intake no longer selects persistence or reaches the demo overlay", async () => {
  const intake = await source("feature/crm/services/CandidateIntakeService.ts");
  assert.doesNotMatch(intake, /PERSISTENCE_MODE|demoCandidateOverlayStore/);
  assert.match(intake, /CandidateIntakeActivitySink/);
  assert.match(intake, /resolution\.status === "unavailable"/);
});

test("AssessmentPlayer consumes serializable assessment data instead of constructing persistence", async () => {
  const player = await source("feature/assessment-engine/components/AssessmentPlayer.tsx");
  assert.doesNotMatch(player, /SeedAssessmentRepository|new .*Repository/);
  assert.match(player, /assessment: AssessmentVersion/);
  assert.match(player, /getAssessmentById\(id\)/);
});
