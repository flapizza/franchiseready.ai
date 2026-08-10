export interface BrandReasoning {
  recommendationId: string;

  totalScore: number;

  confidence: number;

  summary: string;

  factors: ReasoningFactor[];
}

export interface ReasoningFactor {
  id: string;

  title: string;

  category:
    | "leadership"
    | "financial"
    | "behavioral"
    | "lifestyle"
    | "experience"
    | "discovery";

  impact: number;

  confidence: number;

  explanation: string;
}