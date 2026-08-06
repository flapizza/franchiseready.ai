export interface FranchisorPackage {
  candidateName: string;

  preparedAt: string;

  executiveSummary: string;

  readiness: number;

  confidence: number;

  awardProbability: number;

  financialSnapshot: {
    netWorth: string;
    liquidCapital: string;
    investmentRange: string;
  };

  leadershipSummary: string;

  operationalSummary: string;

  discoveryHighlights: string[];

  brandRecommendation: string;

  discussionTopics: string[];
}