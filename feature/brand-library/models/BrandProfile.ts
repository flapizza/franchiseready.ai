export interface BrandProfile {
  id: string;

  name: string;

  shortDescription: string;

  category: string;

  website?: string;

  referralContact?: {
    name: string;
    email: string;
    title: string;
  };

  investment: InvestmentProfile;

  idealCandidate: IdealCandidateProfile;

  businessModel: BusinessModelProfile;

  operatingModel: OperatingModelProfile;

  culture: string[];

  successTraits: string[];

  poorFitTraits: string[];

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

export interface OperatingModelProfile {
  teamModel: "solo" | "small-team" | "team-led";

  salesIntensity: number;

  operationalIntensity: number;

  scheduleFlexibility: number;

  primaryCustomer: string;
}
