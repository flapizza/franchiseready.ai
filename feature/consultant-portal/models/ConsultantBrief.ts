export interface ConsultantBrief {
  preparedAt: string;

  executiveSnapshot: {
    readiness: number;
    confidence: number;
    awardProbability: number;
  };

  overview: string[];

  objectives: string[];

  strengths: string[];

  risks: string[];

  openingQuestion: string;

  reminders: string[];

  recommendedFocus: string;
}