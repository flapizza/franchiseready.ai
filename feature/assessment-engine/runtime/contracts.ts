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

/**
 * Overall progress information.
 */
export interface RuntimeProgress {
  answeredQuestions: number;
  totalQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
}

/**
 * Runtime configuration.
 */
export interface RuntimeOptions {
  autoAdvance?: boolean;
  validateOnEntry?: boolean;
}

/**
 * Current navigation position.
 */
export interface RuntimeLocation {
  sectionId: string;
  questionId: string;
  sectionIndex: number;
  questionIndex: number;
}

/**
 * Snapshot of the current runtime.
 */
export interface RuntimeSnapshot {
  lifecycle: RuntimeLifecycle;
  assessment: AssessmentVersion;
  session: AssessmentSession;
  location: RuntimeLocation;
  responses: Map<string, Response>;
  progress: RuntimeProgress;
}

/**
 * Result returned when an assessment is finalized.
 */
export interface RuntimeFinalizeResult {
  session: AssessmentSession;
  completedAt: Date;
}
