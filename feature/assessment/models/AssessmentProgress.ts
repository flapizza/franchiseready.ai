import type { AssessmentDomain } from "./AssessmentDomain";

export interface AssessmentProgress {
  currentDomain: AssessmentDomain;

  completedDomains: AssessmentDomain[];

  percentComplete: number;

  startedAt: string;

  lastSavedAt: string;
}