import type { CandidateDNA } from "../models/CandidateDNA";
import type { CandidateIntelligence } from "../models/CandidateIntelligence";

export class CandidateDNAEngine {
  public build(
    candidateId: string,
    intelligence: CandidateIntelligence,
  ): CandidateDNA {
    return {
      id: crypto.randomUUID(),

      candidateId,

      intelligence,

      overallCompatibilityScore:
        this.calculateCompatibilityScore(intelligence),

      generatedAt: new Date(),
    };
  }

  private calculateCompatibilityScore(
    intelligence: CandidateIntelligence,
  ): number {
    const values = [
      intelligence.overallReadiness,

      intelligence.behavioral.coachability,

      intelligence.financial.financingLikelihood,

      intelligence.leadership.accountability,

      intelligence.operations.execution,

      intelligence.sales.relationshipBuilding,

      intelligence.timing.buyingConfidence,
    ];

    const total = values.reduce(
      (sum, value) => sum + value,
      0,
    );

    return Math.round(total / values.length);
  }
}