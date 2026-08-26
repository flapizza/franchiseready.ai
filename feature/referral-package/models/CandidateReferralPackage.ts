import type { Evidence } from "@/feature/evidence/models/Evidence";
import type { ReferralBrandHandoffState } from "@/feature/brand-strategy/models/CandidateBrandStrategyState";

export type ReferralPackageStatus = "draft" | "ready-for-review" | "approved" | "sent" | "introduced";
export type ReferralReportAttachment = {
  reportType: "CANDIDATE_ASSESSMENT_REPORT" | "CONSULTANT_INTELLIGENCE_REPORT";
  sourceAssessmentId: string;
  reportVersion: "candidate-report-v1" | "consultant-report-v1";
  selected: boolean;
  externalSharingIntent: boolean;
};

export interface CandidateReferralPackage {
  id: string;
  referralId: string;
  candidateId: string;
  status: ReferralPackageStatus;
  candidate: { name: string; email: string; phone: string | null; location: string | null; territory: string | null; lifecycleStage: string; readiness: number };
  brand: { id: string; name: string; category: string; contact: { name: string; email: string; title: string } | null };
  consultant: { id: string; name: string; title: string; email: string | null; phone: string | null; companyName: string | null };
  source: "recommended" | "other-brand";
  recommendation: { score: number; confidence: number; rationale: string; strategyContext: string } | null;
  financial: { liquidCapital: number; investableCapital: number; netWorth: number | null; candidatePreferredInvestmentRange: string; brandInvestmentRange: string | null; qualified: boolean | null };
  executiveSummary: string;
  motivations: string[];
  strengths: string[];
  discoveryFindings: string[];
  concerns: string[];
  conversationFocus: string[];
  evidence: Evidence[];
  editable: { subject: string; introductionMessage: string; consultantNotes: string };
  reportAttachments?: ReferralReportAttachment[];
  handoffStatus?: "draft" | "reviewed" | "ready";
  evidenceUpdatedAt?: string;
  evidenceFingerprint?: string;
  evidenceStale?: boolean;
  candidateObjectives?: string[];
  candidateQuestions?: string[];
  recommendedFranchisorFocus?: string[];
  provenance?: Array<{ label: string; source: "Assessment" | "Candidate Intelligence" | "Discovery" | "Brand Strategy" | "Brand Presentation" | "Financial Profile" | "Consultant Note" }>;
  handoff: ReferralBrandHandoffState | null;
  preparedAt: string;
  approvedAt: string | null;
  introducedAt: string | null;
}
