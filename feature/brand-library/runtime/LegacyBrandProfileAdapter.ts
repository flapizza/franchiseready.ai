import type { BrandProfile } from "../models/BrandProfile.ts";
import type { BrandEvidence, BrandFact, BrandIntelligenceProfile, FitLevel, OperatingLocation, Suitability } from "../models/BrandIntelligenceProfile.ts";
import { calculateBrandProfileCompleteness } from "./BrandProfileCompleteness.ts";
import { ConsultantBrandIntelligenceRuntime } from "./ConsultantBrandIntelligenceRuntime.ts";

const unknown = <T>(notes?: string): BrandFact<T> => ({ value: null, verification: "unknown", approval: "unavailable", evidence: [], notes });
const level = (score: number): FitLevel => score >= 90 ? "very-high" : score >= 75 ? "high" : score >= 50 ? "moderate" : "low";
const suitability = (supported: boolean): Suitability => supported ? "well-suited" : "not-suited";

function legacyEvidence(brand: BrandProfile, field: string): BrandEvidence {
  return {
    id: `${brand.id}:legacy:${field}`,
    sourceType: brand.demoClassification === "curated-demo-concept" ? "inferred" : "legacy-demo",
    title: brand.demoClassification === "curated-demo-concept" ? "Curated IFPG demo concept" : "Existing IFPG demo profile",
    verification: "unverified",
    confidence: "low",
    notes: "Internal demo material only; no external source document is recorded in the repository.",
  };
}

function businessType(brand: BrandProfile): "service" | "retail" | "professional" | "other" {
  const value = `${brand.category} ${brand.shortDescription}`.toLowerCase();
  if (value.includes("retail")) return "retail";
  if (value.includes("consult") || value.includes("coach")) return "professional";
  if (value.includes("service")) return "service";
  return "other";
}

function operatingLocations(brand: BrandProfile): OperatingLocation[] {
  const values: OperatingLocation[] = [];
  if (brand.businessModel.homeBased) values.push("home-based");
  if (/mobile/i.test(brand.operatingEnvironment)) values.push("mobile");
  if (/retail|brick-and-mortar/i.test(brand.operatingEnvironment)) values.push("retail");
  if (/office/i.test(brand.operatingEnvironment)) values.push("office");
  return values.length > 0 ? values : ["unknown"];
}

export class LegacyBrandProfileAdapter {
  private readonly consultantIntelligence: ConsultantBrandIntelligenceRuntime;

  constructor(consultantIntelligence = new ConsultantBrandIntelligenceRuntime()) {
    this.consultantIntelligence = consultantIntelligence;
  }

  toIntelligenceProfile(brand: BrandProfile): BrandIntelligenceProfile {
    const fact = <T>(field: string, value: T): BrandFact<T> => ({
      value, verification: "unverified", approval: "approved-for-presentation", evidence: [legacyEvidence(brand, field)],
      notes: "Preserved from the frozen IFPG demo; requires source verification before production use.",
    });
    const inferred = <T>(field: string, value: T): BrandFact<T> => ({
      value, verification: "unverified", approval: "approved-for-presentation",
      evidence: [{ ...legacyEvidence(brand, field), sourceType: "inferred", title: "Derived from existing IFPG demo inputs" }],
      notes: "Deterministically derived for navigation and comparison; not an externally verified brand claim.",
    });
    const profile = {
      id: brand.id, name: brand.name, demoClassification: brand.demoClassification,
      brandStatus: brand.demoClassification === "curated-demo-concept" ? "concept" as const : "unknown" as const,
      profileStatus: "not-reviewed" as const,
      category: fact("category", brand.category), industry: fact("industry", brand.category), description: fact("description", brand.shortDescription),
      website: brand.website ? fact("website", brand.website) : unknown<string>("No website is recorded for this demo concept."),
      franchisor: unknown<string>("Franchisor legal identity has not been reviewed."),
      economics: {
        franchiseFee: unknown<number>("No supported franchise-fee value is recorded."),
        initialInvestment: fact("initial-investment", { minimum: brand.investment.minimum, maximum: brand.investment.maximum, currency: "USD" as const }),
        minimumLiquidCapital: brand.investment.liquidCapitalMinimum ? fact("minimum-liquid-capital", brand.investment.liquidCapitalMinimum) : unknown<number>(),
        minimumNetWorth: unknown<number>("No supported minimum-net-worth value is recorded."), royalty: unknown<string>("No supported royalty structure is recorded."),
        marketingFund: unknown<string>("No supported brand-fund fee is recorded."), otherRecurringFees: unknown<{ name: string; amount: string }[]>("No other recurring-fee schedule is recorded."),
      },
      characteristics: {
        customerModel: inferred("customer-model", brand.businessModel.b2b && brand.businessModel.b2c ? "mixed" as const : brand.businessModel.b2b ? "B2B" as const : "B2C" as const),
        businessType: inferred("business-type", businessType(brand)), operatingLocations: inferred("operating-locations", operatingLocations(brand)),
        ownerOperatorSuitability: inferred("owner-operator", suitability(brand.businessModel.ownerOperator)), semiAbsenteeSuitability: unknown<Suitability>("The legacy demo does not represent semi-absentee suitability."),
        executiveSuitability: inferred("executive-model", suitability(brand.businessModel.executiveModel)),
        staffingIntensity: inferred("staffing-intensity", brand.operatingModel.teamModel === "team-led" ? "high" as const : brand.operatingModel.teamModel === "small-team" ? "moderate" as const : "low" as const),
        salesIntensity: inferred("sales-intensity", level(brand.operatingModel.salesIntensity)), operationalComplexity: inferred("operational-complexity", level(brand.operatingModel.operationalIntensity)),
        customerAcquisitionModel: fact("customer-acquisition", brand.operatingModel.primaryCustomer), recurringRevenue: fact("recurring-revenue", brand.businessModel.recurringRevenue),
        locationDependence: inferred("location-dependence", brand.businessModel.homeBased ? "low" as const : /retail|hub/i.test(brand.operatingEnvironment) ? "very-high" as const : "moderate" as const),
        territoryModel: fact("territory-model", brand.territoryModel),
      },
      fit: {
        leadership: inferred("fit-leadership", level(brand.idealCandidate.leadership)), salesComfort: inferred("fit-sales", level(brand.idealCandidate.sales)),
        networkingBusinessDevelopment: inferred("fit-networking", level(brand.idealCandidate.relationshipBuilding)), operationalManagement: inferred("fit-operations", level(brand.idealCandidate.operations)),
        peopleManagement: inferred("fit-people-management", brand.operatingModel.teamModel === "team-led" ? "very-high" as const : brand.operatingModel.teamModel === "small-team" ? "moderate" as const : "low" as const),
        analyticalAptitude: inferred("fit-analytical", level(brand.idealCandidate.financial)), relationshipBuilding: inferred("fit-relationships", level(brand.idealCandidate.relationshipBuilding)),
        communityOrientation: brand.tags.includes("community-focused") || brand.tags.includes("b2c") ? inferred("fit-community", "high" as const) : unknown<FitLevel>("Community-orientation expectations are not represented."),
        desiredLifestyle: fact("fit-lifestyle", brand.operatingEnvironment), timeCommitment: unknown<string>("No supported time-commitment expectation is recorded."),
        financialSuitability: fact("fit-financial", `Legacy demo thresholds: ${brand.investment.minimum}–${brand.investment.maximum} USD`),
        priorIndustryExperience: unknown<string>("No prior-industry-experience requirement is recorded."),
      },
      support: {
        initialTraining: fact("support-initial-training", brand.trainingSupport.initialTraining), ongoingSupport: fact("support-ongoing", brand.trainingSupport.ongoingSupport),
        marketingSupport: fact("support-launch", brand.trainingSupport.launchSupport), salesSupport: unknown<string>("Sales-support details have not been separately reviewed."),
        technologySupport: fact("support-technology", brand.trainingSupport.technologySupport), fieldSupport: unknown<string>("Field-support details have not been reviewed."),
      },
      system: {
        approximateSize: unknown<string>("Current unit counts are not recorded."), unitMix: unknown<string>("Company/franchise unit mix is not recorded."),
        geography: unknown<string>("System geography has not been reviewed."), maturity: unknown<string>("Growth and maturity indicators have not been reviewed."),
      },
      differentiators: fact("differentiators", brand.strengths), considerations: fact("considerations", brand.considerations), discoveryQuestions: fact("discovery-questions", brand.discoveryQuestions),
      version: { id: `${brand.id}:legacy-demo-v1`, effectiveAt: null, approvedBy: null },
    };
    const fields = [
      ["Category", profile.category], ["Industry", profile.industry], ["Description", profile.description], ["Website", profile.website], ["Franchisor", profile.franchisor],
      ["Franchise fee", profile.economics.franchiseFee], ["Initial investment", profile.economics.initialInvestment], ["Minimum liquid capital", profile.economics.minimumLiquidCapital], ["Minimum net worth", profile.economics.minimumNetWorth], ["Royalty", profile.economics.royalty], ["Marketing fund", profile.economics.marketingFund],
      ["Customer model", profile.characteristics.customerModel], ["Business type", profile.characteristics.businessType], ["Operating locations", profile.characteristics.operatingLocations], ["Owner-operator suitability", profile.characteristics.ownerOperatorSuitability], ["Semi-absentee suitability", profile.characteristics.semiAbsenteeSuitability], ["Executive suitability", profile.characteristics.executiveSuitability], ["Staffing intensity", profile.characteristics.staffingIntensity], ["Sales intensity", profile.characteristics.salesIntensity], ["Operational complexity", profile.characteristics.operationalComplexity], ["Customer acquisition", profile.characteristics.customerAcquisitionModel], ["Recurring revenue", profile.characteristics.recurringRevenue], ["Location dependence", profile.characteristics.locationDependence], ["Territory model", profile.characteristics.territoryModel],
      ["Initial training", profile.support.initialTraining], ["Ongoing support", profile.support.ongoingSupport], ["Marketing support", profile.support.marketingSupport], ["Sales support", profile.support.salesSupport], ["Technology support", profile.support.technologySupport], ["Field support", profile.support.fieldSupport],
      ["System size", profile.system.approximateSize], ["Unit mix", profile.system.unitMix], ["Geography", profile.system.geography], ["Maturity", profile.system.maturity],
    ] as const;
    const evidence = [...new Map(fields.flatMap(([, item]) => item.evidence).map((item) => [item.id, item])).values()];
    const canonicalProfile = { ...profile, completeness: calculateBrandProfileCompleteness(fields.map(([label, item]) => ({ label, fact: item }))), evidence };
    return { ...canonicalProfile, consultantIntelligence: this.consultantIntelligence.derive(canonicalProfile) };
  }
}
