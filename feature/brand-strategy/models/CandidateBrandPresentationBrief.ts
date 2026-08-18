import type { BrandShortlistDisposition, CandidateBrandReaction } from "./StrategyBuilderRecord";

export interface PresentationTalkingPoint { text: string; source: "Assessment" | "Discovery" | "Financial Profile" | "Brand Intelligence" }
export interface PresentationFact { label: string; value: string }

export interface CandidateBrandPresentationBrief {
  candidateId: string;
  candidateName: string;
  brandId: string;
  brandName: string;
  presentationOrder: number;
  presentationCount: number;
  aiRank: number;
  aiMatch: number;
  recommendationConfidence: number;
  overview: string;
  facts: PresentationFact[];
  differentiators: string[];
  matchRationale: string;
  fitFactors: PresentationTalkingPoint[];
  emphasize: PresentationTalkingPoint[];
  concerns: PresentationTalkingPoint[];
  questions: PresentationTalkingPoint[];
  candidateReaction: CandidateBrandReaction | null;
  consultantNotes: string;
  shortlistDisposition: BrandShortlistDisposition | null;
  presentedAt: string | null;
}

export interface CandidateBrandPresentationState {
  available: boolean;
  reason?: string;
  candidateId: string;
  candidateName: string;
  historical: boolean;
  completed: boolean;
  briefs: CandidateBrandPresentationBrief[];
  activeIndex: number;
}
