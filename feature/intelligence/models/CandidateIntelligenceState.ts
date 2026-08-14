export interface CandidateIntelligenceState {
  readiness: number;

  confidence: number;

  buyingSignals: string[];

  risks: string[];

  executiveSummary: string;
}