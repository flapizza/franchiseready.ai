export interface Candidate360State {
  id: string;

  fullName: string;

  currentStage: string;

  readinessScore: number;

  buyingConfidence: number;

  recommendationConfidence: number;

  executiveSummary: string;

  financialReadiness: number;

  leadershipReadiness: number;

  lifestyleAlignment: number;

  coachability: number;

  nextBestAction: string;
}