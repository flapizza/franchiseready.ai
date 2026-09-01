import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("contact schema establishes one tenant-owned person identity and additive candidate bridge", async () => {
  const migration = await source("supabase/migrations/20260901173044_person_contact_foundation.sql");
  assert.match(migration, /create table public\.contacts/);
  assert.match(migration, /unique index contacts_organization_email_key/);
  assert.match(migration, /where normalized_primary_email is not null/);
  assert.match(migration, /alter table public\.candidates add column contact_id uuid/);
  assert.match(migration, /on delete restrict/);
  assert.doesNotMatch(migration, /on delete cascade/);
});

test("contact and marketing permission states remain separate", async () => {
  const [model, migration] = await Promise.all([
    source("feature/contacts/models/Contact.ts"),
    source("supabase/migrations/20260901173044_person_contact_foundation.sql"),
  ]);
  assert.match(model, /ContactLifecycleStatus/);
  assert.match(model, /MarketingPermissionStatus/);
  assert.match(migration, /marketing_email_status/);
  assert.match(migration, /marketing_sms_status/);
  assert.match(migration, /'unknown', 'opted-in', 'opted-out', 'suppressed'/);
});

test("production contacts are composed and cannot fall back to demo adapters", async () => {
  const [production, demo, resolver] = await Promise.all([
    source("feature/platform/composition/ProductionWorkspaceComposition.ts"),
    source("feature/platform/composition/DemoWorkspaceComposition.ts"),
    source("feature/platform/composition/resolveWorkspaceComposition.ts"),
  ]);
  assert.match(production, /contacts: new SupabaseContactRepository\(client, context\)/);
  assert.doesNotMatch(production, /SeedContactRepository/);
  assert.match(demo, /contacts: new SeedContactRepository\(candidates\)/);
  assert.doesNotMatch(resolver, /catch/);
});

test("contact mutations validate on the server and derive repositories from composition", async () => {
  const action = await source("feature/contacts/actions/contact-actions.ts");
  assert.match(action, /const schema = z\.object/);
  assert.match(action, /resolveWorkspaceComposition\(\)/);
  assert.match(action, /composition\.dependencies\.contacts/);
  assert.doesNotMatch(action, /organizationId|SupabaseContactRepository|SeedContactRepository/);
});

test("promotion is authenticated atomic and duplicate-safe", async () => {
  const migration = await source("supabase/migrations/20260901173044_person_contact_foundation.sql");
  assert.match(migration, /function public\.promote_contact_to_candidate/);
  assert.match(migration, /auth\.uid\(\) is null/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /This contact already has a candidate profile/);
  assert.match(migration, /contact_record\.id/);
  assert.match(migration, /'active', 'lead'/);
});

test("contacts workspace is bounded responsive and exposes honest states", async () => {
  const [repository, workspace, form, detail] = await Promise.all([
    source("feature/contacts/repositories/SupabaseContactRepository.ts"),
    source("feature/contacts/components/ContactsWorkspace.tsx"),
    source("feature/contacts/components/ContactForm.tsx"),
    source("feature/contacts/components/ContactDetail.tsx"),
  ]);
  assert.match(repository, /Math\.min\(Math\.max\(query\.limit, 1\), 50\)/);
  assert.match(repository, /nextCursor/);
  assert.match(workspace, /No contacts yet/);
  assert.match(workspace, /No contacts match these filters/);
  assert.match(workspace, /md:hidden/);
  assert.match(form, /role=\{state\.status === "success" \? "status" : "alert"\}/);
  assert.match(detail, /PromoteContact/);
});

test("linked candidate writes preserve the contact source of truth", async () => {
  const repository = await source("feature/crm/repositories/SupabaseCandidateRepository.ts");
  assert.match(repository, /select\("contact_id"\)/);
  assert.match(repository, /from\("contacts"\)\.update/);
  assert.match(repository, /persisted\.contact_id \? \{\}/);
});

test("frozen IFPG scenario remains untouched by the contacts adapter", async () => {
  const demo = await source("feature/contacts/repositories/SeedContactRepository.ts");
  const reset = await source("app/(protected)/crm/test-reset/route.ts");
  assert.match(demo, /this\.candidates\.getAll\(\)/);
  assert.doesNotMatch(demo, /conferenceScenario|demoCandidateOverlayStore|IFPG Candidate Story/);
  assert.match(reset, /ifpg-conference-demo-v1/);
});
