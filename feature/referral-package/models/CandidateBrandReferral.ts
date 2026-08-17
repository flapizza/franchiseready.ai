import type { CandidateReferralPackage } from "./CandidateReferralPackage";

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
}
