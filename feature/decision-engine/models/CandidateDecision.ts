import type { DecisionEvidence } from "./DecisionEvidence";
import type { NextBestAction } from "./NextBestAction";
import type { ReferralReadiness } from "./ReferralReadiness";

export type CandidateRecommendation =
  | "Continue Assessment"
  | "Schedule Discovery"
  | "Continue Discovery"
  | "Present Brand Strategy"
  | "Prepare Referral"
  | "Refer Candidate"
  | "Pause Process";

export interface CandidateDecision {
  recommendation: CandidateRecommendation;

  confidence: number;

  nextBestAction: NextBestAction;

  referralReadiness: ReferralReadiness;

  evidence: DecisionEvidence[];

  unresolvedQuestions: string[];

  consultantGuidance: string[];

  generatedAt: string;
}