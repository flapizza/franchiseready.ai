import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

import type {
  BrandRecommendation,
} from "@/feature/brand-strategy/models/BrandRecommendation";

import type {
  ReferralPackage,
} from "@/feature/referral-package/models/ReferralPackage";

export interface CandidateWorkspaceState {
  candidateId: string;

  candidateName: string;

  intelligence: CandidateIntelligenceState;

  recommendations: BrandRecommendation[];

  referralPackage: ReferralPackage;

  nextBestActions: string[];

  buyingSignals: string[];

  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;

  date: string;

  title: string;

  description: string;

  type:
    | "assessment"
    | "discovery"
    | "meeting"
    | "recommendation"
    | "referral"
    | "award";
}