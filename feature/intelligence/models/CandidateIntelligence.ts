export interface CandidateIntelligence {
  overallReadiness: number;

  behavioral: BehavioralIntelligence;

  financial: FinancialIntelligence;

  leadership: LeadershipIntelligence;

  operations: OperationalIntelligence;

  sales: SalesIntelligence;

  lifestyle: LifestyleIntelligence;

  timing: DecisionIntelligence;

  risk: RiskIntelligence;

  motivation: MotivationIntelligence;
}

export interface BehavioralIntelligence {
  coachability: number;
  adaptability: number;
  resilience: number;
  communication: number;
  collaboration: number;
  competitiveness: number;
}

export interface FinancialIntelligence {
  liquidityScore: number;
  netWorthScore: number;
  financingLikelihood: number;
  investmentCapacity: number;
  financialConfidence: number;
}

export interface LeadershipIntelligence {
  accountability: number;
  delegation: number;
  hiringReadiness: number;
  decisionMaking: number;
  influence: number;
}

export interface OperationalIntelligence {
  organization: number;
  processOrientation: number;
  consistency: number;
  execution: number;
}

export interface SalesIntelligence {
  networking: number;
  relationshipBuilding: number;
  consultativeSelling: number;
  businessDevelopment: number;
}

export interface LifestyleIntelligence {
  workLifeBalance: number;
  scheduleFlexibility: number;
  travelPreference: number;
  teamPreference: number;
}

export interface DecisionIntelligence {
  urgency: number;
  familyAlignment: number;
  fundingReadiness: number;
  emotionalCommitment: number;
  buyingConfidence: number;
}

export interface RiskIntelligence {
  riskTolerance: number;
  resilience: number;
  uncertaintyComfort: number;
}

export interface MotivationIntelligence {
  wealthCreation: number;
  independence: number;
  purpose: number;
  lifestyle: number;
  legacy: number;
}