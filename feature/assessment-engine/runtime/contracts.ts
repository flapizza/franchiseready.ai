import type {
  AssessmentSession,
  AssessmentVersion,
  Response,
} from "../types/domain";

/**
 * Lifecycle of an assessment runtime.
 */
export enum RuntimeLifecycle {
  Created = "created",
  Ready = "ready",
  InProgress = "in-progress",
  Completed = "completed",
  Finalized = "finalized",
}

export interface RuntimeProgress {
  answeredQuestions: number;
  totalQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
}

export interface RuntimeOptions {
  autoAdvance?: boolean;
  validateOnEntry?: boolean;
}

export interface RuntimeLocation {
  sectionId: string;
  questionId: string;
  sectionIndex: number;
  questionIndex: number;
}

/**
 * Serializable runtime snapshot.
 */
export interface RuntimeSnapshot {
  lifecycle: RuntimeLifecycle;
  assessment: AssessmentVersion;
  session: AssessmentSession;
  location: RuntimeLocation;
  responses: readonly Response[];
  progress: RuntimeProgress;
}

export interface RuntimeFinalizeResult {
  session: AssessmentSession;
  completedAt: Date;
}