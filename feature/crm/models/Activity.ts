export type ActivityType =
  | "candidate-created"
  | "assessment-started"
  | "assessment-completed"
  | "discovery-completed"
  | "brand-presented"
  | "validation-completed"
  | "fdd-delivered"
  | "funding-updated"
  | "meet-the-team"
  | "award"
  | "note-added"
  | "task-completed"
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
}