import type { ConferenceAnalysis, OpportunityCharacteristic } from "@/feature/assessment-engine/conference/types";

export type DiscoveryFindingStatus = "confirmed"|"refined"|"contradicted"|"unclear";
export type DiscoveryObservation = { id:string; topicId:string; topic:string; finding:string; candidateStatement:string; status:DiscoveryFindingStatus; significance:string; followUpNeeded:boolean; source:"discovery"; createdAt:string; updatedAt:string };
export type RefinedCharacteristic = OpportunityCharacteristic & { source:"assessment"|"discovery"; previousDisposition?:OpportunityCharacteristic["disposition"]; discoveryObservationId?:string };
export type CurrentDiscoveryIntelligence = { version:1; generatedAt:string; validatedPatterns:string[]; refinedPatterns:string[]; unresolvedQuestions:string[]; meaningfulContradictions:string[]; consultantBrief:{currentUnderstanding:string; confirmed:string[]; changed:string[]; needsValidation:string[]; nextAction:string}; opportunityCharacteristics:RefinedCharacteristic[]; readiness:"in-progress"|"substantially-complete"|"ready-for-brand-strategy"; readinessReasons:string[]; assessmentAnalysisVersion:number };
export type ProductionDiscoverySession = { id:string; publicId:string; candidateId:string; assessmentSessionId:string; status:"planned"|"in-progress"|"completed"|"cancelled"; summary:string; consultantNotes:string; nextSteps:string; startedAt:string|null;completedAt:string|null;createdAt:string;updatedAt:string;observations:DiscoveryObservation[];currentIntelligence:CurrentDiscoveryIntelligence|null };
export type DiscoveryWorkspace = {candidate:{id:string;name:string};assessment:ConferenceAnalysis;session:ProductionDiscoverySession};

