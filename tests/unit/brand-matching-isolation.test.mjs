import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import "../fixtures/register-typescript.mjs";
const { CandidateBrandStrategyRuntime } = await import("../../feature/brand-strategy/runtime/CandidateBrandStrategyRuntime.ts");

// Captured from the unmodified 0df69ce matching runtime/legacy fixtures before
// exercising the new canonical repository. Hash includes rationale + fit inputs.
const baseline = {
  "candidate-demo": "f8d969697c2d5d1259f1163287a6f1c2038b36b89906733a4110b0ef662892bd",
  "sarah-williams": "8bfe100d4bb832a90b53df453831f5db4f7f91286573b5727ece4750cd437943",
  "jared-wirsig": "bcab2c4c31ba07e06bd3f77d4727746a490b339d99d0c06c07a69e3662543a91",
  "elena-rodriguez": "582face4fe1c9c9cd2615dee97b6f2680f04b882a9e319a5445139fd0e05d728",
};
for (const [id, expected] of Object.entries(baseline)) test(`${id}: legacy matching rankings, scores, eligibility, rationale and inputs unchanged`, async () => {
  const result = await new CandidateBrandStrategyRuntime().load(id);
  const data = result.recommendations.map(({ brandId, rank, score, qualified, rationale, fitDimensions }) => ({ brandId, rank, score, qualified, rationale, fitDimensions }));
  assert.equal(createHash("sha256").update(JSON.stringify(data)).digest("hex"), expected);
});
