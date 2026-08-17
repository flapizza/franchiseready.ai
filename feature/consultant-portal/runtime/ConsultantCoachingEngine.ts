import type { ConsultantCoaching } from "../models/ConsultantCoaching";

export type CoachingContext = {
  detectedRisks: string[];
};

export class ConsultantCoachingEngine {
  public evaluate(
    context: CoachingContext,
  ): ConsultantCoaching {
    const hasFamilyRisk =
      context.detectedRisks.some((risk) =>
        risk.toLowerCase().includes("family"),
      );

    if (hasFamilyRisk) {
      return {
        opportunity:
          "Family alignment has not been confirmed.",

        recommendation:
          "Explore how the candidate's spouse or family feels about business ownership before recommending specific brands.",

        expectedOutcome:
          "Reduced risk during validation and stronger brand commitment.",

        priority: "high",
      };
    }

    return {
      opportunity:
        "Candidate is progressing well.",

      recommendation:
        "Continue validating motivations and preferred business characteristics.",

      expectedOutcome:
        "More accurate brand recommendations.",

      priority: "medium",
    };
  }
}
