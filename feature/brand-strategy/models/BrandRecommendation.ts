export interface BrandRecommendation {
  id: string;

  /**
   * Brand being recommended.
   */
  brandName: string;

  /**
   * Overall recommendation score (0-100).
   */
  score: number;

  /**
   * Previous score used for trend calculations.
   */
  previousScore: number;

  /**
   * Whether the recommendation is improving,
   * declining, or unchanged.
   */
  movement: "up" | "down" | "same";

  /**
   * AI confidence in this recommendation.
   */
  confidence: number;

  /**
   * Overall franchise fit score.
   * May differ slightly from score as the
   * recommendation engine evolves.
   */
  overallFit: number;

  /**
   * AI generated executive summary.
   */
  summary: string;

  /**
   * Detailed explanation shown to consultants.
   */
  explanation: string;

  /**
   * Primary reasons this brand is a strong fit.
   */
  strengths: string[];

  /**
   * Items requiring additional discussion.
   */
  concerns: string[];

  /**
   * Potential risks the consultant should review.
   */
  risks: string[];

  /**
   * AI-generated talking points for the consultant.
   */
  discussionPoints: string[];

  /**
   * Recommended next action.
   */
  nextStep: string;

  /**
   * Current recommendation stage.
   */
  recommendedStage:
    | "Discovery"
    | "Validation"
    | "Brand Strategy"
    | "Introduction"
    | "Award";

  /**
   * Optional consultant notes.
   */
  consultantNotes?: string;

  /**
   * Evidence supporting the recommendation.
   */
  evidence: BrandEvidence[];
}

export interface BrandEvidence {
  id: string;

  /**
   * Short evidence title.
   */
  title: string;

  /**
   * Origin of this evidence.
   */
  source: BrandEvidenceSource;

  /**
   * Relative importance (0-100).
   */
  impact: number;

  /**
   * Confidence in this evidence.
   */
  confidence: number;

  /**
   * Human-readable explanation.
   */
  summary: string;

  /**
   * Why this evidence matters.
   */
  recommendation?: string;

  /**
   * Supporting data shown in the UI.
   */
  supportingData?: string;
}

export type BrandEvidenceSource =
  | "assessment"
  | "candidate-dna"
  | "discovery"
  | "meeting"
  | "financial"
  | "behavioral"
  | "experience"
  | "brand-profile"
  | "market"
  | "territory"
  | "consultant"
  | "ai";