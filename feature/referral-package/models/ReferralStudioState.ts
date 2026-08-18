import type { CandidateBrandReferral } from "./CandidateBrandReferral";
import type { ReferralBrandHandoffState } from "@/feature/brand-strategy/models/CandidateBrandStrategyState";

export interface ReferralOpportunityState extends ReferralBrandHandoffState {
  selectable: boolean;
  referral: CandidateBrandReferral | null;
}

export type ReferralStudioState =
  | { available: true; candidate: { id: string; name: string; readiness: number; context: string }; opportunities: ReferralOpportunityState[];
      referrals: CandidateBrandReferral[]; historical: boolean; summary: { recommended: number; prepared: number; approved: number; introduced: number } }
  | { available: false; candidateId: string; candidateName: string | null; reason: string };
