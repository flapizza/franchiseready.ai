import "../fixtures/register-typescript.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const { ConsultantBrandIntelligenceRuntime } = await import("../../feature/brand-library/runtime/ConsultantBrandIntelligenceRuntime.ts");

test("150 published profiles load in two catalog batches without per-profile reads", async () => {
  const calls = [];
  const repository = { list: async options => {
    calls.push(options);
    const start = options.afterSlug ? 100 : 0;
    return { brands: Array.from({ length: start ? 50 : 100 }, (_, i) => ({ profile: { id: String(start + i) } })), nextCursor: start ? null : "brand-099" };
  }, getById: () => assert.fail("N+1 lookup"), getBySlug: () => assert.fail("N+1 lookup") };
  const profiles = await new ConsultantBrandIntelligenceRuntime(repository).getAll();
  assert.equal(profiles.length, 150);
  assert.equal(new Set(profiles.map(p => p.id)).size, 150);
  assert.deepEqual(calls, [{ limit: 100, afterSlug: undefined }, { limit: 100, afterSlug: "brand-099" }]);
});
test("missing publication stays absent; slug and public ID resolve through explicit repository methods", async () => {
  const calls = [];
  const runtime = new ConsultantBrandIntelligenceRuntime({ list: async () => ({ brands: [{ profile: null }], nextCursor: null }),
    getById: async id => { calls.push(["id", id]); return null; }, getBySlug: async slug => { calls.push(["slug", slug]); return null; } });
  assert.deepEqual(await runtime.getAll(), []);
  assert.equal(await runtime.getById("unknown"), null);
  assert.equal(await runtime.getById("brand_123"), null);
  assert.deepEqual(calls, [["slug", "unknown"], ["id", "brand_123"]]);
});
test("unavailable, incomplete and malformed reads fail closed without raw details or demo fallback", async () => {
  for (const error of ["offline", "missing fact economics.royalty", "malformed secret raw database detail"]) {
    const fail = async () => { throw new Error(error); };
    const runtime = new ConsultantBrandIntelligenceRuntime({ list: fail, getById: fail, getBySlug: fail });
    await assert.rejects(runtime.getAll(), { message: "Brand Intelligence could not be loaded." });
    await assert.rejects(runtime.getById("era-group"), { message: "Brand Intelligence could not be loaded." });
  }
  await assert.rejects(new ConsultantBrandIntelligenceRuntime().getAll(), /could not be loaded/);
  await assert.rejects(new ConsultantBrandIntelligenceRuntime({ list: async () => ({ brands: [], nextCursor: "repeated" }) }).getAll(), /could not be loaded/);
});
test("production composition uses user client and canonical factory; matching stays on SeedBrandRepository", () => {
  const production = readFileSync("feature/platform/composition/ProductionWorkspaceComposition.ts", "utf8");
  assert.match(production, /new ConsultantBrandIntelligenceRuntime\(createPersistedBrandIntelligenceRepository\(client, context\)\)/);
  assert.match(production, /client = await createServerSupabaseClient\(\)/);
  assert.doesNotMatch(production, /createAdmin|SERVICE_ROLE/);
  const matching = readFileSync("feature/brand-strategy/runtime/CandidateBrandStrategyRuntime.ts", "utf8");
  assert.match(matching, /new SeedBrandRepository/);
  assert.doesNotMatch(matching, /SupabaseBrandIntelligence|createPersistedBrandIntelligenceRepository/);
});
