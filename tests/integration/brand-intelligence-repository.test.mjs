import "../fixtures/register-typescript.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const { createPersistedBrandIntelligenceRepository } = await import("../../feature/brand-library/repositories/createPersistedBrandIntelligenceRepository.ts");
import { sixBrandFixtures, fixtureId, persistenceFixture, semanticIntelligence, semanticFact, canonicalFacts } from "../fixtures/brand-intelligence-persistence.mjs";

// Explicitly local: never consumes .env.local or hosted environment variables.
const statusCommand = process.platform === "win32"
  ? ["cmd.exe", ["/d", "/s", "/c", "npx supabase status --output json"]]
  : ["npx", ["supabase", "status", "--output", "json"]];
const status = JSON.parse(execFileSync(...statusCommand, { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }));
const endpoint = status.API_URL;
assert.ok(endpoint && ["127.0.0.1", "localhost"].includes(new URL(endpoint).hostname), "Integration test requires local Supabase API");
const authOptions = { persistSession: false, autoRefreshToken: false };
const admin = createClient(endpoint, status.SERVICE_ROLE_KEY, { auth: authOptions });
function localSQL(input) {
  execFileSync("docker", ["exec", "-i", "supabase_db_franchiseready-web", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q"],
    { input, encoding: "utf8", windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
}
async function ok(request) {
  const result = await request;
  if (result.error) throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.data;
}
const requests = [];
function userClient() {
  return createClient(endpoint, status.ANON_KEY, { auth: authOptions, global: {
    fetch: async (url, init) => {
      assert.equal(new URL(url).hostname, new URL(endpoint).hostname);
      requests.push({ path: new URL(url).pathname, method: init?.method ?? "GET" });
      return fetch(url, init);
    },
  } });
}
async function publish(fixture, createIdentity = true) {
  if (createIdentity) await ok(admin.from("brand_identities").insert(fixture.identity));
  await ok(admin.from("brand_profile_versions").insert({ ...fixture.profile, status: "draft", reviewed_by: null, reviewed_at: null, published_at: null }));
  await ok(admin.from("brand_profile_facts").insert(fixture.facts));
  if (createIdentity && fixture.evidence.length) await ok(admin.from("brand_evidence").insert(fixture.evidence));
  if (fixture.links.length) await ok(admin.from("brand_fact_evidence").insert(fixture.links));
  if (fixture.editorial.length) await ok(admin.from("brand_consultant_items").insert(fixture.editorial));
  await ok(admin.from("brand_profile_versions").update({ status: "reviewed", reviewed_by: fixture.profile.reviewed_by, reviewed_at: fixture.profile.reviewed_at }).eq("id", fixture.profile.id));
  await ok(admin.from("brand_profile_versions").update({ status: "published" }).eq("id", fixture.profile.id));
}

test("local Supabase repository acceptance (reset local DB before and after this suite)", async t => {
  const fixtures = await sixBrandFixtures();
  const contexts = [];
  const clients = [];
  for (const suffix of ["a", "b"]) {
    const email = `bi-repository-${suffix}@example.test`;
    const password = "Local-fixture-only-password-2026";
    const user = await ok(admin.auth.admin.createUser({ email, password, email_confirm: true }));
    const org = fixtureId(`repository-org-${suffix}`);
    const member = fixtureId(`repository-member-${suffix}`);
    assert.match(user.user.id, /^[a-f0-9-]{36}$/);
    // Existing tenant tables intentionally lack service-role INSERT grants.
    // Provision disposable tenant fixtures through local psql, as pgTAP does.
    localSQL(`insert into public.organizations(id,public_id,name) values('${org}','org_${org.replaceAll("-", "")}','Fixture ${suffix}');
      insert into public.organization_memberships(id,organization_id,user_id,role,status) values('${member}','${org}','${user.user.id}','owner','active');`);
    const client = userClient();
    await ok(client.auth.signInWithPassword({ email, password }));
    contexts.push({ user: { id: user.user.id, email }, organization: { id: org, publicId: `org_${org.replaceAll("-", "")}`, name: `Fixture ${suffix}` },
      membership: { id: member, role: "owner", status: "active", managerMembershipId: null }, capabilities: [] });
    clients.push(client);
  }
  const restricted = fixtures.find(f => f.identity.slug === "routewise-mobile-services");
  restricted.identity.visibility = "restricted";
  for (const fixture of fixtures) await publish(fixture);
  await ok(admin.from("organization_brands").insert({ organization_id: contexts[0].organization.id, brand_id: restricted.identity.id }));
  const repositories = clients.map((client, i) => createPersistedBrandIntelligenceRepository(client, contexts[i]));

  await t.test("all six round-trip through real user-scoped API reads", async () => {
    requests.length = 0;
    const page = await repositories[0].list();
    assert.equal(page.brands.length, 6);
    assert.equal(page.nextCursor, null);
    assert.equal(requests.length, 6, "one auth, one catalog, four batched content queries");
    for (const fixture of fixtures) {
      const actual = page.brands.find(b => b.slug === fixture.identity.slug).profile;
      assert.deepEqual(semanticIntelligence(actual), semanticIntelligence(fixture.canonical));
      assert.deepEqual(canonicalFacts(actual).map(([key, f]) => [key, semanticFact(f)]).sort(), canonicalFacts(fixture.canonical).map(([key, f]) => [key, semanticFact(f)]).sort());
      assert.equal((await repositories[0].getById(fixture.identity.public_id)).id, actual.id);
      assert.equal((await repositories[0].getBySlug(fixture.identity.slug)).id, actual.id);
    }
    assert.ok(requests.every(r => r.method === "GET" || (r.method === "POST" && r.path.endsWith("/rpc/current_active_membership_id"))), "repository introduces no writes");
  });
  await t.test("tenant visibility and inaccessible associations", async () => {
    assert.equal((await repositories[1].list()).brands.length, 5);
    assert.equal(await repositories[1].getBySlug(restricted.identity.slug), null);
    assert.ok(await repositories[1].getBySlug("era-group"));
    const canonicalBefore = await ok(admin.from("brand_identities").select("*").eq("id", restricted.identity.id).single());
    await ok(admin.from("organization_brands").update({ status: "inactive" }).eq("brand_id", restricted.identity.id));
    assert.equal(await repositories[0].getBySlug(restricted.identity.slug), null);
    assert.deepEqual(await ok(admin.from("brand_identities").select("*").eq("id", restricted.identity.id).single()), canonicalBefore);
    await ok(admin.from("organization_brands").update({ status: "active" }).eq("brand_id", restricted.identity.id));
    const invalid = createPersistedBrandIntelligenceRepository(clients[1], contexts[0]);
    await assert.rejects(invalid.list(), /could not be loaded/);
    const denied = await clients[1].from("brand_identities").update({ name: "Unauthorized" }).eq("id", restricted.identity.id);
    assert.equal(denied.error.code, "42501");
  });
  await t.test("a multi-org user's selected workspace still bounds restricted inventory", async () => {
    const membership = fixtureId("repository-multi-org");
    localSQL(`insert into public.organization_memberships(id,organization_id,user_id,role,status) values('${membership}','${contexts[1].organization.id}','${contexts[0].user.id}','admin','active');`);
    const context = { ...contexts[0], organization: contexts[1].organization, membership: { ...contexts[0].membership, id: membership, role: "admin" } };
    assert.equal(await createPersistedBrandIntelligenceRepository(clients[0], context).getBySlug(restricted.identity.slug), null);
  });
  await t.test("pagination, inactive lookup and missing publication are explicit", async () => {
    const first = await repositories[0].list({ limit: 2 });
    const second = await repositories[0].list({ limit: 2, afterSlug: first.nextCursor });
    assert.equal(new Set([...first.brands, ...second.brands].map(b => b.id)).size, 4);
    await ok(admin.from("brand_identities").update({ lifecycle: "inactive" }).eq("id", fixtures[0].identity.id));
    assert.equal((await repositories[0].getById(fixtures[0].identity.public_id)).brandStatus, "inactive");
    assert.equal((await repositories[0].list()).brands.length, 5);
    assert.equal((await repositories[0].list({ includeInactive: true })).brands.length, 6);
    const empty = { ...fixtures[0].identity, id: fixtureId("empty-brand"), public_id: `brand_${fixtureId("empty-brand").replaceAll("-", "")}`, slug: "empty-brand" };
    await ok(admin.from("brand_identities").insert(empty));
    assert.equal(await repositories[0].getBySlug("empty-brand"), null);
    assert.equal((await repositories[0].list()).brands.find(b => b.slug === "empty-brand").profile, null);
  });
  await t.test("current publication excludes newer draft/review versions and loads editorial content", async () => {
    const next = persistenceFixture(fixtures[1].canonical, 2);
    next.profile.based_on_profile_id = fixtures[1].profile.id;
    next.editorial.push({ id: fixtureId("local-editorial"), profile_id: next.profile.id, section: "note", position: 0,
      label: "Local review note", explanation: "Source verification remains outstanding.", source_facts: ["description"], origin: "editorial",
      origin_reference: "local-review", created_by: "fixture", created_at: next.profile.created_at,
      review_state: "reviewed", reviewed_by: "fixture", reviewed_at: next.profile.reviewed_at, approval: "internal-only" });
    await publish(next, false);
    const draft = { ...next.profile, id: fixtureId("newer-draft"), version_number: 3, status: "draft", reviewed_by: null, reviewed_at: null, published_at: null };
    await ok(admin.from("brand_profile_versions").insert(draft));
    assert.equal((await repositories[0].getBySlug(next.identity.slug)).version.number, 2);
    await ok(admin.from("brand_profile_facts").insert(next.facts.map(f => ({ ...f, profile_id: draft.id }))));
    await ok(admin.from("brand_profile_versions").update({ status: "reviewed", reviewed_by: "fixture", reviewed_at: next.profile.reviewed_at }).eq("id", draft.id));
    const current = await repositories[0].getBySlug(next.identity.slug);
    assert.equal(current.version.number, 2);
    assert.equal(current.editorialItems[0].originReference, "local-review");
  });
  await t.test("anonymous access fails without demo fallback", async () => {
    const anonymous = createClient(endpoint, status.ANON_KEY, { auth: authOptions });
    await assert.rejects(createPersistedBrandIntelligenceRepository(anonymous, contexts[0]).list(), /could not be loaded/);
  });
  await t.test("batched reads paginate past 500 facts without per-brand queries", async () => {
    for (let i = 0; i < 6; i++) {
      const canonical = structuredClone(fixtures[0].canonical);
      canonical.id = `pagination-fixture-${i}`;
      for (const [, fact] of canonicalFacts(canonical)) fact.evidence = [];
      await publish(persistenceFixture(canonical));
    }
    requests.length = 0;
    const page = await repositories[0].list({ limit: 100, includeInactive: true });
    assert.equal(page.brands.filter(b => b.profile !== null).length, 12);
    assert.equal(requests.filter(r => r.path.endsWith("/brand_profile_facts")).length, 2);
    assert.equal(requests.length, 7);
  });
});
