import '../fixtures/register-typescript.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
const {assessmentSharingState}=await import('../../feature/crm/services/AssessmentSharingState.ts');
const {assessmentInvitationPath,createAssessmentToken}=await import('../../feature/assessment-engine/production/token.ts');
const session={id:'session',status:'invited',expiresAt:'2030-01-01T00:00:00Z',revokedAt:null};
test('sharing uses real session lifecycle and preserves completed evidence',()=>{
 const state=(extra={})=>assessmentSharingState({...session,...extra},Date.parse('2026-09-10'));
 assert.equal(assessmentSharingState(null).label,'Not started');assert.equal(state().label,'Invitation active');assert.equal(state().replace,true);
 assert.equal(state({status:'in-progress'}).label,'In progress');
 for(const extra of [{expiresAt:'2026-01-01'}, {status:'cancelled'}, {status:'expired'}, {revokedAt:'2026-09-09'}]){assert.equal(state(extra).label,'Expired or replaced');assert.equal(state(extra).replace,true);}
 assert.equal(state({status:'analyzed',expiresAt:'2020-01-01'}).label,'Completed');assert.equal(state({status:'analyzed'}).canGenerate,false);assert.equal(state({status:'submitted'}).canGenerate,false);
});
test('invitation path resolves on the consultant origin without deployment hostname or token weakening',()=>{
 const token=createAssessmentToken(),path=assessmentInvitationPath(token);assert.match(token,/^[A-Za-z0-9_-]{43}$/);assert.equal(path,`/assessment/invitation/${token}`);
 assert.equal(new URL(path,'https://demo.frangroove.com/crm').origin,'https://demo.frangroove.com');assert.throws(()=>assessmentInvitationPath('//external.example'));assert.throws(()=>assessmentInvitationPath('../invalid'));
});
