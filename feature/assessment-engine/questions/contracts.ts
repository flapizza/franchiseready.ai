export type QuestionResponseType = "single-choice" | "multiple-choice" | "numeric" | "text";

export type QuestionOption = {
  id: string;
  label: string;
  value: string;
  weightByDimension?: Record<string, number>;
};

export type QuestionConditionOperator = "equals" | "not-equals" | "contains" | "greater-than" | "less-than";

export type QuestionCondition = {
  questionId: string;
  operator: QuestionConditionOperator;
  value: string | number | string[];
};

export type AssessmentQuestionBase = {
  id: string;
  assessmentVersionId: string;
  key: string;
  prompt: string;
  description?: string;
  required: boolean;
  order: number;
  conditions?: QuestionCondition[];
};

export type SingleChoiceQuestion = AssessmentQuestionBase & {
  type: "single-choice";
  options: QuestionOption[];
};

export type MultipleChoiceQuestion = AssessmentQuestionBase & {
  type: "multiple-choice";
  options: QuestionOption[];
  minSelections?: number;
  maxSelections?: number;
};

export type NumericQuestion = AssessmentQuestionBase & {
  type: "numeric";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export type TextQuestion = AssessmentQuestionBase & {
  type: "text";
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
};

export type AIGeneratedQuestion = AssessmentQuestionBase & {
  type: "ai-generated";
  responseType: QuestionResponseType;
  generator?: string;
  sourceQuestionId?: string;
  options?: QuestionOption[];
};

export type AssessmentQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | NumericQuestion
  | TextQuestion
  | AIGeneratedQuestion;
