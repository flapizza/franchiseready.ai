import type {
  CandidateRecord,
  PipelineStage,
} from "@/feature/crm/models/CandidateRecord";

export interface DemoConsultant {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  title: string;
  initials: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

export type BuyingMomentum =
  | "accelerating"
  | "steady"
  | "slowing";

export interface DemoDiscoveryState {
  status: "not-started" | "scheduled" | "active" | "completed";
  focus: string;
  notes: string;
  completedObjectives: string[];
  detectedRisks: string[];
  detectedBuyingSignals: string[];
}

export interface DemoBrandRecommendation {
  brandId: string;
  fit: number;
}

export interface DemoActivity {
  id: string;
  occurredAt: string;
  title: string;
  detail: string;
}

export interface DemoCandidate extends CandidateRecord {
  initials: string;
  confidence: number;
  buyingMomentum: BuyingMomentum;
  nextBestAction: string;
  aiExplanation: string;
  intelligenceFlags: string[];
  discovery: DemoDiscoveryState;
  referralReadiness: number;
  recommendedBrands: DemoBrandRecommendation[];
  recentActivity: DemoActivity[];
}

export interface DemoMeeting {
  id: string;
  candidateId: string;
  time: string;
  focus: string;
}

export interface DemoScenario {
  consultant: DemoConsultant;
  candidates: DemoCandidate[];
  meetings: DemoMeeting[];
}

export const CONFERENCE_LIFECYCLE: readonly PipelineStage[] = [
  "assessment-started",
  "assessment-completed",
  "discovery",
  "validation",
  "brand-matching",
  "referral",
  "awarded",
] as const;
