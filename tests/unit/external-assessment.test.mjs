import '../fixtures/register-typescript.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const {assessmentInvitationUrl,createAssessmentToken,hashAssessmentToken} = await import('../../feature/assessment-engine/production/token.ts');
const {publicSession,PublicAssessmentRepository} = await import('../../feature/assessment-engine/production/PublicAssessmentRepository.ts');
const {AssessmentReportService} = await import('../../feature/assessment-reports/services/AssessmentReportService.ts');
const {isAssessmentProgress,submissionErrors,intakeFields,intakeEnums,responseContract} = await import('../../feature/assessment-engine/production/validation.ts');
const {isProtectedPath} = await import('../../lib/auth/routes.ts');
const {ProductionCandidateResolutionService} = await import('../../feature/crm/services/ProductionCandidateResolutionService.ts');
const {TrustedAssessmentSubmission} = await import('../../feature/assessment-engine/production/TrustedAssessmentSubmission.ts');
const {ConferenceAssessmentAnalysisService} = await import('../../feature/assessment-engine/conference/ConferenceAssessmentAnalysisService.ts');
const {personaIntake,baselineAnswers} = await import('../fixtures/conference-assessment-personas.mjs');
const progress=()=>({stage:'concerns',section:6,intake:{...personaIntake},answers:baselineAnswers(),consent:true,startedAt:'2026-09-08T12:00:00Z'});
test('only exact invitation and candidate result routes bypass authentication',()=>{
 for(const p of ['/assessment/invitation/abc','/assessment/invitation/abc/results','/assessment/invitation/abc/report']) assert.equal(isProtectedPath(p),false,p);
 for(const p of ['/assessment','/assessment/start','/assessment/example/results','/assessment/invitation','/assessment/invitation/a/private','/assessment//invitation/a','/assessment/invitation/a//results','/assessment/invitation/a%2Fb','/assessment/invitation/../private','/assessment/invitation/a/results/private','/crm']) assert.equal(isProtectedPath(p),true,p);
});
test('candidate schema rejects malformed types, protected fields and unsupported answers',()=>{
 assert.equal(isAssessmentProgress(progress()),true);assert.deepEqual(submissionErrors(progress()),[]);
 for(const value of [null,{}, {...progress(),organization_id:'other'}, {...progress(),answers:{q1:'bad'}}, {...progress(),answers:{unknown:[]}}, {...progress(),answers:{q1:['invalid']}}, {...progress(),intake:{...personaIntake,analysis:{}}}, {...progress(),answers:{q3:['Within 6 months','invalid']}}]) assert.equal(isAssessmentProgress(value),false);
 assert.ok(submissionErrors({...progress(),consent:false}).length);
});
test('resolver uses tenant-scoped repository and normalized evidence without demo fallback',async()=>{
 const calls=[];const repository={getById:async()=>null,findByNormalizedEmail:async(m,e)=>{calls.push([m,e]);return [{id:'cand_1'}]},findByNormalizedPhone:async()=>{throw Error('phone must not override email')}};
 const r=new ProductionCandidateResolutionService(repository);
 assert.deepEqual(await r.resolve({consultantId:'member',email:' Owner@Example.com '}),{status:'matched',candidateId:'cand_1',method:'normalized-email'});
 assert.deepEqual(calls,[['member','owner@example.com']]);
 repository.findByNormalizedEmail=async()=>[{id:'b'},{id:'a'}];assert.deepEqual((await r.resolve({consultantId:'member',email:'x@y.test'})).candidateIds,['a','b']);
});
test('trusted submit derives existing deterministic analysis and rejects injected analysis',async()=>{
 const p=progress();const calls=[];const client={rpc:async(name,args)=>{calls.push([name,args]);return {data:{public_id:'asmt_local',status:'analyzed',completed_at:'now',progress_snapshot:null,candidate_analysis:null},error:null}}};
 const service=new TrustedAssessmentSubmission(client);
 assert.equal((await service.complete('a'.repeat(43),{...p,analysis:{forged:true}})).ok,false);assert.equal(calls.length,0);
 assert.equal((await service.complete('a'.repeat(43),p)).ok,true);
 assert.equal(calls[0][0],'finalize_assessment_trusted');
 assert.deepEqual(calls[0][1].authoritative_analysis,new ConferenceAssessmentAnalysisService().analyze(p.intake,p.answers));
 assert.deepEqual(calls[0][1].candidate_progress,p);
 await service.complete('a'.repeat(43),p);assert.deepEqual(calls[1],calls[0]);
});

test('database evidence contract stays synchronized with the questionnaire validator',()=>{
 const sql=readFileSync(new URL('../../supabase/migrations/20260908190607_harden_external_assessment_submission.sql',import.meta.url),'utf8');
 const literal=sql.match(/as \$contract\$ select '(.*)'::jsonb \$contract\$/)?.[1];assert.ok(literal);
 const contract=JSON.parse(literal.replaceAll("''","'"));
 assert.deepEqual(contract.intakeFields,intakeFields);assert.deepEqual(contract.intakeEnums,intakeEnums);
 assert.deepEqual(contract.responses,JSON.parse(JSON.stringify(responseContract)));
});

test('canonical invitation URLs and tokens do not depend on trailing slash or origin path',()=>{
 const token=createAssessmentToken();assert.match(token,/^[A-Za-z0-9_-]{43}$/);
 for(const origin of ['https://app.example.test','https://app.example.test/','https://app.example.test/path']) assert.equal(assessmentInvitationUrl(origin,token),`https://app.example.test/assessment/invitation/${token}`);
 assert.match(hashAssessmentToken(token),/^[a-f0-9]{64}$/);
 assert.throws(()=>hashAssessmentToken('../invalid'));assert.throws(()=>assessmentInvitationUrl('https://app.example.test','bad'));
});

test('resolver handles trusted IDs, phone evidence, absent identity and repository failure',async()=>{
 const repository={getById:async(id)=>id==='known'?{id}:null,findByNormalizedEmail:async()=>[],findByNormalizedPhone:async(m,p)=>{assert.equal(p,'4075550100');return [{id:'phone'}]}};
 const r=new ProductionCandidateResolutionService(repository);
 assert.deepEqual(await r.resolve({trustedCandidateId:'known'}),{status:'matched',candidateId:'known',method:'trusted-candidate-id'});
 for(const request of [{},{trustedCandidateId:'missing'},{assessmentInvitationId:'untrusted'}]) assert.deepEqual(await r.resolve(request),{status:'not-found'});
 assert.deepEqual(await r.resolve({phone:'(407) 555-0100'}),{status:'matched',candidateId:'phone',method:'normalized-phone'});
 repository.findByNormalizedEmail=async()=>{throw Error('offline')};await assert.rejects(()=>r.resolve({email:'x@y.test'}),/offline/);
});

test('public repository returns only candidate DTO and sanitizes database errors',async()=>{
 const analysis=new ConferenceAssessmentAnalysisService().analyze(personaIntake,baselineAnswers());
 const safe={ownershipProfile:analysis.ownershipProfile,financial:analysis.financial,instrumentVersion:analysis.instrumentVersion,analysisVersion:analysis.analysisVersion};
 const row={public_id:'asmt_safe',status:'analyzed',last_saved_at:'now',completed_at:'now',progress_snapshot:null,candidate_analysis:safe,organization_id:'private',analysis_snapshot:analysis};
 const dto=publicSession(row);assert.deepEqual(dto.analysis,safe);assert.equal(dto.progress,null);assert.equal('organization_id' in dto,false);assert.equal('analysis_snapshot' in dto,false);
 const client={rpc:async()=>({data:row,error:null})};const repo=new PublicAssessmentRepository(client);
 assert.deepEqual(await repo.loadByTokenHash('a'.repeat(64)),dto);
 client.rpc=async()=>({data:null,error:{message:'secret SQL detail'}});
 await assert.rejects(()=>repo.loadByTokenHash('a'.repeat(64)),/^Error: Assessment unavailable\.$/);
 await assert.rejects(()=>repo.saveProgress('a'.repeat(64),progress()),/^Error: Assessment unavailable\.$/);
 const reports=new AssessmentReportService();
 assert.equal(reports.buildCandidateReport({analysis:safe,completedAt:'now'}).audience,'candidate');
 assert.ok(reports.buildConsultantReport({analysis,completedAt:'now'}).sections.some(section=>section.heading==='Consultant Brief'));
});

test('trusted finalization fails closed and incomplete submissions do not call the database',async()=>{
 let calls=0;const service=new TrustedAssessmentSubmission({rpc:async()=>{calls++;return {data:null,error:{message:'internal SQL'}}}});
 assert.equal((await service.complete('a'.repeat(43),{...progress(),answers:{}})).ok,false);assert.equal(calls,0);
 await assert.rejects(()=>service.complete('a'.repeat(43),progress()),/^Error: Assessment could not be completed\.$/);
 assert.equal(calls,1);
});

test('candidate UI keeps durable progress copy and invitation generation truthful',()=>{
 const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
 const ui=read('../../feature/crm/components/AssessmentInvitationAction.tsx');assert.match(ui,/Generating/);assert.doesNotMatch(ui,/Sending/);assert.match(ui,/does not send email/);
 const experience=read('../../feature/assessment-engine/conference/components/ConferenceAssessmentExperience.tsx');assert.match(experience,/persisted \? "Your progress is securely saved/);
 const completion=read('../../app/(public)/assessment/invitation/[token]/page.tsx');assert.match(completion,/Assessment complete/);assert.doesNotMatch(completion,/consultantBrief|analysis_snapshot/);
});
test('public DTO discards tenant internals and canonical URL uses the supplied APP_URL',()=>{
 const dto=publicSession({public_id:'safe',status:'invited',organization_id:'hidden',token_hash:'hidden',analysis_snapshot:{consultantBrief:'hidden'},progress_snapshot:null,candidate_analysis:null,last_saved_at:null,completed_at:null});
 assert.equal(JSON.stringify(dto).includes('hidden'),false);
 assert.equal(assessmentInvitationUrl('https://app.frangroove.com','a'.repeat(43)),`https://app.frangroove.com/assessment/invitation/${'a'.repeat(43)}`);
});
