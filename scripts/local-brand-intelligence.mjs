import "../tests/fixtures/register-typescript.mjs";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { sixBrandFixtures, fixtureId, canonicalFacts, semanticFact, semanticIntelligence } from "../tests/fixtures/brand-intelligence-persistence.mjs";

export const localCredentials = { email: "bi-consultant@example.test", password: "Local-fixture-only-password-2026" };
export function localStatus() {
  const command = process.platform === "win32" ? ["cmd.exe", ["/d", "/s", "/c", "npx supabase status --output json"]] : ["npx", ["supabase", "status", "--output", "json"]];
  const status = JSON.parse(execFileSync(...command, { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }));
  assert.ok(status.API_URL && ["127.0.0.1", "localhost"].includes(new URL(status.API_URL).hostname), "Local Supabase required");
  return status;
}
async function ok(request) {
  const { data, error } = await request;
  if (error) throw new Error(`Local fixture operation failed (${error.code ?? "auth"}).`);
  return data;
}
export async function seedLocalBrands() {
  const status = localStatus();
  const auth = { persistSession: false, autoRefreshToken: false };
  const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, { auth });
  const client = createClient(status.API_URL, status.ANON_KEY, { auth });
  let login = await client.auth.signInWithPassword(localCredentials);
  if (login.error) {
    await ok(admin.auth.admin.createUser({ ...localCredentials, email_confirm: true }));
    login = await client.auth.signInWithPassword(localCredentials);
  }
  if (login.error || !login.data.user) throw new Error("Local consultant login failed.");
  const userId = login.data.user.id;
  const organizationId = fixtureId("bi-ui-organization");
  const membershipId = fixtureId("bi-ui-membership");
  assert.match(userId, /^[a-f0-9-]{36}$/);
  // Existing tenant tables intentionally have no service-role INSERT grant.
  // Only the fixed local Docker database receives this synthetic membership.
  execFileSync("docker", ["exec", "-i", "supabase_db_franchiseready-web", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q"], {
    input: `insert into public.organizations(id,public_id,name) values('${organizationId}','org_${organizationId.replaceAll("-", "")}','Brand Intelligence Local Fixtures') on conflict(id) do nothing;
      insert into public.organization_memberships(id,organization_id,user_id,role,status) values('${membershipId}','${organizationId}','${userId}','owner','active') on conflict(id) do nothing;`,
    encoding: "utf8", windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
  });
  const consultant = await ok(client.from("consultant_profiles").select("membership_id").eq("membership_id", membershipId).maybeSingle());
  if (!consultant) await ok(client.rpc("save_consultant_profile", {
    target_organization_id: organizationId, proposed_display_name: "Local Consultant",
    proposed_professional_title: "Franchise Consultant", proposed_professional_email: localCredentials.email,
    proposed_professional_phone: "", proposed_linkedin_url: "", proposed_scheduling_url: "",
  }));
  const fixtures = await sixBrandFixtures();
  for (const fixture of fixtures) {
    const existing = await ok(admin.from("brand_profile_versions").select("id,status").eq("id", fixture.profile.id).maybeSingle());
    if (existing) {
      assert.equal(existing.status, "published", "Incomplete fixture load: reset the disposable local database before retrying");
      continue;
    }
    await ok(admin.from("brand_identities").insert(fixture.identity));
    await ok(admin.from("brand_profile_versions").insert({ ...fixture.profile, status: "draft", reviewed_by: null, reviewed_at: null, published_at: null }));
    await ok(admin.from("brand_profile_facts").insert(fixture.facts));
    if (fixture.evidence.length) await ok(admin.from("brand_evidence").insert(fixture.evidence));
    if (fixture.links.length) await ok(admin.from("brand_fact_evidence").insert(fixture.links));
    await ok(admin.from("brand_profile_versions").update({ status: "reviewed", reviewed_by: fixture.profile.reviewed_by, reviewed_at: fixture.profile.reviewed_at }).eq("id", fixture.profile.id));
    await ok(admin.from("brand_profile_versions").update({ status: "published" }).eq("id", fixture.profile.id));
  }
  const { createPersistedBrandIntelligenceRepository } = await import("../feature/brand-library/repositories/createPersistedBrandIntelligenceRepository.ts");
  const repository = createPersistedBrandIntelligenceRepository(client, {
    user: { id: userId, email: localCredentials.email }, organization: { id: organizationId },
    membership: { id: membershipId, role: "owner", status: "active", managerMembershipId: null }, capabilities: [],
  });
  const persisted = await repository.list({ limit: 100 });
  for (const fixture of fixtures) {
    const profile = persisted.brands.find(brand => brand.slug === fixture.identity.slug)?.profile;
    assert.ok(profile, "Published local fixture must be accessible");
    assert.deepEqual(semanticIntelligence(profile), semanticIntelligence(fixture.canonical));
    assert.deepEqual(canonicalFacts(profile).map(([key, fact]) => [key, semanticFact(fact)]).sort(), canonicalFacts(fixture.canonical).map(([key, fact]) => [key, semanticFact(fact)]).sort());
  }
  console.log("Six local Brand Intelligence profiles loaded and semantically verified (unverified demo sources preserved).");
  return status;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const status = await seedLocalBrands();
  if (process.argv[2] === "e2e" || process.argv[2] === "dev") {
    const isTest = process.argv[2] === "e2e";
    const args = isTest ? ["scripts/run-e2e.mjs", "tests/e2e/brand-intelligence-production-persistence.spec.ts", "--project=chromium"] : ["node_modules/next/dist/bin/next", "dev"];
    const child = spawn(process.execPath, args, { stdio: "inherit", windowsHide: true, env: {
      ...process.env, PERSISTENCE_MODE: "supabase", NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
      APP_URL: isTest ? "http://127.0.0.1:3100" : "http://localhost:3000",
      RESEND_API_KEY: "", RESEND_WEBHOOK_SECRET: "", RESEND_FROM_EMAIL: "",
    } });
    child.on("exit", code => { process.exitCode = code ?? 1; });
  }
}
