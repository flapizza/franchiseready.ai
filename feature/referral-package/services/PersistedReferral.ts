import "server-only";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadHistoricalAssessments } from "@/feature/assessment-reports/services/loadHistoricalAssessments";
import { evaluateBrand } from "@/feature/brand-strategy/production/BrandReferralEngine";
import { referralReadiness } from "./ReferralReadiness";
export async function referralContext(candidateId:string,brandId?:string){
  const r=await resolveWorkspaceComposition();if(r.status!=="resolved"||"runtimes" in r.composition)return null;
  const c=r.composition,row=await c.dependencies.candidateWorkspace.get(candidateId);if(!row)return null;
  const db=await createServerSupabaseClient();
  const {data:considerations,error}=await db.from("candidate_brand_considerations").select("*").eq("organization_id",c.session.organization.id).eq("candidate_public_id",candidateId).eq("consultant_membership_id",c.session.membership.id);
  if(error)throw new Error("Brand consideration unavailable.");
  const chosen=brandId??considerations.find(x=>x.state==="selected")?.brand_public_id;
  const profile=chosen?await c.dependencies.brandIntelligence.getById(chosen):null;
  if(chosen&&!profile)return null;
  const brand=profile&&row.assessment?.analysis?evaluateBrand(row,profile):null;
  const consideration=considerations.find(x=>x.brand_public_id===brand?.brandId);
  const records=await loadHistoricalAssessments(c,candidateId);
  const record=records.filter(x=>x.sessionId===row.assessment?.id).sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt))[0];
  return{row,brand,consideration,considerations,record,readiness:referralReadiness(row,brand,record,consideration?.state==="selected"),consultant:{name:c.presentation.identity.displayName,email:c.session.identity.email},organizationId:c.session.organization.id,membershipId:c.session.membership.id};
}
