import type { Response } from "@/feature/assessment-engine/types/domain";
import type { BehavioralIntelligence } from "../models/CandidateIntelligence";

export class BehaviorAnalysisService {
  public analyze(
    responses: Response[],
  ): BehavioralIntelligence {
    return {
      coachability: this.calculateCoachability(responses),

      adaptability: this.calculateAdaptability(responses),

      resilience: this.calculateResilience(responses),

      communication: this.calculateCommunication(responses),

      collaboration: this.calculateCollaboration(responses),

      competitiveness: this.calculateCompetitiveness(responses),
    };
  }

  private calculateCoachability(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  private calculateAdaptability(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  private calculateResilience(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  private calculateCommunication(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  private calculateCollaboration(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  private calculateCompetitiveness(
    responses: Response[],
  ): number {
    return this.average(responses);
  }

  /**
   * Placeholder until the assessment questions
   * are mapped to intelligence dimensions.
   */
  private average(
    responses: Response[],
  ): number {
    const numeric = responses
      .map((response) => {
        switch (response.value.type) {
          case "single-choice":
            return Number(response.value.optionId);

          case "numeric":
            return response.value.value;

          default:
            return undefined;
        }
      })
      .filter(
        (value): value is number =>
          value !== undefined &&
          !Number.isNaN(value),
      );

    if (numeric.length === 0) {
      return 0;
    }

    return Math.round(
      numeric.reduce(
        (sum, value) => sum + value,
        0,
      ) / numeric.length,
    );
  }
}