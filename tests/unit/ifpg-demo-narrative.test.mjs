import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { conferenceDemoIso, conferenceDemoNow } from "../../feature/demo/time/conferenceDemoClock.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("conference demo clock is fixed and supplies one chronological story", () => {
  assert.equal(conferenceDemoNow().toISOString(), "2026-08-31T13:00:00.000Z");
  assert.equal(conferenceDemoIso(0, 14), "2026-08-31T18:00:00.000Z");
  assert.ok(Date.parse(conferenceDemoIso(-2, 10)) < conferenceDemoNow().getTime());
  assert.ok(Date.parse(conferenceDemoIso(3, 11)) > conferenceDemoNow().getTime());
});

test("demo composition explicitly selects John without changing opportunity scoring", async () => {
  const [factory, runtime] = await Promise.all([
    source("feature/platform/composition/DemoWorkspaceRuntimeFactory.ts"),
    source("feature/mission-control/runtime/MissionControlRuntime.ts"),
  ]);
  assert.match(factory, /presenterCandidateId: "candidate-demo"/);
  assert.match(factory, /conferenceDemoNow/);
  assert.match(runtime, /rankedTopCandidate/);
  assert.match(runtime, /spotlightCandidate/);
  assert.match(runtime, /IFPG Candidate Story/);
  assert.match(runtime, /lifecycleValue = candidate\.pipelineStage === "referral"[\s\S]*\? 200/);
});

test("production composition has no demo presenter preference", async () => {
  const production = await source("feature/platform/composition/ProductionWorkspaceComposition.ts");
  assert.doesNotMatch(production, /presenterCandidateId|conferenceDemoNow|IFPG Candidate Story/);
});

test("John meeting and seeded work use credible, consistent conference time", async () => {
  const [calendar, tasks, emails, playbook] = await Promise.all([
    source("feature/calendar/repositories/DemoCalendarRepository.ts"),
    source("feature/tasks/repositories/DemoTaskRepository.ts"),
    source("feature/communications/data/demoEmailHistory.ts"),
    source("feature/engagement-playbook/services/CandidateEngagementPlaybookService.ts"),
  ]);
  assert.match(calendar, /meeting-john-discovery[\s\S]*conferenceDemoIso\(0, 14\)/);
  assert.doesNotMatch(calendar, /meeting-john-discovery[\s\S]*demoLocalIso\(0, 23\)/);
  assert.match(tasks, /conferenceDemoIso/);
  assert.match(emails, /conferenceDemoIso/);
  assert.match(playbook, /conferenceDemoIso/);
});

test("known seed contradictions are corrected from canonical brand and candidate data", async () => {
  const [tasks, referrals] = await Promise.all([
    source("feature/tasks/repositories/DemoTaskRepository.ts"),
    source("feature/demo/data/conferenceReferralHistory.ts"),
  ]);
  assert.match(tasks, /ownership motivation and decision timing/);
  assert.doesNotMatch(tasks, /remaining family alignment concern/);
  assert.match(referrals, /category: eraGroup\.category/);
  assert.match(referrals, /contact: eraGroup\.referralContact \?\? null/);
});

test("John journey preserves identity and excludes legacy assessment routes", async () => {
  const journey = await source("feature/candidate-360/components/DemoCandidateJourney.tsx");
  for (const route of [
    "/crm/candidates/${candidateId}#assessment-intelligence",
    "/crm/${candidateId}/discovery",
    "/crm/candidates/${candidateId}/strategy",
    "/crm/candidates/${candidateId}/strategy/presentation",
    "/crm/candidates/${candidateId}/referral",
  ]) assert.ok(journey.includes(route));
  assert.doesNotMatch(journey, /\/assessment\/\[|\/assessment\/\$\{/);
  const invitation = await source("feature/crm/services/AssessmentInvitationService.ts");
  assert.match(invitation, /`\/assessment\/start\?invitation=\$\{encodeURIComponent\(token\)\}`/);
});

test("secondary conference stories remain seeded", async () => {
  const scenario = await source("feature/demo/data/conferenceScenario.ts");
  for (const id of ["sarah-williams", "jared-wirsig", "robert-king"]) assert.match(scenario, new RegExp(`id: "${id}"`));
});
