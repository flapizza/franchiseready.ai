import type { AssessmentResponse } from "../models/AssessmentResponse";

export class AssessmentResponseRuntime {
  private readonly responses =
    new Map<string, AssessmentResponse>();

  public answer(
    questionId: string,
    value: AssessmentResponse["value"],
  ) {
    this.responses.set(questionId, {
      questionId,
      value,
      answeredAt: new Date().toISOString(),
    });
  }

  public get(
    questionId: string,
  ) {
    return this.responses.get(questionId);
  }

  public getAll() {
    return [...this.responses.values()];
  }

  public clear() {
    this.responses.clear();
  }
}