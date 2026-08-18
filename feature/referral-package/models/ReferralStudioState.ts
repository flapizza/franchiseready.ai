import type { CandidateBrandReferral } from "./CandidateBrandReferral";
import type { ReferralBrandHandoffState } from "@/feature/brand-strategy/models/CandidateBrandStrategyState";

export interface ReferralOpportunityState extends ReferralBrandHandoffState {
  selectable: boolean;
  referral: CandidateBrandReferral | null;
}

export type ReferralStudioState =
  | { available: true; candidate: { id: string; name: string; readiness: number; context: string }; opportunities: ReferralOpportunityState[];
      referrals: CandidateBrandReferral[]; historical: boolean; reviewOnly: boolean; activeReferralId: string | null;
      readinessAdvisory: { recommended: boolean; label: "Recommended" | "Needs Attention"; explanation: string; considerations: string[] };
      summary: { recommended: number; prepared: number; approved: number; introduced: number } }
  | { available: false; candidateId: string; candidateName: string | null; kind: "candidate-not-found" | "package-not-found"; reason: string };
