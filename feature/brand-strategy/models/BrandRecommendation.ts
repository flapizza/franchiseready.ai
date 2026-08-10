export interface BrandRecommendation {
  id: string;

  brandName: string;

  score: number;

  previousScore: number;

  movement: "up" | "down" | "same";

  confidence: number;

  explanation: string;

  strengths: string[];

  concerns: string[];

  discussionPoints: string[];

  nextStep: string;

  evidence: BrandEvidence[];
}

export interface BrandEvidence {
  id: string;

  title: string;

  source: BrandEvidenceSource;

  impact: number;

  confidence: number;

  summary: string;
}

export type BrandEvidenceSource =
  | "assessment"
  | "candidate-dna"
  | "discovery"
  | "meeting"
  | "financial"
  | "behavioral"
  | "ai";