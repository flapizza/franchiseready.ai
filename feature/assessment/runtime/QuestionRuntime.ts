import type { AssessmentDomain } from "../models/AssessmentDomain";
import type { AssessmentQuestion } from "../models/AssessmentQuestion";

import { personalProfileQuestions } from "../questions/personalProfileQuestions";

export class QuestionRuntime {
  public getQuestions(
    domain: AssessmentDomain,
  ): AssessmentQuestion[] {
    switch (domain) {
      case "personal-profile":
        return personalProfileQuestions;

      default:
        return [];
    }
  }

  public getQuestion(
    domain: AssessmentDomain,
    id: string,
  ): AssessmentQuestion | undefined {
    return this
      .getQuestions(domain)
      .find((question) => question.id === id);
  }
}