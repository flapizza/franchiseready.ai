import type { AssessmentProgress } from "../models/AssessmentProgress";

export class AssessmentProgressRuntime {
  public create(): AssessmentProgress {
    const now = new Date().toISOString();

    return {
      currentDomain: "personal-profile",

      completedDomains: [],

      percentComplete: 0,

      startedAt: now,

      lastSavedAt: now,
    };
  }
}