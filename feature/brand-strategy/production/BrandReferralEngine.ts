import type { BrandFact, BrandIntelligenceProfile } from "@/feature/brand-library/models/BrandIntelligenceProfile";
import type { PersistedCandidateWorkspace } from "@/feature/crm/models/PersistedCandidateWorkspace";

export type FitState = "aligned" | "validate" | "constraint" | "unknown";
export type FitCategory = "Financial compatibility" | "Ownership model" | "Operations" | "Leadership and sales" | "Lifestyle" | "Timing and readiness" | "Motivation and customers";
export interface FitFactor { category: FitCategory; label: string; state: FitState; explanation: string; candidateSource: string; brandSource: string; evidence: string[]; provisional: boolean }
export interface BrandReferralResult {
  brandId: string; name: string; band: "Worth exploring" | "Resolve tradeoffs" | "Limited alignment" | "Insufficient evidence";
  factors: FitFactor[]; strengths: FitFactor[]; concerns: FitFactor[]; unknowns: FitFactor[];
  financial: FitState; evidenceLabel: string; nextStep: string; concept: boolean; versionId: string;
}
export const fitLabels: Record<FitState, string> = { aligned: "Supports fit", validate: "Validate", constraint: "Potential conflict", unknown: "Unknown" };

export function moneyRanges(value: string): Array<{ min: number; max: number }> {
  if (/prefer to discuss|guidance|unknown/i.test(value)) return [];
  return [...value.matchAll(/(Under\s+)?\$(\d[\d,]*)(?:\s*[–-]\s*\$(\d[\d,]*))?(\+)?/gi)].map(m => {
    const lower = Number(m[2].replaceAll(",", ""));
    return { min: m[1] ? 0 : lower, max: m[1] ? lower - 1 : m[4] ? Infinity : m[3] ? Number(m[3].replaceAll(",", "")) : lower };
  });
}
export function factKnown<T>(fact: BrandFact<T>): fact is BrandFact<T> & { value: T } {
  return fact.value !== null && fact.value !== undefined && fact.value !== "unknown" && fact.knowledgeState !== "unknown" && !["unknown", "conflicting"].includes(fact.verification);
}
export function thresholdFit(reported: string, minimum: BrandFact<number>): FitState {
  const ranges = moneyRanges(reported);
  if (!ranges.length || !factKnown(minimum)) return "unknown";
  if (ranges.every(r => r.max < minimum.value)) return "constraint";
  return ranges.every(r => r.min >= minimum.value) ? "aligned" : "validate";
}
export function investmentFit(reported: string, fact: BrandIntelligenceProfile["economics"]["initialInvestment"]): FitState {
  const ranges = moneyRanges(reported);
  if (!ranges.length || !factKnown(fact) || fact.value.minimum === null || fact.value.currency !== "USD") return "unknown";
  const min = fact.value.minimum, max = fact.value.maximum;
  // A lower-cost opportunity is a preference discussion, not a capital shortfall.
  if (ranges.every(r => r.max < min)) return "constraint";
  return max !== null && ranges.some(r => r.min <= min && r.max >= max) ? "aligned" : "validate";
}
const combined = (factors: FitFactor[]): FitState => factors.some(f => f.state === "constraint") ? "constraint" : factors.some(f => f.state === "unknown") ? "unknown" : factors.some(f => f.state === "validate") ? "validate" : "aligned";

/** Reuses the existing matching dimensions and financial gating, with governed facts
 * and trusted assessment vocabulary instead of legacy inferred percentages. */
export function evaluateBrand(row: PersistedCandidateWorkspace, brand: BrandIntelligenceProfile): BrandReferralResult {
  const analysis = row.assessment?.analysis;
  if (!analysis) throw new Error("Completed trusted Candidate Intelligence is required.");
  const factors: FitFactor[] = [];
  const characteristics = analysis.opportunityCharacteristics;
  const preference = (name: string) => characteristics.find(c => c.characteristic === name)?.disposition;
  const dimension = (name: string) => analysis.dimensions[name];
  function add<T>(category: FitCategory, label: string, fact: BrandFact<T>, path: string, source: string, assess: (value: T) => { state: FitState; explanation: string }) {
    const known = factKnown(fact); const result = known ? assess(fact.value) : { state: "unknown" as const, explanation: `${label} is unknown or conflicting in the brand profile; no positive fit is assumed.` };
    factors.push({ category, label, ...result, candidateSource: source, brandSource: path, evidence: fact.evidence.map(e => e.title), provisional: fact.verification !== "verified" || !fact.evidence.length });
  }
  const financial = analysis.financial;
  for (const [label, key, reported, source] of [["Liquid capital", "minimumLiquidCapital", financial.liquidCapital, "Assessment q33"], ["Net worth", "minimumNetWorth", financial.netWorth, "Assessment q32"]] as const) {
    const fact = brand.economics[key];
    add("Financial compatibility", label, fact, `economics.${key}`, source, value => ({ state: thresholdFit(reported, fact), explanation: `Candidate reports ${reported}; the profile states a $${value.toLocaleString("en-US")} minimum. Ranges and funding remain unverified.` }));
  }
  add("Financial compatibility", "Total investment", brand.economics.initialInvestment, "economics.initialInvestment", "Assessment q34", value => ({ state: investmentFit(financial.investmentRange, brand.economics.initialInvestment), explanation: `Candidate preference: ${financial.investmentRange}. Brand range: ${value.minimum === null ? "unknown" : "$" + value.minimum.toLocaleString("en-US")} to ${value.maximum === null ? "unknown" : "$" + value.maximum.toLocaleString("en-US")}. Total investment is separate from required liquid capital.` }));
  const role = analysis.ownershipProfile.operatingPreferences[0] ?? "Ownership role needs clarification";
  const managerLed = /management team|strategic oversight/i.test(role);
  const suitability = managerLed ? brand.characteristics.semiAbsenteeSuitability : brand.characteristics.ownerOperatorSuitability;
  add("Ownership model", managerLed ? "Manager-led ownership" : "Active ownership", suitability, managerLed ? "characteristics.semiAbsenteeSuitability" : "characteristics.ownerOperatorSuitability", "Assessment q5", value => ({ state: value === "well-suited" ? "aligned" : value === "not-suited" ? "constraint" : "validate", explanation: `${role}. The brand profile describes this ownership model as ${value.replaceAll("-", " ")}; confirm launch responsibilities separately.` }));
  add("Operations", "Staffing demand", brand.characteristics.staffingIntensity, "characteristics.staffingIntensity", "Assessment q27/q28; workforce preference", value => {
    const intense = ["high", "very-high"].includes(value), appetite = preference("employee-intensive");
    return { state: intense && appetite === "Potential Constraint" ? "constraint" : intense && appetite === "Attractive" || !intense && preference("lean team") === "Attractive" ? "aligned" : "validate", explanation: `Brand staffing intensity is ${value}. Candidate staffing preference: ${appetite ?? "unknown"}; lean-team preference: ${preference("lean team") ?? "unknown"}. Leadership capability does not establish staffing appetite.` };
  });
  add("Operations", "Operating environment", brand.characteristics.operatingLocations, "characteristics.operatingLocations", "Assessment opportunity characteristics", value => {
    const retail = value.includes("retail"), remote = value.includes("home-based");
    return { state: retail && preference("retail") === "Potential Constraint" ? "constraint" : remote && preference("home-based") === "Attractive" ? "aligned" : "validate", explanation: `Brand locations: ${value.join(", ")}. Candidate home-based preference: ${preference("home-based") ?? "unknown"}; retail preference: ${preference("retail") ?? "unknown"}. Validate field/office requirements.` };
  });
  add("Leadership and sales", "Owner selling", brand.characteristics.salesIntensity, "characteristics.salesIntensity", "Assessment q13–q16/q30", value => {
    const demanding = ["high", "very-high"].includes(value), appetite = preference("owner selling");
    return { state: demanding && appetite === "Potential Constraint" ? "constraint" : demanding && appetite === "Attractive" && dimension("businessDevelopmentCapability") >= 65 ? "aligned" : !demanding && appetite === "Potential Constraint" ? "aligned" : "validate", explanation: `Sales intensity is ${value}; the candidate's owner-selling preference is ${appetite ?? "unknown"}. Ability to sell and desire to sell are evaluated separately.` };
  });
  add("Leadership and sales", "People leadership", brand.fit.leadership, "fit.leadership", "Assessment leadership evidence", value => ({ state: ["high", "very-high"].includes(value) && dimension("leadership") >= 65 ? "aligned" : "validate", explanation: `Brand leadership emphasis is ${value}. ${analysis.ownershipProfile.strengths.find(s => /people|lead/i.test(s)) ?? "Explore concrete leadership examples with the candidate."}` }));
  add("Lifestyle", "Schedule alignment", brand.fit.desiredLifestyle, "fit.desiredLifestyle", "Assessment q29; operating preferences", value => {
    const bounded = analysis.ownershipProfile.operatingPreferences.some(p => /limited weekends|limited evenings|family commitments|weekday/i.test(p));
    const conflicting = /retail|evening|weekend|on.call/i.test(value) && !/limited (evening|weekend)/i.test(value);
    return { state: bounded && conflicting ? "constraint" : bounded && /weekday|business.hours/i.test(value) ? "aligned" : "validate", explanation: `Brand lifestyle description: ${value}. Candidate preferences: ${analysis.ownershipProfile.operatingPreferences.slice(1).join("; ") || "not established"}. Validate actual launch hours.` };
  });
  add("Motivation and customers", "Customer relationships", brand.characteristics.customerModel, "characteristics.customerModel", "Assessment opportunity characteristics and motivations", value => ({ state: preference(value === "B2B" ? "B2B" : "B2C") === "Attractive" ? "aligned" : "validate", explanation: `Brand serves ${value} customers. Candidate motivations: ${analysis.ownershipProfile.motivations.join("; ")}. Validate the actual customer role and growth model.` }));
  const unresolved = row.discovery?.observations.filter(o => o.followUpNeeded || ["unclear", "contradicted"].includes(o.status)) ?? [];
  const incomeTension = analysis.tensions.some(t => /Income Urgency/.test(t.title));
  const discoveryReady = row.discovery?.currentIntelligence?.readiness === "ready-for-brand-strategy";
  factors.push({ category: "Timing and readiness", label: "Consultant readiness review", state: unresolved.length || incomeTension || row.candidate.status === "on-hold" ? "constraint" : discoveryReady ? "aligned" : "validate",
    explanation: unresolved.length ? unresolved.map(o => `${o.topic}: ${o.finding}`).join(" ") : incomeTension ? "Income urgency and household runway need reconciliation before any commitment." : discoveryReady ? "Discovery supports reviewing brand fit; this is not approval to transmit a referral." : "Complete consultant-led Discovery before treating fit as an introduction decision.", candidateSource: "Assessment tensions and current Discovery findings", brandSource: "No launch timeline or territory availability assumed", evidence: [], provisional: true });
  const strengths = factors.filter(f => f.state === "aligned"), concerns = factors.filter(f => ["constraint", "validate"].includes(f.state)), unknowns = factors.filter(f => f.state === "unknown");
  const conflicts = factors.filter(f => f.state === "constraint").length;
  const band = unknowns.length >= Math.ceil(factors.length / 2) ? "Insufficient evidence" : conflicts >= 3 ? "Limited alignment" : conflicts ? "Resolve tradeoffs" : strengths.length >= 4 ? "Worth exploring" : "Insufficient evidence";
  const financialState = combined(factors.filter(f => f.category === "Financial compatibility"));
  return { brandId: brand.id, name: brand.name, band, factors, strengths, concerns, unknowns, financial: financialState, concept: brand.brandStatus === "concept", versionId: brand.version.id,
    evidenceLabel: factors.some(f => f.provisional) ? "Provisional: contains unverified or missing brand evidence" : "Brand factors have verified evidence; candidate statements remain self-reported",
    nextStep: unresolved.length ? `Resolve ${unresolved[0].topic.toLowerCase()} before an introduction. ${row.discovery?.nextSteps ?? ""}` : financialState === "constraint" ? "Resolve the stated financial mismatch before advancing this opportunity." : `${row.discovery?.nextSteps || "Validate operating responsibilities and candidate priorities in Discovery."} Confirm current financial requirements, territory availability and consent before any introduction.` };
}

export function rankBrands(row: PersistedCandidateWorkspace, brands: BrandIntelligenceProfile[]) {
  const order = { "Worth exploring": 3, "Resolve tradeoffs": 2, "Insufficient evidence": 1, "Limited alignment": 0 };
  return brands.filter(b => b.brandStatus !== "inactive").map(b => evaluateBrand(row, b)).sort((a, b) => order[b.band] - order[a.band] || Number(a.financial === "constraint") - Number(b.financial === "constraint") || a.concerns.filter(f => f.state === "constraint").length - b.concerns.filter(f => f.state === "constraint").length || b.strengths.length - a.strengths.length || a.unknowns.length - b.unknowns.length || a.name.localeCompare(b.name) || a.brandId.localeCompare(b.brandId));
}

export function compareBrands(results: BrandReferralResult[], selected: string[]) {
  return [...new Set(selected)].slice(0, 3).map(id => results.find(r => r.brandId === id)).filter(r => r !== undefined);
}

export function explainComparison(lead: BrandReferralResult, alternative: BrandReferralResult) {
  const leadAdvantages = lead.strengths.filter(f => alternative.factors.find(other => other.label === f.label)?.state !== "aligned").map(f => f.label);
  const alternativeAdvantages = alternative.strengths.filter(f => lead.factors.find(other => other.label === f.label)?.state !== "aligned").map(f => f.label);
  const conflicts = (result: BrandReferralResult) => result.factors.filter(f => f.state === "constraint").length;
  const reason = lead.band !== alternative.band ? `${lead.band} versus ${alternative.band}`
    : lead.financial !== "constraint" && alternative.financial === "constraint" ? "the alternative has a stated financial conflict"
    : conflicts(lead) !== conflicts(alternative) ? `${conflicts(lead)} versus ${conflicts(alternative)} potential conflicts`
    : lead.strengths.length !== alternative.strengths.length ? `${lead.strengths.length} versus ${alternative.strengths.length} supported factors`
    : lead.unknowns.length !== alternative.unknowns.length ? `${lead.unknowns.length} versus ${alternative.unknowns.length} unknown factors`
    : "the fit band and ranking factors are tied; alphabetical order is only a stable presentation order";
  return { summary: `${lead.name} appears before ${alternative.name}: ${reason}.`, leadAdvantages, alternativeAdvantages };
}
