export type CandidateActionPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type CandidateActionImpact =
  | "High"
  | "Medium"
  | "Low";

export type CandidateActionStatus =
  | "pending"
  | "in_progress"
  | "completed";

export interface CandidateAction {
  /**
   * Stable unique identifier.
   */
  id: string;

  /**
   * Action title displayed to the consultant.
   */
  title: string;

  /**
   * One sentence describing what should be done.
   */
  description: string;

  /**
   * Why the Intelligence Engine selected this action.
   */
  reason: string;

  /**
   * Overall execution priority.
   */
  priority: CandidateActionPriority;

  /**
   * Expected impact if completed.
   */
  impact: CandidateActionImpact;

  /**
   * AI confidence (0-100).
   */
  confidence: number;

  /**
   * Current workflow state.
   */
  status: CandidateActionStatus;

  /**
   * Estimated execution time.
   */
  estimatedMinutes: number;

  /**
   * What successful completion looks like.
   */
  recommendedOutcome: string;

  /**
   * UI categorization.
   */
  tags: string[];
}