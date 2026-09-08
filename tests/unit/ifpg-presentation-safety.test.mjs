import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("conference-visible candidate intelligence uses FranGroove branding", async () => {
  const sources = await Promise.all([
    "IntelligenceProfileCard.tsx",
    "DiscoveryGuidePanel.tsx",
    "CandidateActionList.tsx",
    "AICommandCenter.tsx",
    "AIMeetingCoach.tsx",
    "CandidateWorkspace.tsx",
  ].map((file) => read(`feature/crm/components/${file}`)));
  for (const source of sources) {
    assert.doesNotMatch(source, /FranchiseReady/i);
    assert.match(source, /FranGroove/);
  }
});

test("demo seed links remain inert and public availability does not collect requests", async () => {
  const calendar = await read("feature/calendar/repositories/DemoCalendarRepository.ts");
  const requestDemo = await read("components/marketing/demo-availability.tsx");
  assert.doesNotMatch(calendar, /meet\.google\.com\/demo-john|zoom\.us\/j\/demo/);
  assert.match(calendar, /Conference demo · no external meeting/);
  assert.doesNotMatch(requestDemo, /YOUR-CALENDLY-LINK|calendly\.com/);
  assert.match(requestDemo, /not open yet/);
  assert.doesNotMatch(requestDemo, /<form|<input|mailto:/);
  assert.match(requestDemo, /https:\/\/app\.frangroove\.com\/login/);
});

test("demo candidate deletion is hidden and delivery actions disclose simulation", async () => {
  const candidate = await read("feature/candidate-360/components/Candidate360Page.tsx");
  const referralActions = await read("feature/referral-package/actions/referral-studio.ts");
  assert.match(candidate, /isProduction && <section aria-label="Candidate administration"/);
  assert.match(referralActions, /Demo delivery completed; no external system was contacted/);
});
