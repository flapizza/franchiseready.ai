import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConferenceAssessmentStore } from "../../feature/assessment-engine/conference/ConferenceAssessmentStore.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("canonical reset clears every mutable overlay collection", async () => {
  const overlay = await source("feature/crm/repositories/DemoCandidateOverlayStore.ts");
  const reset = overlay.match(/reset\(\): void \{([^}]+)\}/)?.[1] ?? "";
  for (const collection of [
    "candidates", "pipelines", "tasks", "dismissedTaskRecommendations", "calendarEvents", "reminders",
    "engagementPlaybookDecisions", "invitations", "activities", "referrals", "strategies",
    "referralDeliveryFailures", "emailMessages", "emailEvents", "emailIdempotency",
    "emailDeliveryFailures", "emailCandidateDeliveryFailures", "dismissedEmailFollowUps",
  ]) assert.match(reset, new RegExp(`${collection}\\.clear\\(\\)`), `${collection} must reset`);
});

test("guarded reset clears assessment records and browser-local draft state", async () => {
  const route = await source("app/(protected)/crm/test-reset/route.ts");
  assert.match(route, /isConferenceDemoAccessEnabled\(\)/);
  assert.match(route, /getConferenceDemoUser\(\)/);
  assert.match(route, /demoCandidateOverlayStore\.reset\(\)/);
  assert.match(route, /conferenceAssessmentStore\.clear\(\)/);
  assert.match(route, /"Clear-Site-Data": '\"storage\"'/);
  assert.match(route, /baseline: "ifpg-conference-demo-v1"/);
});

test("conference assessment store clear removes stale completed records", () => {
  const store = new ConferenceAssessmentStore();
  store.save({ id: "stale", candidateId: "candidate-demo", status: "analyzed", intake: {}, answers: {}, startedAt: "2026-08-31T13:00:00.000Z", completedAt: "2026-08-31T13:01:00.000Z", durationSeconds: 60, analysis: {} });
  assert.equal(store.load("stale")?.ok, false);
  store.clear();
  assert.equal(store.load("stale"), null);
  assert.deepEqual(store.getAll(), []);
});

test("root layout has no build-time Google font dependency", async () => {
  const [layout, styles] = await Promise.all([source("app/layout.tsx"), source("app/globals.css")]);
  assert.doesNotMatch(layout, /next\/font\/google|Geist/);
  assert.match(styles, /--font-fr-sans: "Segoe UI Variable"/);
  assert.match(styles, /--font-fr-mono: "Cascadia Mono"/);
});
