import type {
  AssessmentSession,
  DimensionScore,
  OverallScore,
} from "../../types/domain";

import type { AssessmentResult } from "../AssessmentResult";

import { CandidateProfileService } from "./CandidateProfileService";
import { FranchiseMatchingService } from "./FranchiseMatchingService";
import { RecommendationService } from "./RecommendationService";

export class AssessmentScoringService {
  private readonly candidateProfileService =
    new CandidateProfileService();

  private readonly franchiseMatchingService =
    new FranchiseMatchingService();

  private readonly recommendationService =
    new RecommendationService();

  public score(
    session: AssessmentSession,
  ): AssessmentResult {
    const candidateProfile =
      this.candidateProfileService.build(session);

    const franchiseMatches =
      this.franchiseMatchingService.match(
        candidateProfile,
      );

    const recommendations =
      this.recommendationService.build(
        franchiseMatches,
      );

    const overallScore: OverallScore = {
      score: 50,
      maxScore: 100,
      normalizedScore: 0.5,
      confidence: 1,
    };

    const dimensionScores: DimensionScore[] = [];

    return {
      generatedAt: new Date().toISOString(),
      overallScore,
      dimensionScores,
      candidateProfile,
      franchiseMatches,
      recommendations,
    };
  }
}