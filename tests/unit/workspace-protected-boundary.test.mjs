import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const source=(file)=>readFile(path.join(root,file),"utf8");

test("production-backed candidate, Discovery, assessment, and email paths use composition dependencies",async()=>{
  const candidates=await source("app/(protected)/crm/candidates/page.tsx");
  const discovery=await source("app/(protected)/crm/[id]/discovery/page.tsx");
  const report=await source("app/(protected)/crm/candidates/[candidateId]/reports/[reportType]/route.ts");
  const email=await source("feature/communications/actions/email-actions.ts");
  assert.match(candidates,/dependencies\.candidateCRM\.load/);
  assert.match(discovery,/dependencies\.discovery\.getOrCreate/);
  assert.match(report,/dependencies\.assessments\.getForCandidate/);
  assert.match(email,/dependencies\.emailDelivery\.(?:send|retry)/);
});

test("production-unavailable domains render or return explicit unavailable states",async()=>{
  for(const file of ["app/(protected)/crm/page.tsx","app/(protected)/crm/tasks/page.tsx","app/(protected)/crm/calendar/page.tsx","app/(protected)/crm/team/page.tsx","app/(protected)/crm/brands/page.tsx","app/(protected)/crm/candidates/[candidateId]/referral/page.tsx"]){
    assert.match(await source(file),/WorkspaceFeatureUnavailable/);
  }
  for(const file of ["feature/tasks/actions/task-actions.ts","feature/calendar/actions/calendar-actions.ts","feature/pipeline/actions/pipeline-actions.ts","feature/referral-package/actions/referral-studio.ts"]){
    assert.match(await source(file),/not available in this workspace/);
  }
});

test("candidate mutation actor and tenant context are derived from resolved composition",async()=>{
  const workflow=await source("feature/crm/actions/candidate-workflow.ts");
  const oauth=await source("app/(protected)/auth/google/connect/route.ts");
  assert.match(workflow,/composition\.session\.membership\.id/);
  assert.doesNotMatch(workflow,/demoConsultant|formData\.get\("organization/);
  assert.match(oauth,/dependencies\.workspaceContext/);
  assert.doesNotMatch(oauth,/resolveAuthenticatedWorkspaceContext/);
});

test("approved demo-only exceptions retain access and active-session safeguards",async()=>{
  for(const file of ["app/(protected)/crm/test-reset/route.ts","app/(protected)/crm/test-email-engagement/route.ts","app/(protected)/crm/test-referral-delivery/route.ts"]){
    const contents=await source(file);assert.match(contents,/isConferenceDemoAccessEnabled/);assert.match(contents,/getConferenceDemoUser/);
  }
});
