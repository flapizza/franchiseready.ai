import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("invitation creation derives actor workspace and generates a strong server token", async () => {
  const action = await source("feature/membership-invitations/actions/invitation-actions.ts");
  assert.match(action,/resolveWorkspaceComposition\(\)/);
  assert.match(action,/randomBytes\(32\)\.toString\("base64url"\)/);
  assert.doesNotMatch(action,/formData\.get\(["'](?:organizationId|membershipId|userId)/);
  assert.match(action,/role === "admin"[\s\S]*membership\.role !== "owner"/);
});

test("public token route renders each lifecycle state and preserves login handoff", async () => {
  const page = await source("app/(public)/invite/[token]/page.tsx");
  for (const state of ["invalid","expired","revoked","accepted","available"]) assert.match(page,new RegExp(state));
  assert.match(page,/\/login\?next=/);
  assert.match(page,/AcceptInvitationForm/);
});

test("invitation persistence hashes tokens and acceptance verifies confirmed email", async () => {
  const migration = await source("supabase/migrations/20260831171049_production_membership_invitations.sql");
  assert.match(migration,/extensions\.digest\(presented_token,'sha256'\)/);
  assert.match(migration,/recipient\.email_confirmed_at is null/);
  assert.match(migration,/lower\(btrim\(recipient\.email\)\)<>invitation\.invited_email/);
  assert.match(migration,/for update/);
  assert.doesNotMatch(migration,/token[^\n]* text not null/);
});

test("demo composition cannot create or accept production invitations", async () => {
  const demo = await source("feature/platform/composition/DemoWorkspaceComposition.ts");
  assert.doesNotMatch(demo,/MembershipInvitation|membership_invitations|accept_membership_invitation/);
});
