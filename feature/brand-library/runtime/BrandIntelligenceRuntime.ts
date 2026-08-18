import type { BrandProfile } from "../models/BrandProfile";
import type { BrandIntelligenceProfile, GovernedBrandFact, PresentationApproval } from "../models/BrandIntelligenceProfile";
import { SeedBrandRepository } from "../repositories/SeedBrandRepository";

const VERIFIED_AT = "2026-08-01T00:00:00.000Z";
const fact = <T>(value: T, approval: PresentationApproval = "approved-for-presentation"): GovernedBrandFact<T> => ({ value, source: "brand-profile", approval, verifiedAt: VERIFIED_AT });
const missing = <T>(approval: PresentationApproval = "unavailable"): GovernedBrandFact<T> => ({ value: null, source: "unverified", approval, verifiedAt: null });
export const presentationValue = <T>(value: GovernedBrandFact<T>): T | null => value.approval === "approved-for-presentation" ? value.value : null;

export class BrandIntelligenceRuntime {
  constructor(private readonly brands = new SeedBrandRepository()) {}
  async getAll(): Promise<BrandIntelligenceProfile[]> { return Promise.all((await this.brands.getAll()).map((brand) => this.fromBrandProfile(brand))); }
  async getById(brandId: string): Promise<BrandIntelligenceProfile | null> { const brand = await this.brands.getById(brandId); return brand ? this.fromBrandProfile(brand) : null; }

  fromBrandProfile(brand: BrandProfile): BrandIntelligenceProfile {
    const ownerRole = brand.businessModel.executiveModel ? "Executive / strategic owner" : brand.businessModel.ownerOperator ? "Owner-operator" : "Not Yet Available";
    const salesLevel = brand.operatingModel.salesIntensity >= 92 ? "very-high" : brand.operatingModel.salesIntensity >= 80 ? "high" : brand.operatingModel.salesIntensity >= 55 ? "moderate" : "low";
    return { brandId: brand.id, brandName: brand.name, category: fact(brand.category), website: brand.website ? fact(brand.website) : missing(), overview: fact(brand.shortDescription),
      ownerRole: ownerRole === "Not Yet Available" ? missing() : fact(ownerRole), customerType: fact(brand.operatingModel.primaryCustomer),
      businessModel: fact([brand.businessModel.b2b ? "B2B" : null, brand.businessModel.b2c ? "B2C" : null].filter(Boolean).join(" / ")),
      operatingEnvironment: fact(brand.businessModel.homeBased ? "Home-based" : "Not Yet Profiled", brand.businessModel.homeBased ? "approved-for-presentation" : "needs-review"),
      businessDevelopment: fact({ level: salesLevel, description: `${salesLevel.replace("-", " ")} personal business-development expectation` }),
      staffingModel: fact(brand.operatingModel.teamModel.replace("-", " ")), revenueModel: fact(brand.businessModel.recurringRevenue ? "Predominantly recurring" : "Transaction-based"), territoryModel: missing("needs-review"),
      financial: { totalInvestmentMin: fact(brand.investment.minimum), totalInvestmentMax: fact(brand.investment.maximum), minimumLiquidCapital: brand.investment.liquidCapitalMinimum ? fact(brand.investment.liquidCapitalMinimum) : missing(), minimumNetWorth: missing(), franchiseFee: missing(), royalty: missing(), marketingFund: missing(), financingNotes: missing() },
      trainingSupport: { initialTraining: missing(), launchSupport: missing(), ongoingSupport: missing(), businessDevelopmentSupport: missing(), technologySupport: missing() },
      differentiators: fact([...brand.strengths.slice(0, 3), ...(brand.businessModel.recurringRevenue ? ["Recurring-revenue characteristics"] : []), ...(brand.businessModel.homeBased ? ["Home-based operating model"] : [])]),
      commonConcerns: fact(brand.considerations), approvedTalkingPoints: fact(brand.strengths.slice(0, 3)), canonicalQuestions: fact(brand.discoveryQuestions),
      referralContact: brand.referralContact ? fact(brand.referralContact) : missing("internal-only"),
      materials: [{ kind: "website", label: "Franchise website", url: brand.website ?? null, approval: brand.website ? "approved-for-presentation" : "unavailable" }, { kind: "fdd", label: "FDD reference", url: null, approval: "unavailable" }],
      completeness: "mostly-profiled", version: { id: `${brand.id}:demo-v1`, effectiveAt: VERIFIED_AT, approvedBy: "Demo governance seed" } };
  }
}
