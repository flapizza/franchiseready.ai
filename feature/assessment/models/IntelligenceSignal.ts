import type { AssessmentSignal } from "../scoring/AssessmentSignal";

export interface IntelligenceSignal {
  signal: AssessmentSignal;

  value: number;

  evidence: string;

  sourceQuestionId: string;
}