import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("bootstrap action accepts no authoritative identity or role input", async () => {
  const action = await source("feature/workspace-bootstrap/actions/bootstrap-workspace.ts");
  assert.match(action, /resolveProductionWorkspaceSession\(\)/);
  assert.match(action, /needs-workspace-bootstrap/);
  assert.doesNotMatch(action, /formData\.get\(["'](?:userId|organizationId|membershipId|role)/);
});

test("bootstrap is production-only and demo composition remains isolated", async () => {
  const action = await source("feature/workspace-bootstrap/actions/bootstrap-workspace.ts");
  const demo = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  assert.match(action, /ProductionWorkspaceBootstrapService/);
  assert.doesNotMatch(demo, /bootstrap_first_workspace|ProductionWorkspaceBootstrap/);
});

test("unresolved production workspace routes to the short bootstrap experience", async () => {
  const layout = await source("app/(protected)/crm/layout.tsx");
  const page = await source("app/(protected)/onboarding/page.tsx");
  assert.match(layout, /needs-workspace-bootstrap[\s\S]*redirect\("\/onboarding"\)/);
  assert.match(page, /WorkspaceBootstrapForm/);
  assert.match(page, /status === "resolved"[\s\S]*redirect\("\/crm"\)/);
});

test("resolver preserves bootstrap, selection, and suspended outcomes", async () => {
  const resolver = await source("feature/platform/composition/ProductionWorkspaceSessionResolver.ts");
  assert.match(resolver, /workspace-selection-required/);
  assert.match(resolver, /status: "suspended"/);
  assert.match(resolver, /status: "needs-workspace-bootstrap"/);
});

test("database bootstrap serializes concurrent requests before membership inspection", async () => {
  const migration = await source("supabase/migrations/20260831165848_production_workspace_bootstrap.sql");
  const lock = migration.indexOf("pg_advisory_xact_lock");
  const membershipInspection = migration.indexOf("select count(*)");
  assert.ok(lock > 0 && membershipInspection > lock);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /existing_active_count > 1/);
  assert.doesNotMatch(migration, /proposed_(?:user|organization|membership|role)_id/);
});
