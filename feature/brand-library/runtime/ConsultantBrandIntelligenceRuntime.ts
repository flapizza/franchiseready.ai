import type {
  ConsultantBrandIntelligence,
  ConsultantSignal,
  DiligenceGap,
  ProfileReadiness,
} from "../models/ConsultantBrandIntelligence.ts";
import type {
  BrandEvidence,
  BrandFact,
  BrandIntelligenceProfile,
  FitLevel,
} from "../models/BrandIntelligenceProfile.ts";

type CanonicalProfile = Omit<BrandIntelligenceProfile, "consultantIntelligence">;

type MaterialFact = {
  path: string;
  label: string;
  fact: BrandFact<unknown>;
  weight: number;
};

const high = (fact: BrandFact<FitLevel>) => fact.value === "high" || fact.value === "very-high";
const sentence = (value: string) => /[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`;
const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
const customerPhrase = (value: string) => value.startsWith("C-suite") ? value : lowerFirst(value);

function operatingSentence(value: string, locations: readonly string[]): string {
  if (locations.includes("retail")) return `Day-to-day operations center on a ${lowerFirst(value)}.`;
  if (locations.includes("mobile")) return `Day-to-day operations combine ${lowerFirst(value)}.`;
  if (/^home-based or small-office/i.test(value)) return `The owner works from a ${lowerFirst(value)}.`;
  if (locations.includes("home-based")) return `The work is ${lowerFirst(value)}.`;
  return `Day-to-day operations center on a ${lowerFirst(value)}.`;
}

function territorySentence(value: string): string {
  if (/^relationship-led/i.test(value)) return `New business comes through ${lowerFirst(value)}.`;
  if (/^locally developed/i.test(value)) {
    const object = value.replace(/^locally developed /i, "");
    return `Growth comes from building ${/\bpractice\b/i.test(object) ? "a local" : "local"} ${object}.`;
  }
  if (/^defined local service area built /i.test(value)) return `The owner builds a defined local service area ${value.replace(/^defined local service area built /i, "")}.`;
  if (/^defined local consumer territory dependent on /i.test(value)) return `Growth depends on ${value.replace(/^defined local consumer territory dependent on /i, "")} within the local territory.`;
  if (/^trade-area retail concept/i.test(value)) return `The business depends on ${lowerFirst(value).replace(/^trade-area retail concept dependent on /, "")} within its trade area.`;
  return `Growth comes through ${lowerFirst(value)}.`;
}

function uniqueEvidence(facts: readonly BrandFact<unknown>[]): BrandEvidence[] {
  return [...new Map(facts.flatMap((fact) => fact.evidence).map((item) => [item.id, item])).values()];
}

function materialFacts(profile: CanonicalProfile): MaterialFact[] {
  return [
    { path: "description", label: "Business description", fact: profile.description, weight: 3 },
    { path: "economics.initialInvestment", label: "Initial investment", fact: profile.economics.initialInvestment, weight: 3 },
    { path: "economics.minimumLiquidCapital", label: "Minimum liquid capital", fact: profile.economics.minimumLiquidCapital, weight: 2 },
    { path: "economics.minimumNetWorth", label: "Minimum net worth", fact: profile.economics.minimumNetWorth, weight: 2 },
    { path: "economics.franchiseFee", label: "Franchise fee", fact: profile.economics.franchiseFee, weight: 3 },
    { path: "economics.royalty", label: "Royalty structure", fact: profile.economics.royalty, weight: 3 },
    { path: "economics.marketingFund", label: "Marketing / brand fund", fact: profile.economics.marketingFund, weight: 2 },
    { path: "characteristics.customerModel", label: "Customer model", fact: profile.characteristics.customerModel, weight: 2 },
    { path: "characteristics.ownerOperatorSuitability", label: "Owner-operator suitability", fact: profile.characteristics.ownerOperatorSuitability, weight: 2 },
    { path: "characteristics.semiAbsenteeSuitability", label: "Semi-absentee suitability", fact: profile.characteristics.semiAbsenteeSuitability, weight: 2 },
    { path: "characteristics.executiveSuitability", label: "Executive / manager-run suitability", fact: profile.characteristics.executiveSuitability, weight: 2 },
    { path: "characteristics.staffingIntensity", label: "Staffing intensity", fact: profile.characteristics.staffingIntensity, weight: 2 },
    { path: "characteristics.salesIntensity", label: "Sales intensity", fact: profile.characteristics.salesIntensity, weight: 2 },
    { path: "characteristics.operationalComplexity", label: "Operational complexity", fact: profile.characteristics.operationalComplexity, weight: 2 },
    { path: "characteristics.customerAcquisitionModel", label: "Customer acquisition model", fact: profile.characteristics.customerAcquisitionModel, weight: 2 },
    { path: "characteristics.locationDependence", label: "Location dependence", fact: profile.characteristics.locationDependence, weight: 2 },
    { path: "characteristics.territoryModel", label: "Territory model", fact: profile.characteristics.territoryModel, weight: 2 },
    { path: "support.initialTraining", label: "Initial training", fact: profile.support.initialTraining, weight: 1 },
    { path: "support.ongoingSupport", label: "Ongoing support", fact: profile.support.ongoingSupport, weight: 1 },
  ];
}

function calculateReadiness(profile: CanonicalProfile): ProfileReadiness {
  const material = materialFacts(profile);
  const materialTotalWeight = material.reduce((sum, item) => sum + item.weight, 0);
  const materialKnownWeight = material.filter((item) => item.fact.value !== null).reduce((sum, item) => sum + item.weight, 0);
  const materialVerifiedWeight = material.filter((item) => item.fact.verification === "verified").reduce((sum, item) => sum + item.weight, 0);
  const coverage = materialTotalWeight === 0 ? 0 : materialKnownWeight / materialTotalWeight;
  const verifiedCoverage = materialTotalWeight === 0 ? 0 : materialVerifiedWeight / materialTotalWeight;
  const state = materialKnownWeight === 0 ? "not-reviewed"
    : coverage < 0.45 ? "limited-intelligence"
      : coverage >= 0.75 && verifiedCoverage >= 0.5 ? "core-intelligence-available"
        : "developing-profile";
  const rationale = state === "core-intelligence-available"
    ? "Most decision-critical operating and economic facts are known, and at least half of their weighted evidence has been verified."
    : state === "developing-profile"
      ? "Useful operating intelligence is available, but material facts are still missing or insufficiently verified."
      : state === "limited-intelligence"
        ? "Fewer than half of the weighted, decision-critical facts are currently known."
        : "No weighted, decision-critical facts have been reviewed.";
  return { state, materialKnownWeight, materialTotalWeight, materialVerifiedWeight, rationale, rawCompleteness: profile.completeness };
}

function businessSummary(profile: CanonicalProfile) {
  const facts: BrandFact<unknown>[] = [];
  const sourceFacts: string[] = [];
  const sentences: string[] = [];
  const recordBasis = (path: string, fact: BrandFact<unknown>) => { facts.push(fact); sourceFacts.push(path); };

  if (profile.description.value) {
    sentences.push(sentence(profile.description.value));
    recordBasis("description", profile.description);
  }
  if (profile.characteristics.customerAcquisitionModel.value) {
    sentences.push(profile.characteristics.customerModel.value === "B2B"
      ? `Franchisees serve ${customerPhrase(profile.characteristics.customerAcquisitionModel.value)}.`
      : `The customer base is ${customerPhrase(profile.characteristics.customerAcquisitionModel.value)}.`);
    recordBasis("characteristics.customerAcquisitionModel", profile.characteristics.customerAcquisitionModel);
    recordBasis("characteristics.customerModel", profile.characteristics.customerModel);
  }
  if (profile.fit.desiredLifestyle.value && profile.characteristics.territoryModel.value) {
    const locations = profile.characteristics.operatingLocations.value ?? [];
    sentences.push(`${operatingSentence(profile.fit.desiredLifestyle.value, locations)} ${territorySentence(profile.characteristics.territoryModel.value)}`);
    recordBasis("fit.desiredLifestyle", profile.fit.desiredLifestyle);
    recordBasis("characteristics.territoryModel", profile.characteristics.territoryModel);
    recordBasis("characteristics.operatingLocations", profile.characteristics.operatingLocations);
  }
  if (profile.characteristics.recurringRevenue.value !== null && sentences.length < 4) {
    sentences.push(profile.characteristics.recurringRevenue.value
      ? "Recurring customer revenue is part of the business model."
      : "The business is not built around recurring customer revenue.");
    recordBasis("characteristics.recurringRevenue", profile.characteristics.recurringRevenue);
  }

  const value = sentences.length > 0 ? sentences.slice(0, 4).join(" ") : null;
  const evidence = uniqueEvidence(facts);
  return {
    value,
    verification: value ? (facts.every((fact) => fact.verification === "verified") ? "verified" as const : "unverified" as const) : "unknown" as const,
    approval: value ? "approved-for-presentation" as const : "unavailable" as const,
    evidence,
    notes: value ? "Synthesized only from the listed canonical facts; no external claims were added." : "Insufficient canonical information for a business summary.",
    derivation: "deterministic" as const,
    sourceFacts,
  };
}

function roleSignals(profile: CanonicalProfile): ConsultantSignal[] {
  const signals: ConsultantSignal[] = [];
  if (profile.characteristics.customerAcquisitionModel.value) signals.push(profile.characteristics.customerModel.value === "B2B"
    ? { label: "Develop client relationships", explanation: `A large part of the role involves meeting and building credibility with ${lowerFirst(profile.characteristics.customerAcquisitionModel.value)}.`, sourceFacts: ["characteristics.customerAcquisitionModel", "characteristics.customerModel"] }
    : { label: "Build a local customer base", explanation: `The owner needs to be comfortable attracting and serving ${lowerFirst(profile.characteristics.customerAcquisitionModel.value)}.`, sourceFacts: ["characteristics.customerAcquisitionModel", "characteristics.customerModel"] });
  if (high(profile.fit.operationalManagement)) signals.push({ label: "Keep the business running well", explanation: "The owner needs to be comfortable managing priorities, processes, and day-to-day follow-through.", sourceFacts: ["fit.operationalManagement"] });
  if (high(profile.fit.peopleManagement)) signals.push({ label: "Lead and develop a team", explanation: "A meaningful part of the role involves hiring, directing, and supporting employees.", sourceFacts: ["fit.peopleManagement", "characteristics.staffingIntensity"] });
  if (profile.characteristics.ownerOperatorSuitability.value === "well-suited") signals.push({ label: "Stay close to the day-to-day work", explanation: "This is an active owner-operator model, so the owner should expect to stay involved in delivery and daily decisions.", sourceFacts: ["characteristics.ownerOperatorSuitability"] });
  if (profile.characteristics.executiveSuitability.value === "well-suited") signals.push({ label: "Set direction and manage the business", explanation: "The role favors an executive or manager-led approach rather than requiring the owner to perform every task personally.", sourceFacts: ["characteristics.executiveSuitability"] });
  return signals.slice(0, 4);
}

function strongFitSignals(profile: CanonicalProfile): ConsultantSignal[] {
  const candidates: [string, string, BrandFact<FitLevel>, string][] = [
    ["Experienced leader", "A good fit is likely to be someone who enjoys setting direction, making decisions, and leading through others.", profile.fit.leadership, "fit.leadership"],
    ["Relationship-oriented business developer", "A good fit is likely to enjoy opening doors, building credibility, and guiding clients through a considered decision.", profile.fit.salesComfort, "fit.salesComfort"],
    ["Comfortable building a network", "This business favors someone who will consistently meet people, stay visible, and turn relationships into opportunities.", profile.fit.networkingBusinessDevelopment, "fit.networkingBusinessDevelopment"],
    ["Strong operating manager", "A good fit is likely to enjoy organizing the work, watching the details, and keeping the business on track.", profile.fit.operationalManagement, "fit.operationalManagement"],
    ["Hands-on people leader", "This model suits someone who is comfortable hiring, coaching, and holding a team accountable.", profile.fit.peopleManagement, "fit.peopleManagement"],
    ["Analytical problem solver", "A good fit is likely to be comfortable working through financial and operating information before making decisions.", profile.fit.analyticalAptitude, "fit.analyticalAptitude"],
    ["Long-term relationship builder", "This model favors someone who earns trust over time and stays engaged after the first conversation.", profile.fit.relationshipBuilding, "fit.relationshipBuilding"],
  ];
  return candidates.filter(([, , fact]) => high(fact)).slice(0, 4).map(([label, explanation, , path]) => ({ label, explanation, sourceFacts: [path] }));
}

function frictionSignals(profile: CanonicalProfile): ConsultantSignal[] {
  const signals: ConsultantSignal[] = [];
  if (high(profile.characteristics.salesIntensity)) signals.push({ label: "Requires consistent business development", explanation: "This probably isn't a strong fit for someone who wants clients to come to them. The owner needs to be comfortable opening doors and consistently developing new business.", sourceFacts: ["characteristics.salesIntensity"] });
  if (high(profile.characteristics.staffingIntensity)) signals.push({ label: "Comes with real people-management responsibility", explanation: "Someone looking for a solo or low-staff business may find the hiring, coaching, and accountability demands too heavy.", sourceFacts: ["characteristics.staffingIntensity"] });
  if (high(profile.characteristics.operationalComplexity)) signals.push({ label: "Needs close operational attention", explanation: "This isn't a purely strategic ownership role. The owner needs to be comfortable solving day-to-day operating problems and keeping execution on track.", sourceFacts: ["characteristics.operationalComplexity"] });
  if (high(profile.characteristics.locationDependence)) signals.push({ label: "Tied to a local operating location", explanation: "Someone who wants a home-based or geographically flexible business may find the location requirements restrictive.", sourceFacts: ["characteristics.locationDependence"] });
  if (profile.characteristics.ownerOperatorSuitability.value === "well-suited") signals.push({ label: "Calls for active owner involvement", explanation: "This may not suit someone looking for passive or manager-only ownership. The day-to-day role needs to be understood before moving forward.", sourceFacts: ["characteristics.ownerOperatorSuitability"] });
  if (profile.characteristics.semiAbsenteeSuitability.value === "not-suited") signals.push({ label: "Not designed for semi-absentee ownership", explanation: "Someone who wants to keep another full-time role may find the ownership commitment difficult to manage.", sourceFacts: ["characteristics.semiAbsenteeSuitability"] });
  return signals.slice(0, 4);
}

function diligenceGaps(profile: CanonicalProfile): DiligenceGap[] {
  const material = materialFacts(profile);
  const priority = [
    "economics.franchiseFee", "economics.royalty", "economics.marketingFund", "economics.minimumNetWorth",
    "economics.initialInvestment", "economics.minimumLiquidCapital", "characteristics.semiAbsenteeSuitability",
    "characteristics.ownerOperatorSuitability", "characteristics.executiveSuitability", "characteristics.staffingIntensity",
    "characteristics.salesIntensity", "characteristics.locationDependence", "description",
  ];
  const prioritized = priority.map((path) => material.find((item) => item.path === path)).filter((item): item is MaterialFact => Boolean(item));
  const gaps: DiligenceGap[] = [];
  for (const item of prioritized) {
    if (item.fact.value === null) gaps.push({ label: item.label, reason: "No supported value is recorded; verify before serious candidate presentation.", state: "unknown", sourceFact: item.path });
    else if (item.fact.verification === "unverified" || item.fact.verification === "conflicting") gaps.push({ label: item.label, reason: "A value is available, but its supporting source has not been independently verified.", state: "unverified", sourceFact: item.path });
    if (gaps.length === 6) break;
  }
  return gaps;
}

export class ConsultantBrandIntelligenceRuntime {
  derive(profile: CanonicalProfile): ConsultantBrandIntelligence {
    const summary = businessSummary(profile);
    return {
      businessSummary: summary,
      franchiseeRole: roleSignals(profile),
      strongFit: strongFitSignals(profile),
      potentialFriction: frictionSignals(profile),
      businessAtAGlance: [
        { label: "Customer model", fact: profile.characteristics.customerModel },
        { label: "Initial investment", fact: profile.economics.initialInvestment },
        { label: "Minimum liquidity", fact: profile.economics.minimumLiquidCapital },
        { label: "Owner-operator", fact: profile.characteristics.ownerOperatorSuitability },
        { label: "Executive / manager-run", fact: profile.characteristics.executiveSuitability },
        { label: "Operating environment", fact: profile.fit.desiredLifestyle },
        { label: "Sales intensity", fact: profile.characteristics.salesIntensity },
        { label: "Staffing intensity", fact: profile.characteristics.staffingIntensity },
        { label: "Recurring revenue", fact: profile.characteristics.recurringRevenue },
        { label: "Location dependence", fact: profile.characteristics.locationDependence },
      ],
      diligenceGaps: diligenceGaps(profile),
      readiness: calculateReadiness(profile),
      evidence: summary.evidence,
      version: { id: `${profile.id}:consultant-intelligence-v1`, effectiveAt: null, approvedBy: null },
    };
  }
}
