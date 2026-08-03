export interface CompatibilityReport {
  candidateId: string;

  brandId: string;

  overallScore: number;

  behavioralScore: number;

  financialScore: number;

  leadershipScore: number;

  operationalScore: number;

  salesScore: number;

  lifestyleScore: number;

  timingScore: number;

  strengths: string[];

  gaps: string[];

  discoveryQuestions: string[];

  recommendations: string[];
}