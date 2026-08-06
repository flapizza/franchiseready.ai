export interface BrandStrategy {
  generatedAt: string;

  candidateSummary: string;

  overallRecommendation: string;

  rankedBrands: RankedBrandStrategy[];

  consultantGuidance: string[];

  nextSteps: string[];
}

export interface RankedBrandStrategy {
  id: string;

  brandName: string;

  overallFit: number;

  confidence: number;

  recommendation: "Excellent" | "Strong" | "Good";

  executiveSummary: string;

  strengths: string[];

  concerns: string[];

  talkingPoints: string[];

  objections: string[];

  followUpQuestions: string[];
}