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
    const firstSection = this.assessment.sections[0];

    if (!firstSection) {
      throw new Error("Assessment contains no sections.");
    }

    const firstQuestionId = firstSection.questionIds[0];

    if (!firstQuestionId) {
      throw new Error("First section contains no questions.");
    }

    this.location = {
      sectionId: firstSection.id,
      questionId: firstQuestionId,
      sectionIndex: 0,
      questionIndex: 0,
    };

    this.lifecycle = RuntimeLifecycle.Ready;

    this.updateProgress();
  }

  public currentQuestion() {
    return this.getQuestionById(this.location.questionId);
  }

  public start(): void {
    this.lifecycle = RuntimeLifecycle.InProgress;
  }

  public complete(): void {
    this.lifecycle = RuntimeLifecycle.Completed;
  }

  public recordResponse(response: Response): void {
    this.responses.set(response.assessmentQuestionId, response);

    this.updateProgress();
  }

  private updateProgress(): void {
    const answeredQuestions = this.responses.size;
    const totalQuestions = this.assessment.questions.length;

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

  private getQuestionById(questionId: string) {
    return this.assessment.questions.find(
      (question) => question.id === questionId,
    );
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