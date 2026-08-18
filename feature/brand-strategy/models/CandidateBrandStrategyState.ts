import type { Evidence } from "@/feature/evidence/models/Evidence";
import type { ReferralReadinessStatus } from "@/feature/decision-engine/models/ReferralReadiness";
import type { BrandShortlistDisposition, CandidateBrandReaction, StrategyWorkflowStatus } from "./StrategyBuilderRecord";

export interface BrandFitDimensionState {
  id: string;
  label: string;
  candidateValue: number;
  brandTarget: number;
  alignment: number;
  explanation: string;
}

export interface CandidateBrandRecommendationState {
  brandId: string;
  brandName: string;
  category: string;
  rank: number;
  score: number;
  confidence: number;
  qualified: boolean;
  recommendationLabel: "Top Recommendation" | "Strong Alternative" | "Alternative" | "Not Financially Qualified";
  rationale: string;
  fitDimensions: BrandFitDimensionState[];
  evidence: Evidence[];
  concerns: string[];
  presentationGuidance: {
    leadWith: string[];
    emphasize: string[];
    address: string[];
    suggestedTransition: string;
  };
  investment: {
    candidateInvestableCapital: number;
    candidateLiquidCapital: number;
    requiredInvestment: string;
    liquidCapitalMinimum: number | null;
    compatible: boolean;
    explanation: string;
  };
  nextAction: string;
  selectedForPresentation: boolean;
  presentationOrder: number | null;
  candidateReaction: CandidateBrandReaction | null;
  consultantNotes: string;
  shortlistDisposition: BrandShortlistDisposition | null;
}

export interface ReferralBrandHandoffState {
  brandId: string;
  brandName: string;
  category: string;
  rank: number;
  recommendationConfidence: number;
  recommendationScore: number;
  candidateBrandRationale: string;
  supportingEvidence: Evidence[];
  knownConcerns: string[];
  financialCompatibility: CandidateBrandRecommendationState["investment"];
  referralContact: { name: string; email: string; title: string } | null;
  presentationContext: CandidateBrandRecommendationState["presentationGuidance"];
}

export interface ReferralStrategyHandoffState {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  referralReadiness: ReferralReadinessStatus;
  candidateReadiness: number;
  referralGatePassed: boolean;
  referralReadinessPercentage: number;
  unresolvedReadinessConsiderations: string[];
  strategyContext: string;
  recommendedBrands: ReferralBrandHandoffState[];
}

/** Top-brand compatibility view for older consumers. */
export interface ReferralHandoffState extends ReferralBrandHandoffState {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  referralReadiness: ReferralReadinessStatus;
  candidateReadiness: number;
  referralGatePassed: boolean;
  strategyContext: string;
}

export interface CandidateBrandStrategyState {
  available: boolean;
  unavailableReason?: string;
  candidate: {
    id: string;
    fullName: string;
    stageLabel: string;
    readiness: number | null;
    intelligenceSummary: string;
  };
  overallStrategy: string;
  leadRecommendation: {
    statement: string;
    comparisonHeading: string;
    comparisonExplanation: string;
  } | null;
  recommendations: CandidateBrandRecommendationState[];
  presentationOrder: string[];
  workflow: {
    status: StrategyWorkflowStatus;
    label: string;
    presented: number;
    reactionsCaptured: number;
    strongInterest: number;
    referralSelections: number;
    historical: boolean;
  };
  openConcerns: string[];
  referralReadiness: {
    status: ReferralReadinessStatus;
    percentage: number;
    label: string;
    explanation: string;
    remainingRequirements: string[];
  } | null;
  referralDecision: {
    passed: boolean;
    gateLabel: "Recommended" | "Needs Attention";
    heading: "Referral Readiness: Recommended" | "Referral Readiness: Needs Attention";
    explanation: string;
    unresolvedReasons: string[];
    nextAction: string;
  } | null;
  lifecycleAction: { label: string } | null;
  referralHandoff: ReferralHandoffState | null;
  referralStrategyHandoff: ReferralStrategyHandoffState | null;
}
