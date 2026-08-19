export type ActivityType =
  | "candidate-created"
  | "assessment-started"
  | "assessment-completed"
  | "discovery-started"
  | "discovery-completed"
  | "validation-started"
  | "brand-presented"
  | "brand-strategy-ready"
  | "referral-ready"
  | "referral-generated"
  | "candidate-introduced"
  | "validation-completed"
  | "fdd-delivered"
  | "funding-updated"
  | "meet-the-team"
  | "award"
  | "note-added"
  | "task-created"
  | "task-completed"
  | "task-cancelled"
  | "meeting-scheduled"
  | "meeting-completed"
  | "meeting-cancelled"
  | "meeting-no-show"
  | "email-sent"
  | "status-changed";

export interface Activity {
  id: string;

  candidateId: string;

  consultantId: string;

  type: ActivityType;

  title: string;

  description?: string;

  createdAt: string;

  previousStage?: import("./CandidateRecord").PipelineStage;
  newStage?: import("./CandidateRecord").PipelineStage;
  previousPipelineStageId?: string;
  newPipelineStageId?: string;
  previousPipelineStageName?: string;
  newPipelineStageName?: string;
  previousCanonicalLifecycleStage?: import("./CandidateRecord").CanonicalLifecycleStage;
  newCanonicalLifecycleStage?: import("./CandidateRecord").CanonicalLifecycleStage;

  metadata?: Record<string, string | number | boolean>;
}
