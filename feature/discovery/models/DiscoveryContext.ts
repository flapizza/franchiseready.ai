import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import type { CandidateIntelligenceProfile } from "@/feature/intelligence/models/CandidateIntelligenceProfile";

export type DiscoveryStage =
  | "opening"
  | "rapport"
  | "motivation"
  | "leadership"
  | "operations"
  | "financial"
  | "brand-fit"
  | "closing";

export interface DiscoveryContext {
  candidate: CandidateRecord;

  intelligence: CandidateIntelligenceProfile;

  notes: string;

  stage: DiscoveryStage;

  completedObjectives: string[];

  activeTopics: string[];

  detectedBuyingSignals: string[];

  detectedRisks: string[];

  startedAt: Date;

  currentTime: Date;
}