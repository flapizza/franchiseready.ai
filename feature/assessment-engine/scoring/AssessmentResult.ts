import type {
  DimensionScore,
  OverallScore,
  Recommendation,
} from "../types/domain";

import type { CandidateProfile } from "./CandidateProfile";
import type { FranchiseMatch } from "./FranchiseMatch";

export type AssessmentResult = {
  generatedAt: string;

  overallScore: OverallScore;

  dimensionScores: DimensionScore[];

  candidateProfile: CandidateProfile;

  franchiseMatches: FranchiseMatch[];

  recommendations: Recommendation[];
};