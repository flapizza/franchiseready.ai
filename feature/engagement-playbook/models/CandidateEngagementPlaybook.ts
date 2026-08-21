export type EngagementPlaybookStatus = "active" | "completed" | "dismissed";
export type EngagementStepStatus = "recommended" | "accepted" | "completed" | "skipped" | "dismissed";
export type EngagementActionType = "send-email" | "create-task" | "schedule-meeting" | "call-candidate" | "review-candidate" | "continue-discovery" | "present-brands" | "review-brand-strategy" | "prepare-referral" | "wait-monitor";

export interface EngagementEvidence {
  source: "candidate-intelligence" | "email-engagement" | "communications" | "tasks" | "calendar" | "discovery" | "brand-strategy" | "brand-presentation" | "referral" | "pipeline";
  referenceId: string;
  label: string;
  detail: string;
}

export interface CandidateEngagementStep {
  stepId: string;
  order: number;
  title: string;
  description: string;
  actionType: EngagementActionType;
  rationale: string;
  recommendedTiming: string;
  suggestedDueAt?: string;
  status: EngagementStepStatus;
  evidence: EngagementEvidence[];
  actionLabel?: string;
  actionHref?: string;
  relatedTaskId?: string;
  relatedMeetingId?: string;
  relatedMessageId?: string;
  decidedAt?: string;
}

export interface CandidateEngagementPlaybook {
  playbookId: string;
  candidateId: string;
  candidateName: string;
  title: string;
  summary: string;
  generatedAt: string;
  evidenceUpdatedAt: string;
  evidenceFingerprint: string;
  status: EngagementPlaybookStatus;
  currentStepId?: string;
  steps: CandidateEngagementStep[];
  rationale: string[];
  progress: { completed: number; total: number };
}

export interface EngagementStepDecision {
  candidateId: string;
  stepId: string;
  evidenceFingerprint: string;
  status: Exclude<EngagementStepStatus, "recommended">;
  decidedAt: string;
  relatedTaskId?: string;
  relatedMeetingId?: string;
  relatedMessageId?: string;
}
