import type { CandidateReferralPackage } from "./CandidateReferralPackage";
import type { PipelineStage } from "@/feature/crm/models/CandidateRecord";
import type { ReferralReadinessStatus } from "@/feature/decision-engine/models/ReferralReadiness";

export type CandidateBrandReferralSource = "recommended" | "other-brand";
export type CandidateBrandReferralStatus = "selected" | "draft" | "ready-for-review" | "approved" | "introduced";

export interface CandidateBrandReferral {
  referralId: string;
  candidateId: string;
  brandId: string | null;
  brandName: string;
  source: CandidateBrandReferralSource;
  recommendationRank: number | null;
  recommendationScore: number | null;
  recommendationConfidence: number | null;
  packageId: string;
  status: CandidateBrandReferralStatus;
  referralPackage: CandidateReferralPackage;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  introducedAt: string | null;
  deliveryStatus: "not-recorded" | "recorded";
  decision: {
    consultantDirected: boolean;
    aiReadinessStatus: ReferralReadinessStatus;
    readinessPercentage: number;
    lifecycleStage: PipelineStage;
    unresolvedConsiderations: string[];
    decidedAt: string;
  };
}
