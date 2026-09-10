import '../fixtures/register-typescript.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const { SupabaseCandidateRepository } = await import('../../feature/crm/repositories/SupabaseCandidateRepository.ts');
const { SupabaseCandidateWorkspaceRepository } = await import('../../feature/crm/repositories/SupabaseCandidateWorkspaceRepository.ts');

// Run against the locally cloned showroom fixture; never read hosted credentials.
test('persisted workspace evidence enforces real user RLS and remains read-only', async () => {
  const status = JSON.parse(execFileSync('cmd.exe', ['/d','/s','/c','npx supabase status --workdir .next-dev/checkpoint14a/local --output json'], {encoding:'utf8', windowsHide:true, stdio:['ignore','pipe','pipe']}));
  assert.equal(new URL(status.API_URL).hostname, '127.0.0.1');
  const options = {auth:{persistSession:false,autoRefreshToken:false}};
  const admin = createClient(status.API_URL,status.SERVICE_ROLE_KEY,options);
  const owner = createClient(status.API_URL,status.ANON_KEY,options);
  const signed = await owner.auth.signInWithPassword({email:'ifpg001-local-owner@example.test',password:'Local-IFPG-2026-only!'});
  assert.equal(signed.error,null);
  const membership = await owner.from('organization_memberships').select('id,organization_id').eq('user_id',signed.data.user.id).single();
  assert.equal(membership.error,null);
  const ctx = {organization:{id:membership.data.organization_id}};
  const repository = client => new SupabaseCandidateWorkspaceRepository(client,ctx,new SupabaseCandidateRepository(client,ctx));
  const rows = await repository(owner).load();
  assert.equal(rows.length,12);
  assert.equal(rows.filter(r=>r.assessment?.analysis).length,8);
  assert.equal(rows.filter(r=>r.discovery).length,3);
  const foreign = createClient(status.API_URL,status.ANON_KEY,options);
  const email = `ifpg-isolation-${randomUUID()}@example.test`, password='Local-isolation-only-2026!';
  const created = await admin.auth.admin.createUser({email,password,email_confirm:true});
  assert.equal(created.error,null);
  try {
    assert.equal((await foreign.auth.signInWithPassword({email,password})).error,null);
    assert.deepEqual(await repository(foreign).load(),[],'Forged organization context cannot bypass RLS');
    assert.equal(await repository(foreign).get(rows[0].candidate.id),null);
    for (const table of ['assessment_sessions','assessment_analyses','discovery_sessions','discovery_observations','discovery_intelligence']) {
      const result=await foreign.from(table).select('id').eq('organization_id',ctx.organization.id);
      assert.equal(result.error,null); assert.deepEqual(result.data,[],table);
    }
    assert.deepEqual(await repository(owner).load(),rows,'Reading does not create Discovery or mutate evidence');
  } finally { await foreign.auth.signOut(); await admin.auth.admin.deleteUser(created.data.user.id); await owner.auth.signOut(); }
});
