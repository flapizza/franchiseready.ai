import type { AssessmentDomain } from "./AssessmentDomain";

export type AssessmentQuestionType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "number"
  | "currency"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "date";

export interface AssessmentOption {
  value: string;
  label: string;
}

export interface AssessmentQuestion {
  id: string;

  domain: AssessmentDomain;

  type: AssessmentQuestionType;

  label: string;

  description?: string;

  placeholder?: string;

  required: boolean;

  options?: AssessmentOption[];

  intelligenceTags: string[];

  nextQuestionId?: string;
}