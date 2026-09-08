import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapBrandIntelligence } from "../../feature/brand-library/persistence/mapBrandIntelligence.ts";
import { brandFactRegistry, brandFactPaths, validateFactRegistry } from "../../feature/brand-library/persistence/BrandFactRegistry.ts";
import { canonicalFacts, fixtureId, sixBrandFixtures, semanticFact, semanticIntelligence, timestamp } from "../fixtures/brand-intelligence-persistence.mjs";

const fixtures = await sixBrandFixtures();
const fresh = () => structuredClone(fixtures[0]);
function replaceFact(dto, key, value) {
  const fact = dto.facts.find(f => f.fact_key === key);
  Object.assign(fact, { value, knowledge_state: "known", verification: "unverified" });
  return fact;
}
for (const fixture of fixtures) test(`${fixture.canonical.name}: canonical values, provenance, completeness and consultant voice round-trip`, () => {
  const actual = mapBrandIntelligence(fixture);
  assert.deepEqual(canonicalFacts(actual).map(([key, fact]) => [key, semanticFact(fact)]).sort(),
    canonicalFacts(fixture.canonical).map(([key, fact]) => [key, semanticFact(fact)]).sort());
  assert.deepEqual(semanticIntelligence(actual), semanticIntelligence(fixture.canonical));
  assert.equal(actual.id, fixture.identity.public_id);
  assert.equal(actual.slug, fixture.identity.slug);
  assert.equal(actual.version.number, 1);
  assert.equal(actual.demoClassification, "not-demo");
});

test("all value kinds preserve zero, false, arrays, partial ranges and explicit review states", () => {
  const dto = fresh();
  replaceFact(dto, "economics.franchiseFee", 0).confidence = "high";
  replaceFact(dto, "characteristics.recurringRevenue", false).review_state = "not-reviewed";
  replaceFact(dto, "differentiators", []);
  replaceFact(dto, "economics.initialInvestment", { minimum: 0, maximum: null, currency: "USD" });
  replaceFact(dto, "economics.otherRecurringFees", [{ name: "Service", amount: "0 USD" }]);
  replaceFact(dto, "fit.leadership", "low");
  replaceFact(dto, "characteristics.operatingLocations", []);
  const unknown = dto.facts.find(f => f.fact_key === "economics.minimumNetWorth");
  unknown.review_state = "not-reviewed";
  const actual = mapBrandIntelligence(dto);
  assert.equal(actual.economics.franchiseFee.value, 0);
  assert.equal(actual.economics.franchiseFee.confidence, "high");
  assert.equal(actual.characteristics.recurringRevenue.value, false);
  assert.equal(actual.characteristics.recurringRevenue.reviewState, "not-reviewed");
  assert.equal(actual.characteristics.recurringRevenue.verification, "unverified");
  assert.deepEqual(actual.differentiators.value, []);
  assert.deepEqual(actual.characteristics.operatingLocations.value, []);
  assert.deepEqual(actual.economics.initialInvestment.value, { minimum: 0, maximum: null, currency: "USD" });
  assert.deepEqual(actual.economics.otherRecurringFees.value, [{ name: "Service", amount: "0 USD" }]);
  assert.equal(actual.fit.leadership.value, "low");
  assert.equal(actual.economics.minimumNetWorth.value, null);
  assert.equal(actual.economics.minimumNetWorth.knowledgeState, "unknown");
  assert.equal(actual.economics.minimumNetWorth.reviewState, "not-reviewed");
});

for (const [key, value] of [
  ["description", ""], ["description", 5], ["economics.franchiseFee", "0"], ["economics.franchiseFee", -1],
  ["economics.franchiseFee", Infinity], ["characteristics.recurringRevenue", "false"], ["fit.leadership", "extreme"],
  ["economics.franchiseFee", Number.MAX_SAFE_INTEGER + 1],
  ["characteristics.operatingLocations", ["warehouse"]], ["differentiators", [false]],
  ["economics.initialInvestment", { minimum: 3, maximum: 1, currency: "USD" }],
  ["economics.initialInvestment", { minimum: 0, maximum: null, currency: "CAD" }],
  ["economics.otherRecurringFees", [{ name: "Fee", amount: 0 }]],
]) test(`malformed ${key}: ${JSON.stringify(value)} rejected`, () => {
  const dto = fresh(); replaceFact(dto, key, value);
  assert.throws(() => mapBrandIntelligence(dto), /Invalid persisted/);
});
test("unknown keys, duplicate facts, missing facts, and inconsistent unknowns fail", () => {
  for (const mutate of [
    dto => { dto.facts[0].fact_key = "__proto__.value"; },
    dto => dto.facts.push(dto.facts[0]), dto => dto.facts.pop(),
    dto => { dto.facts[0].knowledge_state = "unknown"; },
    dto => { dto.facts[0].value = null; },
    dto => { dto.profile.status = "draft"; }, dto => { dto.profile.status = "reviewed"; },
    dto => { dto.facts[0].profile_id = fixtureId("other"); },
  ]) { const dto = fresh(); mutate(dto); assert.throws(() => mapBrandIntelligence(dto), /Invalid persisted/); }
});
test("provenance, multiple sources, primary designation and order survive", () => {
  const dto = fresh();
  const first = dto.evidence.find(e => e.id === dto.links.find(l => l.fact_key === "category").evidence_id);
  Object.assign(first, { source_date: "2026-09-01", source_url: "https://example.test/source", document_reference: "FDD 2026",
    fdd_item: "7", page_reference: "21-22", reviewed_at: timestamp, retrieved_at: timestamp, confidence: "medium" });
  const second = { ...first, id: fixtureId("second-source"), title: "Second source", supersedes_id: first.id };
  dto.evidence.push(second);
  dto.links.push({ ...dto.links.find(l => l.fact_key === "category"), evidence_id: second.id, position: 9, is_primary: false });
  const result = mapBrandIntelligence(dto).category;
  assert.equal(result.evidence.length, 2);
  assert.equal(result.evidence[0].isPrimary, true);
  assert.equal(result.evidence[1].position, 9);
  assert.equal(result.evidence[1].supersedesId, first.id);
  assert.deepEqual(result.evidence[0].fddReference, { item: "7", page: "21-22" });
  assert.equal(result.evidence[0].reviewedAt, timestamp);
  assert.equal(result.evidence[0].confidence, "medium");
  assert.equal(result.evidence[0].sourceUrl, first.source_url);
  dto.links.at(-1).is_primary = true;
  assert.throws(() => mapBrandIntelligence(dto), /primary/);
});
test("no evidence is invented, and verified claims need verified sources", () => {
  const dto = fresh(); dto.links = []; dto.evidence = [];
  assert.deepEqual(mapBrandIntelligence(dto).category.evidence, []);
  dto.facts[0].verification = "verified";
  assert.throws(() => mapBrandIntelligence(dto), /verified evidence/);
});
test("editorial items remain version-bound and only approved copy overrides derivation", () => {
  const dto = fresh();
  const item = { id: fixtureId("editorial"), profile_id: dto.profile.id, section: "businessSummary", position: 0,
    label: "Business summary", explanation: "The owner helps business clients improve costs.", source_facts: ["description"],
    origin: "editorial", origin_reference: "review-1", created_by: "editor", created_at: timestamp,
    review_state: "reviewed", reviewed_by: "reviewer", reviewed_at: timestamp, approval: "internal-only" };
  dto.editorial.push(item);
  assert.equal(mapBrandIntelligence(dto).consultantIntelligence.businessSummary.derivation, "deterministic");
  item.approval = "approved-for-presentation";
  const actual = mapBrandIntelligence(dto);
  assert.equal(actual.consultantIntelligence.businessSummary.value, item.explanation);
  assert.equal(actual.consultantIntelligence.businessSummary.verification, "unverified");
  assert.equal(actual.editorialItems[0].originReference, "review-1");
  item.source_facts = ["missing.key"];
  assert.throws(() => mapBrandIntelligence(dto), /editorial linkage/);
});
test("registry checks reject missing, duplicate and changed definitions", () => {
  const definitions = Object.entries(brandFactRegistry).map(([fact_key, d]) => ({ fact_key, value_kind: d.valueKind, allowed_values: d.allowedValues }));
  validateFactRegistry(definitions);
  assert.throws(() => validateFactRegistry(definitions.slice(1)), /incomplete/);
  assert.throws(() => validateFactRegistry([...definitions, definitions[0]]), /duplicate/);
  assert.throws(() => validateFactRegistry([{ ...definitions[0], value_kind: "boolean" }, ...definitions.slice(1)]), /mismatch/);
  for (const f of fixtures) assert.deepEqual(canonicalFacts(f.canonical).map(([key]) => key).sort(), [...brandFactPaths].sort());
});
test("matching remains isolated on legacy source with no reverse reconstruction", async () => {
  const runtime = await readFile(new URL("../../feature/brand-strategy/runtime/CandidateBrandStrategyRuntime.ts", import.meta.url), "utf8");
  const production = await readFile(new URL("../../feature/platform/composition/ProductionWorkspaceComposition.ts", import.meta.url), "utf8");
  assert.match(runtime, /brands: BrandRepository = new SeedBrandRepository\(\)/);
  assert.doesNotMatch(runtime, /SupabaseBrandIntelligenceRepository|createPersistedBrandIntelligenceRepository|mapBrandIntelligence/);
  assert.match(production, /brandIntelligence: new ConsultantBrandIntelligenceRuntime\(createPersistedBrandIntelligenceRepository\(client, context\)\)/);
});
