export interface BrandDNA {
  id: string;

  brandName: string;

  category: string;

  overallProfile: number;

  behavioral: BrandBehaviorProfile;

  financial: BrandFinancialProfile;

  leadership: BrandLeadershipProfile;

  operations: BrandOperationalProfile;

  sales: BrandSalesProfile;

  lifestyle: BrandLifestyleProfile;

  timing: BrandTimingProfile;

  risk: BrandRiskProfile;

  motivations: BrandMotivationProfile;
}

export interface BrandBehaviorProfile {
  coachability: number;
  adaptability: number;
  resilience: number;
  communication: number;
  collaboration: number;
  competitiveness: number;
}

export interface BrandFinancialProfile {
  investmentLevel: number;
  liquidityRequirement: number;
  financingFlexibility: number;
  netWorthRequirement: number;
}

export interface BrandLeadershipProfile {
  accountability: number;
  delegation: number;
  hiringExpectations: number;
  decisionMaking: number;
  influence: number;
}

export interface BrandOperationalProfile {
  organization: number;
  processOrientation: number;
  consistency: number;
  execution: number;
}

export interface BrandSalesProfile {
  networking: number;
  relationshipBuilding: number;
  consultativeSelling: number;
  businessDevelopment: number;
}

export interface BrandLifestyleProfile {
  workLifeBalance: number;
  scheduleFlexibility: number;
  travelRequirement: number;
  teamManagement: number;
}

export interface BrandTimingProfile {
  speedToLaunch: number;
  onboardingComplexity: number;
}

export interface BrandRiskProfile {
  businessRisk: number;
  marketVolatility: number;
}

export interface BrandMotivationProfile {
  wealthCreationPotential: number;
  lifestylePotential: number;
  communityImpact: number;
  scalability: number;
}