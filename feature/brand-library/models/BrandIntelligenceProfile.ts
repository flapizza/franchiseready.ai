export type EvidenceSourceType = "primary" | "secondary" | "consultant-provided" | "inferred" | "legacy-demo";
export type EvidenceVerification = "verified" | "reviewed" | "unverified" | "conflicting";

export interface BrandEvidence {
  id: string;
  sourceType: EvidenceSourceType;
  title: string;
  sourceDate?: string;
  sourceUrl?: string;
  documentReference?: string;
  fddReference?: { item?: string; page?: string };
  retrievedAt?: string;
  verification: EvidenceVerification;
  confidence?: "high" | "medium" | "low";
  notes?: string;
}

export type PresentationApproval = "approved-for-presentation" | "internal-only" | "needs-review" | "unavailable";

export interface BrandFact<T> {
  value: T | null;
  verification: EvidenceVerification | "unknown";
  approval: PresentationApproval;
  evidence: BrandEvidence[];
  notes?: string;
}

export type GovernedBrandFact<T> = BrandFact<T>;
export type BrandProfileCompletenessStatus = "sufficiently-populated" | "partially-populated" | "minimal" | "unknown-not-reviewed";

export interface BrandProfileCompleteness {
  status: BrandProfileCompletenessStatus;
  knownFields: number;
  totalFields: number;
  evidencedFields: number;
  verifiedFields: number;
  missingFields: string[];
}

export type FitLevel = "low" | "moderate" | "high" | "very-high";
export type Suitability = "not-suited" | "possible" | "well-suited" | "unknown";
export type OperatingLocation = "home-based" | "office" | "retail" | "mobile" | "flexible" | "unknown";
export interface MoneyRange { minimum: number | null; maximum: number | null; currency: "USD" }
export interface RecurringFee { name: string; amount: string }

export interface BrandIntelligenceProfile {
  id: string;
  name: string;
  demoClassification: "existing-demo-profile" | "curated-demo-concept";
  brandStatus: "active" | "inactive" | "concept" | "unknown";
  profileStatus: "reviewed" | "in-review" | "not-reviewed";
  category: BrandFact<string>;
  industry: BrandFact<string>;
  description: BrandFact<string>;
  website: BrandFact<string>;
  franchisor: BrandFact<string>;
  economics: {
    franchiseFee: BrandFact<number>;
    initialInvestment: BrandFact<MoneyRange>;
    minimumLiquidCapital: BrandFact<number>;
    minimumNetWorth: BrandFact<number>;
    royalty: BrandFact<string>;
    marketingFund: BrandFact<string>;
    otherRecurringFees: BrandFact<RecurringFee[]>;
  };
  characteristics: {
    customerModel: BrandFact<"B2B" | "B2C" | "mixed">;
    businessType: BrandFact<"service" | "retail" | "food" | "professional" | "other">;
    operatingLocations: BrandFact<OperatingLocation[]>;
    ownerOperatorSuitability: BrandFact<Suitability>;
    semiAbsenteeSuitability: BrandFact<Suitability>;
    executiveSuitability: BrandFact<Suitability>;
    staffingIntensity: BrandFact<FitLevel>;
    salesIntensity: BrandFact<FitLevel>;
    operationalComplexity: BrandFact<FitLevel>;
    customerAcquisitionModel: BrandFact<string>;
    recurringRevenue: BrandFact<boolean>;
    locationDependence: BrandFact<FitLevel>;
    territoryModel: BrandFact<string>;
  };
  fit: {
    leadership: BrandFact<FitLevel>;
    salesComfort: BrandFact<FitLevel>;
    networkingBusinessDevelopment: BrandFact<FitLevel>;
    operationalManagement: BrandFact<FitLevel>;
    peopleManagement: BrandFact<FitLevel>;
    analyticalAptitude: BrandFact<FitLevel>;
    relationshipBuilding: BrandFact<FitLevel>;
    communityOrientation: BrandFact<FitLevel>;
    desiredLifestyle: BrandFact<string>;
    timeCommitment: BrandFact<string>;
    financialSuitability: BrandFact<string>;
    priorIndustryExperience: BrandFact<string>;
  };
  support: {
    initialTraining: BrandFact<string>;
    ongoingSupport: BrandFact<string>;
    marketingSupport: BrandFact<string>;
    salesSupport: BrandFact<string>;
    technologySupport: BrandFact<string>;
    fieldSupport: BrandFact<string>;
  };
  system: {
    approximateSize: BrandFact<string>;
    unitMix: BrandFact<string>;
    geography: BrandFact<string>;
    maturity: BrandFact<string>;
  };
  differentiators: BrandFact<string[]>;
  considerations: BrandFact<string[]>;
  discoveryQuestions: BrandFact<string[]>;
  completeness: BrandProfileCompleteness;
  consultantIntelligence: ConsultantBrandIntelligence;
  evidence: BrandEvidence[];
  version: { id: string; effectiveAt: string | null; approvedBy: string | null };
}
import type { ConsultantBrandIntelligence } from "./ConsultantBrandIntelligence.ts";
