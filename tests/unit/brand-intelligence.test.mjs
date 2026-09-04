import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { demoBrands } from "../../feature/brand-library/data/demoBrands.ts";
import { BrandIntelligenceRuntime, presentationValue } from "../../feature/brand-library/runtime/BrandIntelligenceRuntime.ts";
import { calculateBrandProfileCompleteness } from "../../feature/brand-library/runtime/BrandProfileCompleteness.ts";
import { filterBrandProfiles } from "../../feature/brand-library/runtime/filterBrandProfiles.ts";

const unknown = { value: null, verification: "unknown", approval: "unavailable", evidence: [] };
const known = { value: "known", verification: "reviewed", approval: "approved-for-presentation", evidence: [{ id: "evidence", sourceType: "primary", title: "Source", verification: "reviewed" }] };

test("canonical intelligence maps all six stable IFPG brand IDs", async () => {
  const profiles = await new BrandIntelligenceRuntime().getAll();
  assert.deepEqual(profiles.map(({ id }) => id), demoBrands.map(({ id }) => id));
  assert.equal(profiles.length, 6);
});

test("unsupported financial facts remain explicitly unknown", async () => {
  const profile = await new BrandIntelligenceRuntime().getById("era-group");
  assert.ok(profile);
  assert.equal(profile.economics.franchiseFee.value, null);
  assert.equal(profile.economics.minimumNetWorth.value, null);
  assert.equal(profile.economics.royalty.value, null);
  assert.equal(profile.economics.marketingFund.value, null);
  assert.equal(presentationValue(profile.economics.franchiseFee), null);
});

test("legacy demo facts disclose their real provenance without synthetic verification", async () => {
  const profile = await new BrandIntelligenceRuntime().getById("era-group");
  assert.ok(profile);
  assert.equal(profile.category.verification, "unverified");
  assert.equal(profile.category.evidence[0].sourceType, "legacy-demo");
  assert.equal(profile.category.evidence[0].title, "Existing IFPG demo profile");
  assert.equal(profile.category.evidence[0].sourceDate, undefined);
  assert.equal(profile.completeness.verifiedFields, 0);
});

test("completeness is derived deterministically from known facts", () => {
  assert.equal(calculateBrandProfileCompleteness([]).status, "unknown-not-reviewed");
  assert.equal(calculateBrandProfileCompleteness([["a", unknown], ["b", unknown], ["c", unknown]].map(([label, fact]) => ({ label, fact }))).status, "unknown-not-reviewed");
  assert.equal(calculateBrandProfileCompleteness([["a", known], ["b", unknown], ["c", unknown], ["d", unknown]].map(([label, fact]) => ({ label, fact }))).status, "minimal");
  const partial = calculateBrandProfileCompleteness([["a", known], ["b", known], ["c", unknown], ["d", unknown]].map(([label, fact]) => ({ label, fact })));
  assert.equal(partial.status, "partially-populated");
  assert.deepEqual(partial.missingFields, ["c", "d"]);
  assert.equal(calculateBrandProfileCompleteness([["a", known], ["b", known], ["c", known]].map(([label, fact]) => ({ label, fact }))).status, "sufficiently-populated");
});

test("library filtering supports category, ownership, completeness, and search", async () => {
  const profiles = await new BrandIntelligenceRuntime().getAll();
  assert.deepEqual(filterBrandProfiles(profiles, { query: "routewise" }).map(({ id }) => id), ["routewise-mobile-services"]);
  assert.deepEqual(filterBrandProfiles(profiles, { category: "Business Coaching" }).map(({ id }) => id), ["actioncoach"]);
  assert.ok(filterBrandProfiles(profiles, { ownership: "owner-operator" }).every((profile) => profile.characteristics.ownerOperatorSuitability.value === "well-suited"));
  assert.ok(filterBrandProfiles(profiles, { completeness: profiles[0].completeness.status }).length > 0);
});

test("canonical projection does not replace the legacy matching input or scoring formula", async () => {
  const source = await readFile(new URL("../../feature/assessment-engine/scoring/services/FranchiseMatchingService.ts", import.meta.url), "utf8");
  assert.match(source, /import \{ demoBrands \}/);
  assert.match(source, /96 - index \* 2/);
  assert.doesNotMatch(source, /BrandIntelligenceRuntime|LegacyBrandProfileAdapter/);
});

test("unknown brand IDs resolve to null", async () => {
  assert.equal(await new BrandIntelligenceRuntime().getById("not-a-brand"), null);
});

test("all six brands expose evidence-linked plain-language consultant summaries", async () => {
  const profiles = await new BrandIntelligenceRuntime().getAll();
  const summaries = [];
  for (const profile of profiles) {
    const summary = profile.consultantIntelligence.businessSummary;
    assert.ok(summary.value);
    summaries.push(summary.value);
    assert.equal(summary.derivation, "deterministic");
    assert.ok(summary.sourceFacts.includes("description"));
    assert.ok(summary.evidence.length > 0);
    assert.equal(summary.verification, "unverified");
    assert.doesNotMatch(summary.value, /represented customer|current profile represents|franchisee is represented|deterministically synthesized|canonical facts|source paths|weighted coverage/i);
  }
  assert.equal(new Set(summaries).size, 6);
});

test("business summary does not fabricate unsupported economics", async () => {
  const era = await new BrandIntelligenceRuntime().getById("era-group");
  assert.ok(era?.consultantIntelligence.businessSummary.value);
  assert.doesNotMatch(era.consultantIntelligence.businessSummary.value, /franchise fee|royalty|net worth/i);
  assert.equal(era.economics.franchiseFee.value, null);
  assert.equal(era.economics.royalty.value, null);
});

test("consultant fit and friction signals derive from known canonical facts", async () => {
  const era = await new BrandIntelligenceRuntime().getById("era-group");
  assert.ok(era);
  assert.ok(era.consultantIntelligence.strongFit.some(({ label }) => label === "Experienced leader"));
  assert.ok(era.consultantIntelligence.potentialFriction.some(({ label }) => label === "Requires consistent business development"));
  assert.ok(era.consultantIntelligence.franchiseeRole.some(({ label }) => label === "Set direction and manage the business"));

  const retail = await new BrandIntelligenceRuntime().getById("harbor-and-hound-market");
  assert.ok(retail);
  assert.ok(retail.consultantIntelligence.potentialFriction.some(({ label }) => label === "Comes with real people-management responsibility"));
  assert.ok(retail.consultantIntelligence.potentialFriction.some(({ label }) => label === "Tied to a local operating location"));
  for (const signal of [...era.consultantIntelligence.strongFit, ...era.consultantIntelligence.potentialFriction]) assert.ok(signal.sourceFacts.length > 0);
});

test("consultant-facing interpretations avoid internal system language", async () => {
  const profiles = await new BrandIntelligenceRuntime().getAll();
  const prohibited = /represented by current facts|represented operating demands|maintain disciplined operating execution|candidate characteristics align|current profile supports|current profile represents/i;
  for (const profile of profiles) {
    const intelligence = profile.consultantIntelligence;
    const visibleOutput = [intelligence.businessSummary.value, ...intelligence.franchiseeRole.flatMap(({ label, explanation }) => [label, explanation]), ...intelligence.strongFit.flatMap(({ label, explanation }) => [label, explanation]), ...intelligence.potentialFriction.flatMap(({ label, explanation }) => [label, explanation])].filter(Boolean).join(" ");
    assert.doesNotMatch(visibleOutput, prohibited);
  }
});

test("diligence gaps prioritize material unknown and unverified economics", async () => {
  const era = await new BrandIntelligenceRuntime().getById("era-group");
  assert.ok(era);
  assert.deepEqual(era.consultantIntelligence.diligenceGaps.slice(0, 4).map(({ sourceFact, state }) => [sourceFact, state]), [
    ["economics.franchiseFee", "unknown"],
    ["economics.royalty", "unknown"],
    ["economics.marketingFund", "unknown"],
    ["economics.minimumNetWorth", "unknown"],
  ]);
});

test("Profile Readiness is weighted, deterministic, and preserves raw completeness", async () => {
  const runtime = new BrandIntelligenceRuntime();
  const first = await runtime.getById("era-group");
  const second = await runtime.getById("era-group");
  assert.ok(first && second);
  assert.deepEqual(first.consultantIntelligence.readiness, second.consultantIntelligence.readiness);
  assert.equal(first.consultantIntelligence.readiness.state, "developing-profile");
  assert.equal(first.consultantIntelligence.readiness.materialVerifiedWeight, 0);
  assert.deepEqual(first.consultantIntelligence.readiness.rawCompleteness, first.completeness);
});
