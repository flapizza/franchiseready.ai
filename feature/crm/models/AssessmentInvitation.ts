export type AssessmentInvitationStatus = "sent" | "completed";

export interface AssessmentInvitation {
  id: string;
  token: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  assessmentId: string;
  assessmentUrl: string;
  status: AssessmentInvitationStatus;
  createdAt: string;
  sentAt: string;
  completedAt?: string;
}
