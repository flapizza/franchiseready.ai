import type {
  AssessmentSession,
  AssessmentVersion,
  Response,
} from "../types/domain";

import {
  RuntimeLifecycle,
  type RuntimeLocation,
  type RuntimeOptions,
  type RuntimeProgress,
  type RuntimeSnapshot,
} from "./contracts";

export class AssessmentRuntime {
  private readonly assessment: AssessmentVersion;
  private readonly session: AssessmentSession;
  private readonly options: RuntimeOptions;

  private lifecycle = RuntimeLifecycle.Created;

  private readonly responses = new Map<string, Response>();

  private location: RuntimeLocation;

  private progress: RuntimeProgress = {
    answeredQuestions: 0,
    totalQuestions: 0,
    completionPercentage: 0,
    isComplete: false,
  };

  constructor(
    assessment: AssessmentVersion,
    session: AssessmentSession,
    options: RuntimeOptions = {},
  ) {
    this.assessment = assessment;
    this.session = session;
    this.options = options;

    this.location = {
      sectionId: "",
      questionId: "",
      sectionIndex: 0,
      questionIndex: 0,
    };
  }
public initialize(): void {
  this.lifecycle = RuntimeLifecycle.Ready;

  // We'll replace these placeholders once the assessment
  // model is connected to real sections and questions.
  this.location = {
    sectionId: "",
    questionId: "",
    sectionIndex: 0,
    questionIndex: 0,
  };

  this.updateProgress();
}

public start(): void {
  this.lifecycle = RuntimeLifecycle.InProgress;
}

public complete(): void {
  this.lifecycle = RuntimeLifecycle.Completed;
}

private updateProgress(): void {
  const answeredQuestions = this.responses.size;
  const totalQuestions = this.progress.totalQuestions;

  const completionPercentage =
    totalQuestions === 0
      ? 0
      : Math.round((answeredQuestions / totalQuestions) * 100);

  this.progress = {
    answeredQuestions,
    totalQuestions,
    completionPercentage,
    isComplete:
      totalQuestions > 0 &&
      answeredQuestions === totalQuestions,
  };
}
  public snapshot(): RuntimeSnapshot {
    return {
      lifecycle: this.lifecycle,
      assessment: this.assessment,
      session: this.session,
      location: this.location,
      responses: this.responses,
      progress: this.progress,
    };
  }
}