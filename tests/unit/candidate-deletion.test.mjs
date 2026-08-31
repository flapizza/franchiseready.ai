import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("candidate deletion is RPC-only, organization-safe, and dependency guarded", async () => {
  const migration = await read("supabase/migrations/20260828120000_candidate_deletion_rpc.sql");
  assert.match(migration, /security definer[\s\S]*set search_path = ''/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /public\.can_access_candidate/);
  for (const table of ["candidate_assignment_history", "assessment_sessions", "discovery_sessions", "discovery_observations", "discovery_intelligence", "email_messages"]) assert.match(migration, new RegExp(`public\\.${table}`));
  assert.doesNotMatch(migration, /grant delete on table public\.candidates/i);
  assert.doesNotMatch(migration, /cascade/i);
});

test("server action requires confirmation and returns only fixed messages", async () => {
  const action = await read("feature/crm/actions/candidate-deletion.ts");
  assert.match(action, /formData\.get\("confirmed"\) !== "yes"/);
  assert.match(action, /resolveWorkspaceComposition\(\)/);
  assert.match(action, /composition\.dependencies\.candidates\.deleteById\(candidateId\)/);
  assert.match(action, /redirect\("\/crm\/candidates"\)/);
  assert.doesNotMatch(action, /error\.message|String\(error\)/);
});

test("candidate workspace exposes an explicit two-step confirmation control", async () => {
  const component = await read("feature/crm/components/DeleteCandidateControl.tsx");
  const page = await read("feature/candidate-360/components/Candidate360Page.tsx");
  assert.match(component, />Delete Candidate</);
  assert.match(component, /type="checkbox"[\s\S]*name="confirmed"[\s\S]*required/);
  assert.match(component, /"Confirm Delete"/);
  assert.match(page, /isProduction && <section aria-label="Candidate administration"/);
  assert.match(page, /<DeleteCandidateControl candidateId=\{candidate\.id\}/);
});
