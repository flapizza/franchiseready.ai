import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("production composition owns profile, organization settings, and onboarding adapters", async () => {
  const source = await readFile(new URL("../../feature/platform/composition/ProductionWorkspaceComposition.ts", import.meta.url), "utf8");
  for (const adapter of ["ProductionConsultantProfileRepository", "ProductionOrganizationSettingsRepository", "ProductionMembershipOnboardingRepository"]) assert.match(source, new RegExp(`new ${adapter}\\(`));
  assert.match(source, /profile\?\.displayName/);
  assert.doesNotMatch(source, /DemoConsultant|SeedConsultant/);
});

test("profile writes use atomic RPC boundaries and never direct table mutation", async () => {
  const profile = await readFile(new URL("../../feature/consultant-profile/repositories/ProductionConsultantProfileRepository.ts", import.meta.url), "utf8");
  const settings = await readFile(new URL("../../feature/organization-settings/repositories/ProductionOrganizationSettingsRepository.ts", import.meta.url), "utf8");
  assert.match(profile, /rpc\("save_consultant_profile"/);
  assert.match(settings, /rpc\("save_organization_settings"/);
  assert.doesNotMatch(profile, /from\("consultant_profiles"\)\.upsert/);
  assert.doesNotMatch(settings, /from\("organization_settings"\)\.upsert/);
});
