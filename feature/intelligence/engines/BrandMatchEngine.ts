import type { BrandDNA } from "../models/BrandDNA";
import type { CandidateDNA } from "../models/CandidateDNA";
import type { CompatibilityReport } from "../models/CompatibilityReport";

export class BrandMatchEngine {
  public compare(
    candidate: CandidateDNA,
    brand: BrandDNA,
  ): CompatibilityReport {
    const behavioralScore = this.score(
      candidate.intelligence.behavioral.coachability,
      brand.behavioral.coachability,
    );

    const financialScore = this.score(
      candidate.intelligence.financial.financingLikelihood,
      brand.financial.financingFlexibility,
    );

    const leadershipScore = this.score(
      candidate.intelligence.leadership.accountability,
      brand.leadership.accountability,
    );

    const operationalScore = this.score(
      candidate.intelligence.operations.execution,
      brand.operations.execution,
    );

    const salesScore = this.score(
      candidate.intelligence.sales.relationshipBuilding,
      brand.sales.relationshipBuilding,
    );

    const lifestyleScore = this.score(
      candidate.intelligence.lifestyle.workLifeBalance,
      brand.lifestyle.workLifeBalance,
    );

    const timingScore = this.score(
      candidate.intelligence.timing.buyingConfidence,
      brand.timing.speedToLaunch,
    );

    const overallScore = Math.round(
      (
        behavioralScore +
        financialScore +
        leadershipScore +
        operationalScore +
        salesScore +
        lifestyleScore +
        timingScore
      ) / 7,
    );

    return {
      candidateId: candidate.candidateId,

      brandId: brand.id,

      overallScore,

      behavioralScore,

      financialScore,

      leadershipScore,

      operationalScore,

      salesScore,

      lifestyleScore,

      timingScore,

      strengths: [],

      gaps: [],

      discoveryQuestions: [],

      recommendations: [],
    };
  }

  private score(
    candidate: number,
    brand: number,
  ): number {
    return Math.max(
      0,
      100 - Math.abs(candidate - brand),
    );
  }
}