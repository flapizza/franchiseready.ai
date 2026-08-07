export interface AIReasoning {
  conclusion: string;

  confidence: number;

  evidence: string[];

  unknowns: string[];

  increasesConfidence: string[];

  decreasesConfidence: string[];
}