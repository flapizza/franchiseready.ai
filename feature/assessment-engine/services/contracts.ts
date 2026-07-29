import type {
  AssessmentDefinition,
  AssessmentSession,
  AssessmentVersion,
  Recommendation,
} from "@/feature/assessment-engine/types/domain";
import type {
  ScoringAlgorithm,
  ScoringResult,
} from "@/feature/assessment-engine/scoring/contracts";

export interface AssessmentLoader {
  loadDefinition(definitionKey: string): Promise<AssessmentDefinition | null>;
  loadVersion(versionId: string): Promise<AssessmentVersion | null>;
  loadPublishedVersion(definitionKey: string): Promise<AssessmentVersion | null>;
}

export interface AssessmentScoringService {
  score(
    assessmentVersion: AssessmentVersion,
    assessmentSession: AssessmentSession,
    algorithm: ScoringAlgorithm,
  ): Promise<ScoringResult>;
}

export interface RecommendationService {
  generate(
    assessmentVersion: AssessmentVersion,
    scoringResult: ScoringResult,
  ): Promise<Recommendation[]>;
}
