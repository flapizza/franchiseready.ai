import type { AssessmentQuestion } from "@/feature/assessment-engine/questions/contracts";
import type { ScoringAlgorithmReference } from "@/feature/assessment-engine/scoring/contracts";

export type AssessmentDefinitionStatus = "draft" | "active" | "archived";
export type AssessmentVersionStatus = "draft" | "published" | "retired";
export type AssessmentSessionStatus = "not-started" | "in-progress" | "completed" | "abandoned";
export type RecommendationCategory = "informational" | "cautionary" | "priority";

export type AssessmentDefinition = {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: AssessmentDefinitionStatus;
  currentVersionId?: string;
};

export type AssessmentVersion = {
  id: string;
  assessmentDefinitionId: string;
  version: string;
  name: string;
  description?: string;
  status: AssessmentVersionStatus;
  sections: AssessmentSection[];
  questions: AssessmentQuestion[];
  dimensions: ReadinessDimension[];
  scoringAlgorithm: ScoringAlgorithmReference;
  publishedAt?: string;
};

export type AssessmentSection = {
  id: string;
  assessmentVersionId: string;
  key: string;
  title: string;
  description?: string;
  order: number;
  questionIds: string[];
};

export type AssessmentSession = {
  id: string;
  assessmentVersionId: string;
  participantId: string;
  status: AssessmentSessionStatus;
  responses: Response[];
  startedAt?: string;
  completedAt?: string;
};

export type Response = {
  id: string;
  assessmentSessionId: string;
  assessmentQuestionId: string;
  value: ResponseValue;
  answeredAt: string;
};

export type ResponseValue =
  | { type: "single-choice"; optionId: string }
  | { type: "multiple-choice"; optionIds: string[] }
  | { type: "numeric"; value: number }
  | { type: "text"; value: string };

export type ReadinessDimension = {
  id: string;
  key: string;
  name: string;
  description?: string;
};

export type DimensionScore = {
  dimensionId: string;
  score: number;
  maxScore: number;
  normalizedScore: number;
  confidence?: number;
};

export type OverallScore = {
  score: number;
  maxScore: number;
  normalizedScore: number;
  confidence?: number;
};

export type RecommendationTopic =
  | "brand"
  | "financial"
  | "behavioral"
  | "timing"
  | "general";

export type Recommendation = {
  id: string;

  category: RecommendationCategory;

  topic: RecommendationTopic;

  title: string;

  summary: string;

  dimensionId?: string;

  priority?: number;
};