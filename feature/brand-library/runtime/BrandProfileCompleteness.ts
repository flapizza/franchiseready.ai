import type { BrandFact, BrandProfileCompleteness } from "../models/BrandIntelligenceProfile.ts";

export interface CompletenessField { label: string; fact: BrandFact<unknown> }

export function calculateBrandProfileCompleteness(fields: readonly CompletenessField[]): BrandProfileCompleteness {
  const known = fields.filter(({ fact }) => fact.value !== null);
  const knownRatio = fields.length === 0 ? 0 : known.length / fields.length;
  const status = known.length === 0 ? "unknown-not-reviewed"
    : knownRatio < 1 / 3 ? "minimal"
      : knownRatio < 2 / 3 ? "partially-populated"
        : "sufficiently-populated";
  return {
    status,
    knownFields: known.length,
    totalFields: fields.length,
    evidencedFields: known.filter(({ fact }) => fact.evidence.length > 0).length,
    verifiedFields: known.filter(({ fact }) => fact.verification === "verified").length,
    missingFields: fields.filter(({ fact }) => fact.value === null).map(({ label }) => label),
  };
}
