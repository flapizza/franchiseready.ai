import type { ConferenceAnalysis, OpportunityCharacteristic } from "@/feature/assessment-engine/conference/types";
import type { CurrentDiscoveryIntelligence, DiscoveryObservation, RefinedCharacteristic } from "./types";

const statusOrder={confirmed:0,refined:1,contradicted:2,unclear:3} as const;
export class CandidateDiscoveryIntelligenceService {
  refine(assessment:ConferenceAnalysis,observations:DiscoveryObservation[],now=new Date().toISOString()):CurrentDiscoveryIntelligence{
    const ordered=[...observations].sort((a,b)=>statusOrder[a.status]-statusOrder[b.status]||a.topic.localeCompare(b.topic)||a.id.localeCompare(b.id));
    const text=(o:DiscoveryObservation)=>`${o.topic}: ${o.finding}${o.significance?` ${o.significance}`:""}`;
    const validated=ordered.filter(o=>o.status==="confirmed").map(text), refined=ordered.filter(o=>o.status==="refined").map(text);
    const contradictions=ordered.filter(o=>o.status==="contradicted").map(o=>`${text(o)} Mixed evidence should be reviewed in context.`);
    const unresolved=[...assessment.discoveryPriorities.filter(p=>!ordered.some(o=>o.topicId===p.title&&o.status!=="unclear")).map(p=>p.suggestedQuestion),...ordered.filter(o=>o.status==="unclear"||o.followUpNeeded).map(o=>o.finding||`Clarify ${o.topic}.`)];
    const characteristics=assessment.opportunityCharacteristics.map(c=>this.refineCharacteristic(c,ordered));
    const addressed=new Set(ordered.filter(o=>o.status!=="unclear").map(o=>o.topicId)).size;
    const core=Math.min(5,assessment.discoveryPriorities.length); const materialUnresolved=ordered.some(o=>o.status==="unclear"||o.followUpNeeded);
    const readiness=addressed>=core&&!materialUnresolved?"ready-for-brand-strategy":addressed>=Math.max(3,core-1)?"substantially-complete":"in-progress";
    const reasons=[`${addressed} of ${core} core assessment priorities have substantive Discovery evidence.`,materialUnresolved?"At least one topic still needs follow-up.":"No captured topic is marked unclear or needing follow-up."];
    return {version:1,generatedAt:now,validatedPatterns:validated,refinedPatterns:refined,unresolvedQuestions:[...new Set(unresolved)],meaningfulContradictions:contradictions,consultantBrief:{currentUnderstanding:[assessment.consultantBrief.ownershipOrientation.text,...validated,...refined].join(" "),confirmed:validated,changed:[...refined,...contradictions],needsValidation:[...new Set(unresolved)],nextAction:readiness==="ready-for-brand-strategy"?"Review refined Opportunity Characteristics and continue to Brand Strategy.":unresolved[0]??"Continue consultant-led Discovery."},opportunityCharacteristics:characteristics,readiness,readinessReasons:reasons,assessmentAnalysisVersion:assessment.analysisVersion};
  }
  private refineCharacteristic(characteristic:OpportunityCharacteristic,observations:DiscoveryObservation[]):RefinedCharacteristic{const words=characteristic.characteristic.toLowerCase().split(/\W+/).filter(w=>w.length>3);const observation=observations.find(o=>o.status!=="unclear"&&words.some(w=>`${o.topic} ${o.finding} ${o.significance}`.toLowerCase().includes(w)));if(!observation)return {...characteristic,source:"assessment"};const disposition=observation.status==="confirmed"?characteristic.disposition:observation.status==="contradicted"?"Potential Constraint":observation.followUpNeeded?"Validate":"Acceptable";return {...characteristic,disposition,reason:`${observation.finding} ${observation.significance}`.trim(),source:"discovery",previousDisposition:characteristic.disposition,discoveryObservationId:observation.id};}
}

