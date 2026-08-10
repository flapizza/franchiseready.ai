import type { AssessmentResponse } from "../models/AssessmentResponse";
import type { IntelligenceSignal } from "../models/IntelligenceSignal";

export class AssessmentScoringEngine {
  public evaluate(
    responses: AssessmentResponse[],
  ): IntelligenceSignal[] {
    const signals: IntelligenceSignal[] = [];

    for (const response of responses) {
      switch (response.questionId) {
        case "occupation":
          signals.push({
            signal: "career",
            value: 100,
            evidence: String(response.value),
            sourceQuestionId: response.questionId,
          });
          break;

        case "city":
          signals.push({
            signal: "identity",
            value: 100,
            evidence: String(response.value),
            sourceQuestionId: response.questionId,
          });
          break;

        default:
          break;
      }
    }

    return signals;
  }
}