export type CandidateBrandReaction = "strong-interest" | "interested" | "neutral" | "not-interested";
export type BrandShortlistDisposition = "refer" | "continue-research" | "hold" | "remove";
export type StrategyWorkflowStatus = "strategy-building" | "presentation-set-ready" | "candidate-discussion" | "final-shortlist-ready" | "referral-selection-ready" | "historical";

export interface StrategyBrandDecision {
  brandId: string;
  selectedForPresentation: boolean;
  presentationOrder: number | null;
  candidateReaction: CandidateBrandReaction | null;
  consultantNotes: string;
  shortlistDisposition: BrandShortlistDisposition | null;
  presentedAt: string | null;
  updatedAt: string;
}

/** Persistence-neutral aggregate. The demo repository is process-local; a durable
 * adapter can replace it without changing runtime, service, or UI contracts. */
export interface StrategyBuilderRecord {
  candidateId: string;
  decisions: StrategyBrandDecision[];
  createdAt: string;
  updatedAt: string;
  presentationStartedAt?: string | null;
  presentationCompletedAt?: string | null;
}
