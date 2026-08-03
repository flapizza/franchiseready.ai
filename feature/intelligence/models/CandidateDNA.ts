import type { CandidateIntelligence } from "./CandidateIntelligence";

export interface CandidateDNA {
  id: string;

  candidateId: string;

  intelligence: CandidateIntelligence;

  overallCompatibilityScore: number;

  generatedAt: Date;
}