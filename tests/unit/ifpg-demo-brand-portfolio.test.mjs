import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { demoBrands } from "../../feature/brand-library/data/demoBrands.ts";

const source = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("demo Brand Library contains six intentional concepts with explicit provenance", () => {
  assert.deepEqual(demoBrands.map((brand) => brand.id), [
    "era-group",
    "schooley-mitchell",
    "actioncoach",
    "routewise-mobile-services",
    "brightpath-home-services",
    "harbor-and-hound-market",
  ]);
  assert.equal(demoBrands.filter((brand) => brand.demoClassification === "existing-demo-profile").length, 3);
  assert.equal(demoBrands.filter((brand) => brand.demoClassification === "curated-demo-concept").length, 3);
});

test("portfolio spans material capital, customer, staffing, owner-role, and revenue contrasts", () => {
  assert.ok(Math.min(...demoBrands.map((brand) => brand.investment.minimum)) <= 65_000);
  assert.ok(Math.max(...demoBrands.map((brand) => brand.investment.minimum)) >= 425_000);
  assert.deepEqual(new Set(demoBrands.map((brand) => brand.operatingModel.teamModel)), new Set(["solo", "small-team", "team-led"]));
  assert.ok(demoBrands.some((brand) => brand.businessModel.b2b && brand.businessModel.homeBased));
  assert.ok(demoBrands.some((brand) => brand.businessModel.b2c && !brand.businessModel.homeBased));
  assert.ok(demoBrands.some((brand) => brand.businessModel.ownerOperator));
  assert.ok(demoBrands.some((brand) => brand.businessModel.executiveModel && !brand.businessModel.ownerOperator));
  assert.ok(demoBrands.some((brand) => brand.businessModel.recurringRevenue));
  assert.ok(demoBrands.some((brand) => !brand.businessModel.recurringRevenue));
});

test("every concept supplies coherent demo-safe profile and matching material", () => {
  for (const brand of demoBrands) {
    assert.ok(brand.shortDescription.length > 40, brand.name);
    assert.ok(brand.investment.liquidCapitalMinimum > 0, brand.name);
    assert.ok(brand.operatingEnvironment.length > 20, brand.name);
    assert.ok(brand.territoryModel.length > 20, brand.name);
    assert.equal(Object.values(brand.trainingSupport).filter(Boolean).length, 4, brand.name);
    assert.ok(brand.successTraits.length >= 3, brand.name);
    assert.ok(brand.poorFitTraits.length >= 3, brand.name);
    assert.ok(brand.considerations.length >= 2, brand.name);
    assert.ok(brand.discoveryQuestions.length >= 2, brand.name);
    assert.ok(brand.referralContact?.email, brand.name);
  }
  assert.ok(demoBrands.filter((brand) => brand.demoClassification === "curated-demo-concept").every((brand) => brand.tags.includes("curated-demo") && !brand.website));
});

test("John Sarah and Jared carry deliberately different portfolio evidence", async () => {
  const scenario = await source("feature/demo/data/conferenceScenario.ts");
  assert.match(scenario, /id: "candidate-demo"[\s\S]*?brandIds: \["era-group", "schooley-mitchell", "actioncoach"\]/);
  assert.match(scenario, /id: "sarah-williams"[\s\S]*?brandIds: \["era-group", "brightpath-home-services"\]/);
  assert.match(scenario, /id: "jared-wirsig"[\s\S]*?brandIds: \["actioncoach", "era-group"\]/);
});

test("matching rationale is candidate-specific and production receives no demo expansion", async () => {
  const [runtime, production] = await Promise.all([
    source("feature/brand-strategy/runtime/CandidateBrandStrategyRuntime.ts"),
    source("feature/platform/composition/ProductionWorkspaceComposition.ts"),
  ]);
  assert.match(runtime, /candidate\.firstName/);
  assert.match(runtime, /candidateValue/);
  assert.match(runtime, /brandTarget/);
  assert.match(runtime, /teamModel/);
  assert.match(runtime, /recurring-revenue/);
  assert.match(runtime, /thresholds exceed the current financial profile/);
  assert.doesNotMatch(production, /RouteWise|BrightPath|Harbor & Hound|demoBrands/);
});
