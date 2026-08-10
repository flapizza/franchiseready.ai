export interface CandidateDNA {
  identity: IdentityDNA;

  motivation: MotivationDNA;

  financial: FinancialDNA;

  leadership: LeadershipDNA;

  sales: SalesDNA;

  operations: OperationsDNA;

  lifestyle: LifestyleDNA;

  risk: RiskDNA;

  buying: BuyingDNA;

  brand: BrandDNA;
}

export interface IdentityDNA {
  confidence: number;

  evidence: string[];
}

export interface MotivationDNA {
  score: number;

  drivers: string[];

  evidence: string[];
}

export interface FinancialDNA {
  readiness: number;

  investmentRange: string;

  financingLikelihood: number;

  evidence: string[];
}

export interface LeadershipDNA {
  readiness: number;

  style: string;

  evidence: string[];
}

export interface SalesDNA {
  readiness: number;

  evidence: string[];
}

export interface OperationsDNA {
  readiness: number;

  evidence: string[];
}

export interface LifestyleDNA {
  preferences: string[];

  evidence: string[];
}

export interface RiskDNA {
  score: number;

  concerns: string[];
}

export interface BuyingDNA {
  confidence: number;

  urgency: number;

  readiness: number;
}

export interface BrandDNA {
  preferredModels: string[];

  preferredIndustries: string[];

  recurringRevenue: boolean;

  employeePreference: "low" | "medium" | "high";
}