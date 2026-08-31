import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

const targets = [
  "feature/mission-control/runtime/MissionControlRuntime.ts",
  "feature/crm/runtime/CandidateCRMRuntime.ts",
  "feature/candidate-360/runtime/Candidate360Runtime.ts",
  "feature/engagement-playbook/services/CandidateEngagementPlaybookService.ts",
];

test("the four production-reachable targets construct no hidden demo dependencies", async () => {
  for (const target of targets) {
    const contents = await source(target);
    assert.doesNotMatch(contents, /new (?:Seed|Demo)[A-Za-z]+/);
    assert.doesNotMatch(contents, /demoCandidateOverlayStore|demoConsultant/);
    assert.doesNotMatch(contents, /private readonly [^=,\n]+\s*=\s*new /);
  }
});

test("demo composition owns all four runtime factories", async () => {
  const composition = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  const factory = await source("feature/platform/composition/DemoWorkspaceRuntimeFactory.ts");
  assert.match(composition, /runtimes: new DemoWorkspaceRuntimeFactory\(dependencies\)/);
  for (const constructor of [
    "MissionControlRuntime",
    "CandidateCRMRuntime",
    "Candidate360Runtime",
    "CandidateEngagementPlaybookService",
  ]) assert.match(factory, new RegExp(`new ${constructor}\\(\\{`));
});

test("production composition neither imports nor exposes demo runtime factories", async () => {
  const production = await source("feature/platform/composition/ProductionWorkspaceComposition.ts");
  assert.doesNotMatch(production, /DemoWorkspaceRuntimeFactory|createMissionControl|createCandidateCRM|createEngagementPlaybook/);
  assert.match(production, /"mission-control": unavailable/);
  assert.match(production, /"brand-strategy": unavailable/);
});

test("callers use explicit composition or explicit root-only production injection", async () => {
  const files = [
    "app/(protected)/crm/page.tsx",
    "app/(protected)/crm/candidates/page.tsx",
    "app/(protected)/crm/candidates/[candidateId]/playbook/page.tsx",
    "feature/candidate-360/components/Candidate360Page.tsx",
    "feature/engagement-playbook/actions/playbook-actions.ts",
  ];
  const combined = (await Promise.all(files.map(source))).join("\n");
  assert.doesNotMatch(combined, /new (?:MissionControlRuntime|CandidateCRMRuntime|CandidateEngagementPlaybookService)\(\)/);
  assert.match(combined, /rootOnly: true/);
  assert.match(combined, /\.runtimes\./);
});
