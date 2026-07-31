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

  public start(): void {
    this.lifecycle = RuntimeLifecycle.InProgress;
  }

  public complete(): void {
    this.lifecycle = RuntimeLifecycle.Completed;
  }

  public currentQuestion() {
    return this.getQuestionById(this.location.questionId);
  }

  public currentAnswer(): Response["value"] | null {
    const response = this.responses.get(this.location.questionId);

    if (!response) {
      return null;
    }

    return response.value;
  }

  public answerCurrentQuestion(value: Response["value"]): void {
    const question = this.currentQuestion();

    if (!question) {
      return;
    }

    const existing = this.responses.get(question.id);

    if (existing) {
      existing.value = value;
      existing.answeredAt = new Date().toISOString();

      this.responses.set(question.id, existing);
    } else {
      const response: Response = {
        id: crypto.randomUUID(),
        assessmentSessionId: this.session.id,
        assessmentQuestionId: question.id,
        value,
        answeredAt: new Date().toISOString(),
      };

      this.responses.set(question.id, response);
    }

    this.updateProgress();
  }

  public canGoNext(): boolean {
    const section =
      this.assessment.sections[this.location.sectionIndex];

    if (!section) {
      return false;
    }

    return (
      this.location.questionIndex <
      section.questionIds.length - 1
    );
  }

  public canGoPrevious(): boolean {
    return this.location.questionIndex > 0;
  }

  public next(): void {
    if (!this.canGoNext()) {
      return;
    }

    const section =
      this.assessment.sections[this.location.sectionIndex];

    if (!section) {
      return;
    }

    const questionIndex =
      this.location.questionIndex + 1;

    this.location = {
      ...this.location,
      questionIndex,
      questionId: section.questionIds[questionIndex],
    };
  }

  public previous(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    const section =
      this.assessment.sections[this.location.sectionIndex];

    if (!section) {
      return;
    }

    const questionIndex =
      this.location.questionIndex - 1;

    this.location = {
      ...this.location,
      questionIndex,
      questionId: section.questionIds[questionIndex],
    };
  }

  private updateProgress(): void {
    const answeredQuestions = this.responses.size;
    const totalQuestions = this.assessment.questions.length;

    const completionPercentage =
      totalQuestions === 0
        ? 0
        : Math.round(
            (answeredQuestions / totalQuestions) * 100,
          );

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
      responses: Array.from(this.responses.values()),
      progress: this.progress,
    };
  }
}