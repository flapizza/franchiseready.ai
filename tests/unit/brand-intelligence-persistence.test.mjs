import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BrandIntelligenceRuntime } from "../../feature/brand-library/runtime/BrandIntelligenceRuntime.ts";

function factPaths(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  if (Object.hasOwn(value, "value") && Object.hasOwn(value, "verification")) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    key === "consultantIntelligence" ? [] : factPaths(child, prefix ? `${prefix}.${key}` : key));
}

test("persisted fact registry covers the canonical facts of all six profiles exactly", async () => {
  const sql = await readFile(new URL("../../supabase/migrations/20260908140956_brand_intelligence_foundation.sql", import.meta.url), "utf8");
  const seed = sql.split("insert into public.brand_fact_definitions(fact_key,value_kind,allowed_values) values")[1].split(";")[0];
  const keys = [...seed.matchAll(/\('([^']+)',/g)].map((match) => match[1]).sort();
  assert.equal(new Set(keys).size, 50);
  for (const profile of await new BrandIntelligenceRuntime().getAll()) {
    assert.deepEqual(keys, factPaths(profile).sort(), profile.id);
  }
});
