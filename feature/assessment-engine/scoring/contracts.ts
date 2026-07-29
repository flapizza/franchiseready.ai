import type {
  AssessmentSession,
  AssessmentVersion,
  DimensionScore,
  OverallScore,
  Recommendation,
  Response,
} from "@/feature/assessment-engine/types/domain";

export type ScoringAlgorithmReference = {
  key: string;
  version: string;
};

export type ScoringInput = {
  assessmentVersion: AssessmentVersion;
  assessmentSession: AssessmentSession;
  responses: Response[];
};

export type ScoringResult = {
  dimensionScores: DimensionScore[];
  overallScore: OverallScore;
  recommendations?: Recommendation[];
};

export interface ScoringAlgorithm {
  readonly key: string;
  readonly version: string;
  score(input: ScoringInput): Promise<ScoringResult>;
}
