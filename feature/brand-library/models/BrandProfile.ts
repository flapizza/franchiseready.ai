export interface BrandProfile {
  id: string;

  name: string;

  demoClassification: "existing-demo-profile" | "curated-demo-concept";

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

  operatingEnvironment: string;

  territoryModel: string;

  trainingSupport: {
    initialTraining: string;
    launchSupport: string;
    ongoingSupport: string;
    technologySupport: string;
  };

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
