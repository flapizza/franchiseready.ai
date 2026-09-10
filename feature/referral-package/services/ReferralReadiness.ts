import type { PersistedCandidateWorkspace } from "@/feature/crm/models/PersistedCandidateWorkspace";
import type { BrandReferralResult } from "@/feature/brand-strategy/production/BrandReferralEngine";
import { moneyRanges } from "@/feature/brand-strategy/production/BrandReferralEngine";
import type { HistoricalAssessment } from "@/feature/assessment-reports/services/HistoricalAssessmentDocuments";
export interface ReadinessItem {label:string;state:"complete"|"review"|"missing";detail:string}
export function referralReadiness(row:PersistedCandidateWorkspace,brand:BrandReferralResult|null,record:HistoricalAssessment|undefined,selected:boolean){
  const a=row.assessment?.analysis,items:ReadinessItem[]=[];
  const add=(label:string,state:ReadinessItem["state"],detail:string)=>items.push({label,state,detail});
  add("Completed assessment",a&&record?"complete":"missing",a&&record?"A completed submission and analysis are available.":"Complete the assessment before preparing a referral.");
  add("Candidate contact",row.candidate.email&&row.candidate.phone?"complete":"missing",row.candidate.email&&row.candidate.phone?"Email and phone are recorded.":"Confirm candidate email and phone.");
  add("Selected brand",brand&&selected?"complete":"missing",brand&&selected?brand.name:"Select a brand for referral.");
  const intake=record?.intake;
  add("Geography",intake?.city&&intake.stateProvince?"review":"missing",intake?.city?`Candidate reports ${intake.city}, ${intake.stateProvince}. Confirm target geography separately.`:"Target geography is not established.");
  for(const [label,value] of [["Liquid capital",a?.financial.liquidCapital],["Net worth",a?.financial.netWorth],["Investment expectations",a?.financial.investmentRange]] as const)add(label,value&&moneyRanges(value).length?"review":"missing",value?`${value}. Candidate-reported; not independently verified.`:"Not established.");
  add("Ownership goals",a?.ownershipProfile.motivations.length&&a.ownershipProfile.operatingPreferences.length?"complete":"missing",a?.ownershipProfile.operatingPreferences.join("; ")||"Clarify ownership role and motivations.");
  const unresolved=row.discovery?.observations.filter(o=>o.followUpNeeded||o.status==="unclear"||o.status==="contradicted")??[];
  add("Discovery",row.discovery?.status==="completed"&&!unresolved.length?"complete":"review",unresolved.length?`${unresolved.length} findings require follow-up: ${unresolved.map(o=>o.topic).join(", ")}`:row.discovery?.status==="completed"?"Discovery is completed with no unresolved observations.":"Complete consultant-led Discovery.");
  add("Brand rationale",brand?.strengths.length?"complete":"review",brand?.strengths.map(f=>f.label).join(", ")||"Establish an evidence-supported reason to consider this brand.");
  add("Concerns",brand?.factors.some(f=>f.state==="constraint")||row.candidate.status==="on-hold"?"missing":"review",brand?.factors.filter(f=>f.state==="constraint").map(f=>f.explanation).join(" ")||"Review fit tradeoffs and obtain candidate consent before an introduction.");
  add("Territory availability","review","Unknown; not verified with the franchisor.");
  add("Funding","review","Funding method, approval and household runway require confirmation.");
  add("Brand evidence","review",brand?.concept?"Concept profile; not a verified live franchise opportunity.":brand?.evidenceLabel||"Brand evidence is unavailable.");
  return{band:items.some(i=>i.state==="missing")?"Not ready":items.some(i=>i.state==="review")?"Ready with items to review":"Ready",items};
}
