export interface AIRecommendation {
  summary: string;

  confidence: number;

  explanation: string;

  nextAction: string;
}