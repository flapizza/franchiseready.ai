export interface BrandProfile {
  id: string;

  name: string;

  shortDescription: string;

  category: string;

  website?: string;

  investment: InvestmentProfile;

  idealCandidate: IdealCandidateProfile;

  businessModel: BusinessModelProfile;

  strengths: string[];

  considerations: string[];

  discoveryQuestions: string[];

  aiNotes: string[];

  tags: string[];
}

export interface InvestmentProfile {
  minimum: number;

  maximum: number;

  liquidCapitalMinimum?: number;
}

export interface IdealCandidateProfile {
  leadership: number;

  sales: number;

  operations: number;

  financial: number;

  relationshipBuilding: number;

  coachability: number;
}

export interface BusinessModelProfile {
  recurringRevenue: boolean;

  ownerOperator: boolean;

  executiveModel: boolean;

  homeBased: boolean;

  b2b: boolean;

  b2c: boolean;
}