import { z } from "zod";
import type { BrandFact, BrandIntelligenceProfile } from "../models/BrandIntelligenceProfile.ts";

type FactPaths<T> = { [K in keyof T & string]: T[K] extends BrandFact<unknown> ? K
  : T[K] extends readonly unknown[] ? never : T[K] extends object ? `${K}.${FactPaths<T[K]>}` : never }[keyof T & string];
export type CanonicalFactPath = FactPaths<Omit<BrandIntelligenceProfile, "consultantIntelligence">>;
type Definition = { schema: z.ZodType; valueKind: string; allowedValues: string[] | null; completenessLabel?: string };
type FactValue<T, P extends string> = P extends `${infer Group}.${infer Rest}`
  ? Group extends keyof T ? FactValue<T[Group], Rest> : never
  : P extends keyof T ? T[P] extends BrandFact<infer Value> ? Value : never : never;
type DomainDefinitions = { [P in CanonicalFactPath]: Omit<Definition, "schema"> & { schema: z.ZodType<FactValue<BrandIntelligenceProfile, P>> } };
const text = z.string().refine(v => v.trim().length > 0);
const number = z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER);
const def = <S extends z.ZodType>(schema: S, valueKind: string, completenessLabel?: string, allowedValues: string[] | null = null) => ({ schema, valueKind, allowedValues, completenessLabel });
const str = (label?: string) => def(text, "text", label);
const num = (label: string) => def(number, "number", label);
const enumeration = <const V extends [string, ...string[]]>(values: V, label?: string) => def(z.enum(values), "enum", label, values);
const level = (label?: string) => enumeration(["low", "moderate", "high", "very-high"], label);
const suitability = (label: string) => enumeration(["not-suited", "possible", "well-suited", "unknown"], label);
const locations = ["home-based", "office", "retail", "mobile", "flexible", "unknown"] as const;

/** One application registry: validation, field assignment, and completeness use it.
 * Runtime DB-definition comparison and tests bind it to Checkpoint 1 SQL. */
export const brandFactRegistry = {
  category: str("Category"), industry: str("Industry"), description: str("Description"), website: str("Website"), franchisor: str("Franchisor"),
  "economics.franchiseFee": num("Franchise fee"),
  "economics.initialInvestment": def(z.strictObject({ minimum: number.nullable(), maximum: number.nullable(), currency: z.literal("USD") })
    .refine(v => v.minimum === null || v.maximum === null || v.minimum <= v.maximum), "money-range", "Initial investment"),
  "economics.minimumLiquidCapital": num("Minimum liquid capital"), "economics.minimumNetWorth": num("Minimum net worth"),
  "economics.royalty": str("Royalty"), "economics.marketingFund": str("Marketing fund"),
  "economics.otherRecurringFees": def(z.array(z.strictObject({ name: text, amount: text })), "fees"),
  "characteristics.customerModel": enumeration(["B2B", "B2C", "mixed"], "Customer model"),
  "characteristics.businessType": enumeration(["service", "retail", "food", "professional", "other"], "Business type"),
  "characteristics.operatingLocations": def(z.array(z.enum(locations)), "enum-list", "Operating locations", [...locations]),
  "characteristics.ownerOperatorSuitability": suitability("Owner-operator suitability"),
  "characteristics.semiAbsenteeSuitability": suitability("Semi-absentee suitability"),
  "characteristics.executiveSuitability": suitability("Executive suitability"),
  "characteristics.staffingIntensity": level("Staffing intensity"), "characteristics.salesIntensity": level("Sales intensity"),
  "characteristics.operationalComplexity": level("Operational complexity"), "characteristics.customerAcquisitionModel": str("Customer acquisition"),
  "characteristics.recurringRevenue": def(z.boolean(), "boolean", "Recurring revenue"),
  "characteristics.locationDependence": level("Location dependence"), "characteristics.territoryModel": str("Territory model"),
  "fit.leadership": level(), "fit.salesComfort": level(), "fit.networkingBusinessDevelopment": level(), "fit.operationalManagement": level(),
  "fit.peopleManagement": level(), "fit.analyticalAptitude": level(), "fit.relationshipBuilding": level(), "fit.communityOrientation": level(),
  "fit.desiredLifestyle": str(), "fit.timeCommitment": str(), "fit.financialSuitability": str(), "fit.priorIndustryExperience": str(),
  "support.initialTraining": str("Initial training"), "support.ongoingSupport": str("Ongoing support"),
  "support.marketingSupport": str("Marketing support"), "support.salesSupport": str("Sales support"),
  "support.technologySupport": str("Technology support"), "support.fieldSupport": str("Field support"),
  "system.approximateSize": str("System size"), "system.unitMix": str("Unit mix"), "system.geography": str("Geography"), "system.maturity": str("Maturity"),
  differentiators: def(z.array(text), "text-list"), considerations: def(z.array(text), "text-list"), discoveryQuestions: def(z.array(text), "text-list"),
} satisfies DomainDefinitions;
export const brandFactPaths = Object.keys(brandFactRegistry) as CanonicalFactPath[];

export class BrandIntelligenceDataError extends Error {
  constructor(detail: string) { super(`Invalid persisted Brand Intelligence: ${detail}`); this.name = "BrandIntelligenceDataError"; }
}
export function factDefinition(key: string): Definition {
  if (!Object.hasOwn(brandFactRegistry, key)) throw new BrandIntelligenceDataError(`unrecognized fact key ${key}`);
  return brandFactRegistry[key as CanonicalFactPath];
}
export function validateFactRegistry(rows: { fact_key: string; value_kind: string; allowed_values: string[] | null }[]): void {
  const keys = new Set<string>();
  for (const row of rows) {
    const definition = factDefinition(row.fact_key);
    if (keys.has(row.fact_key)) throw new BrandIntelligenceDataError("duplicate fact definition");
    keys.add(row.fact_key);
    if (row.value_kind !== definition.valueKind || JSON.stringify(row.allowed_values) !== JSON.stringify(definition.allowedValues))
      throw new BrandIntelligenceDataError(`definition mismatch for ${row.fact_key}`);
  }
  if (keys.size !== brandFactPaths.length) throw new BrandIntelligenceDataError("incomplete fact registry");
}
