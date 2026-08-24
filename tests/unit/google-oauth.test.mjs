import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createOAuthState, createPkceChallenge, createPkceVerifier, isSafeEmailSettingsReturnPath, sha256, validateOAuthTransaction } from "../../feature/connected-email/oauth/oauth-security.ts";
import { normalizeGoogleIdentity } from "../../feature/connected-email/providers/google/google-identity.ts";

test("PKCE uses distinct high-entropy verifiers and stable S256 challenges", async () => {
  const first = createPkceVerifier();
  const second = createPkceVerifier();
  assert.notEqual(first, second);
  assert.ok(first.length >= 43);
  assert.match(await createPkceChallenge(first), /^[A-Za-z0-9_-]{43}$/);
  assert.equal(await sha256("state"), "4ba69735ca53765ed6a709edb56c6ea236b7193a3b29a6b390c346f0f4340e4e");
  assert.notEqual(createOAuthState(), createOAuthState());
});

test("OAuth transaction rejects expiry and session, membership, organization, provider, or verifier mismatch", async () => {
  const verifierHash = await sha256("verifier");
  const transaction = { provider: "google", organization_id: "org-1", owner_membership_id: "member-1", user_id: "user-1",
    expires_at: "2030-01-01T00:05:00.000Z", pkce_verifier_hash: verifierHash };
  const valid = { transaction, provider: "google", organizationId: "org-1", membershipId: "member-1", userId: "user-1", verifierHash, now: Date.parse("2030-01-01T00:00:00.000Z") };
  assert.equal(validateOAuthTransaction(valid), true);
  assert.equal(validateOAuthTransaction({ ...valid, now: Date.parse("2030-01-01T00:06:00.000Z") }), false);
  assert.equal(validateOAuthTransaction({ ...valid, userId: "user-2" }), false);
  assert.equal(validateOAuthTransaction({ ...valid, membershipId: "member-2" }), false);
  assert.equal(validateOAuthTransaction({ ...valid, organizationId: "org-2" }), false);
  assert.equal(validateOAuthTransaction({ ...valid, provider: "microsoft" }), false);
  assert.equal(validateOAuthTransaction({ ...valid, verifierHash: await sha256("other") }), false);
  assert.equal(validateOAuthTransaction({ ...valid, transaction: null }), false);
});

test("return paths remain inside Connected Email settings", () => {
  assert.equal(isSafeEmailSettingsReturnPath("/settings/email?google=connected"), true);
  assert.equal(isSafeEmailSettingsReturnPath("https://evil.example/settings/email"), false);
  assert.equal(isSafeEmailSettingsReturnPath("/crm"), false);
});

test("successful Google account identity is normalized without token material", () => {
  assert.deepEqual(normalizeGoogleIdentity({ sub: " 12345 ", email: " Consultant@Example.COM ", email_verified: true, name: "  Jamie Consultant  " }),
    { provider: "google", providerAccountId: "12345", emailAddress: "consultant@example.com", displayName: "Jamie Consultant" });
  assert.throws(() => normalizeGoogleIdentity({ sub: "12345", email: "unverified@example.com", email_verified: false }));
});

test("authorization source contains only the approved send-only Gmail scope", async () => {
  const source = await readFile(new URL("../../feature/connected-email/providers/google/GoogleConnectionProvider.ts", import.meta.url), "utf8");
  const connectionScopeBlock = source.match(/GOOGLE_CONNECTION_SCOPES = Object\.freeze\(\[([^\]]+)\]/s)?.[1] ?? "";
  assert.match(connectionScopeBlock, /openid/);
  assert.match(connectionScopeBlock, /email/);
  assert.match(connectionScopeBlock, /profile/);
  assert.match(connectionScopeBlock, /GOOGLE_SEND_SCOPE/);
  assert.doesNotMatch(connectionScopeBlock, /gmail\.readonly|gmail\.modify|mail\.google\.com/);
  assert.match(source, /access_type: "offline"/);
  assert.match(source, /include_granted_scopes: "true"/);
  assert.match(source, /code_challenge_method: "S256"/);
});

test("credential and settings boundaries do not serialize token fields", async () => {
  const settings = await readFile(new URL("../../app/(protected)/settings/email/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(settings, /accessToken|refreshToken|encrypted_payload|GOOGLE_CLIENT_SECRET/);
  const migration = await readFile(new URL("../../supabase/migrations/20260824120000_gmail_001_connected_accounts.sql", import.meta.url), "utf8");
  assert.match(migration, /revoke all on public\.connected_email_credentials from authenticated/);
  assert.doesNotMatch(migration, /grant .*connected_email_credentials to authenticated/i);
});

test("callback denial, replay consumption, duplicate ownership, and disconnect invalidation are explicit", async () => {
  const callback = await readFile(new URL("../../app/(protected)/auth/google/callback/route.ts", import.meta.url), "utf8");
  assert.match(callback, /params\.get\("error"\) === "access_denied"/);
  const transactions = await readFile(new URL("../../feature/connected-email/repositories/OAuthTransactionRepository.ts", import.meta.url), "utf8");
  assert.match(transactions, /\.delete\(\).*\.eq\("state_hash"/s);
  const credentials = await readFile(new URL("../../feature/connected-email/services/ConnectedEmailCredentialService.ts", import.meta.url), "utf8");
  assert.match(credentials, /existingAccount\.owner_membership_id !== context\.membership\.id/);
  const connection = await readFile(new URL("../../feature/connected-email/services/GoogleConnectionService.ts", import.meta.url), "utf8");
  assert.match(connection, /provider\.revoke/);
  assert.match(connection, /credentials\.destroy/);
  assert.match(connection, /status: "disconnected"/);
});
