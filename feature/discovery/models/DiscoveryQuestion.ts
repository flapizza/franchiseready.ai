export type QuestionCategory =
  | "leadership"
  | "motivation"
  | "financial"
  | "timing"
  | "operations"
  | "family"
  | "sales"
  | "lifestyle";

export interface DiscoveryQuestion {
  id: string;

  category: QuestionCategory;

  question: string;

  reason: string;

  expectedOutcome: string;

  confidence: number;
}