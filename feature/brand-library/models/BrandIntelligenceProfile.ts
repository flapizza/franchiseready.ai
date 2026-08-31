export type BrandFactSource = "brand-profile" | "brand-provided" | "approved-material" | "fdd" | "consultant-maintained" | "unverified";
export type PresentationApproval = "approved-for-presentation" | "internal-only" | "needs-review" | "unavailable";
export interface GovernedBrandFact<T> { value: T | null; source: BrandFactSource; approval: PresentationApproval; verifiedAt: string | null }
export interface BrandMaterialReference { kind: "website" | "brochure" | "video" | "fdd" | "territory-map" | "validation-contact" | "financial-disclosure"; label: string; url: string | null; approval: PresentationApproval }
export interface BrandIntelligenceProfile {
  brandId: string; brandName: string; demoClassification: "existing-demo-profile" | "curated-demo-concept"; category: GovernedBrandFact<string>; website: GovernedBrandFact<string>;
  overview: GovernedBrandFact<string>; ownerRole: GovernedBrandFact<string>; customerType: GovernedBrandFact<string>;
  businessModel: GovernedBrandFact<string>; operatingEnvironment: GovernedBrandFact<string>;
  businessDevelopment: GovernedBrandFact<{ level: "low" | "moderate" | "high" | "very-high"; description: string }>;
  staffingModel: GovernedBrandFact<string>; revenueModel: GovernedBrandFact<string>; territoryModel: GovernedBrandFact<string>;
  financial: { totalInvestmentMin: GovernedBrandFact<number>; totalInvestmentMax: GovernedBrandFact<number>; minimumLiquidCapital: GovernedBrandFact<number>; minimumNetWorth: GovernedBrandFact<number>; franchiseFee: GovernedBrandFact<number>; royalty: GovernedBrandFact<string>; marketingFund: GovernedBrandFact<string>; financingNotes: GovernedBrandFact<string> };
  trainingSupport: { initialTraining: GovernedBrandFact<string>; launchSupport: GovernedBrandFact<string>; ongoingSupport: GovernedBrandFact<string>; businessDevelopmentSupport: GovernedBrandFact<string>; technologySupport: GovernedBrandFact<string> };
  differentiators: GovernedBrandFact<string[]>; commonConcerns: GovernedBrandFact<string[]>; approvedTalkingPoints: GovernedBrandFact<string[]>; canonicalQuestions: GovernedBrandFact<string[]>;
  referralContact: GovernedBrandFact<{ name: string; email: string; title: string }>;
  materials: BrandMaterialReference[]; completeness: "profile-complete" | "mostly-profiled" | "needs-brand-information";
  version: { id: string; effectiveAt: string; approvedBy: string | null };
}
