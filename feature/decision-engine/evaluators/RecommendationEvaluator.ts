import type { CandidateRecommendation } from "../models/CandidateDecision";

export class RecommendationEvaluator {
  public evaluate(
    readiness: number,
  ): CandidateRecommendation {
    if (readiness >= 90) {
      return "Prepare Referral";
    }

    if (readiness >= 75) {
      return "Present Brand Strategy";
    }

    if (readiness >= 60) {
      return "Continue Discovery";
    }

    return "Schedule Discovery";
  }
}