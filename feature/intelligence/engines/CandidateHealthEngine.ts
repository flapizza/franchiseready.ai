import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { HealthScore } from "../models/HealthScore";

export class CandidateHealthEngine {
  public evaluate(
    intelligence: CandidateIntelligence,
  ): HealthScore {
    const readiness = intelligence.overallReadiness;

    const coachability = intelligence.behavioral.coachability;

    const financialStrength =
      intelligence.financial.financingLikelihood;

    const timing =
      intelligence.timing.buyingConfidence;

    const momentum = Math.round(
      (
        readiness +
        coachability +
        financialStrength +
        timing
      ) / 4,
    );

    return {
      score: momentum,

      confidence: 90,

      readiness,

      momentum,

      financialStrength,

      timing,

      coachability,

      riskLevel: this.calculateRiskLevel(
        intelligence,
      ),

      generatedAt: new Date(),
    };
  }

  private calculateRiskLevel(
    intelligence: CandidateIntelligence,
  ): number {
    let risk = 0;

    if (
      intelligence.financial.financingLikelihood <
      70
    ) {
      risk += 25;
    }

    if (
      intelligence.operations.execution <
      70
    ) {
      risk += 20;
    }

    if (
      intelligence.behavioral.coachability <
      70
    ) {
      risk += 15;
    }

    return Math.min(risk, 100);
  }
}