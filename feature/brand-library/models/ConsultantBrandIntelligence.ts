import type { BrandEvidence, BrandFact, BrandProfileCompleteness } from "./BrandIntelligenceProfile.ts";

export type ProfileReadinessState =
  | "core-intelligence-available"
  | "developing-profile"
  | "limited-intelligence"
  | "not-reviewed";

export interface ConsultantInterpretation<T> extends BrandFact<T> {
  derivation: "deterministic" | "editorial";
  sourceFacts: string[];
}

export interface ConsultantSignal {
  label: string;
  explanation: string;
  sourceFacts: string[];
}

export interface ConsultantGlanceItem {
  label: string;
  fact: BrandFact<unknown>;
}

export interface DiligenceGap {
  label: string;
  reason: string;
  state: "unknown" | "unverified" | "stale";
  sourceFact: string;
}

export interface ProfileReadiness {
  state: ProfileReadinessState;
  materialKnownWeight: number;
  materialTotalWeight: number;
  materialVerifiedWeight: number;
  rationale: string;
  rawCompleteness: BrandProfileCompleteness;
}

/**
 * Consultant-facing interpretation of canonical facts. This is deliberately
 * separate from candidate-specific matching and records the factual paths and
 * evidence that support each interpretation.
 */
export interface ConsultantBrandIntelligence {
  businessSummary: ConsultantInterpretation<string>;
  franchiseeRole: ConsultantSignal[];
  strongFit: ConsultantSignal[];
  potentialFriction: ConsultantSignal[];
  businessAtAGlance: ConsultantGlanceItem[];
  diligenceGaps: DiligenceGap[];
  readiness: ProfileReadiness;
  evidence: BrandEvidence[];
  version: { id: string; effectiveAt: string | null; approvedBy: string | null };
}
