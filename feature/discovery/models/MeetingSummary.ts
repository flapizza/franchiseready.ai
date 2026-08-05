import type { AIInsight } from "./AIInsight";

export interface MeetingSummary {
  executiveSummary: string;

  consultantRecommendation: string;

  candidateSentiment: CandidateSentiment;

  buyingSignals: string[];

  concerns: string[];

  strengths: string[];

  recommendedNextStep: string;

  followUpTopics: string[];

  aiConfidence: number;

  supportingInsights: AIInsight[];

  generatedAt: Date;
}

export type CandidateSentiment =
  | "Very Positive"
  | "Positive"
  | "Neutral"
  | "Cautious"
  | "Negative";