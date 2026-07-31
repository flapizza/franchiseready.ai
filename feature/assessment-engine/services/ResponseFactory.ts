import type {
  AssessmentSession,
  Response,
  ResponseValue,
} from "../types/domain";

import type { AssessmentQuestion } from "../questions/contracts";

export class ResponseFactory {
  public static create(
    session: AssessmentSession,
    question: AssessmentQuestion,
    value: ResponseValue,
  ): Response {
    return {
      id: crypto.randomUUID(),
      assessmentSessionId: session.id,
      assessmentQuestionId: question.id,
      answeredAt: new Date().toISOString(),
      value,
    };
  }
}