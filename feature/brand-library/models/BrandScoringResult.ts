export interface BrandScoringResult {
  brandId: string;

  overallFit: number;

  confidence: number;

  recommendation: RecommendationLevel;

  matchedCompetencies: string[];

  strengths: string[];

  concerns: string[];

  explanation: string;

  nextStep: string;
}

export type RecommendationLevel =
  | "excellent"
  | "strong"
  | "good"
  | "possible"
  | "poor";