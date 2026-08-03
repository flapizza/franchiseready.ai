export type ReadinessLevel =
  | "Emerging"
  | "Developing"
  | "Strong"
  | "Excellent";

export interface TimingProfile {
  decisionWindow: string;
  urgency: number;
  confidence: number;
}

export interface FinancialProfile {
  liquidCapital: number;
  investableCapital: number;
  investmentRange: string;
  financingLikelihood: number;
}

export interface BehavioralProfile {
  leadershipStyle: string;
  decisionStyle: string;
  relationshipStyle: string;
  systemsOrientation: number;
  coachability: number;
  adaptability: number;
  riskTolerance: number;
}

export interface CompetencyProfile {
  leadership: number;
  sales: number;
  operations: number;
  finance: number;
  hiring: number;
  networking: number;
  communication: number;
  strategicThinking: number;
}

export interface FranchiseRecommendation {
  id: string;
  name: string;

  overallFit: number;

  behavioralFit: number;
  competencyFit: number;
  financialFit: number;
  timingFit: number;

  confidence: number;

  reasons: string[];
  discussionPoints: string[];
}

export interface CandidateIntelligenceProfile {
  id: string;

  completedAt: string;

  overallReadiness: number;

  readinessLevel: ReadinessLevel;

  timing: TimingProfile;

  financial: FinancialProfile;

  behavioral: BehavioralProfile;

  competencies: CompetencyProfile;

  preferredBusinessModels: string[];

  recommendedCategories: string[];

  recommendations: FranchiseRecommendation[];

  discoveryPriorities: string[];

  executiveSummary: string;
}