export interface AssessmentResponse {
  questionId: string;

  value: string | number | boolean | string[];

  answeredAt: string;
}