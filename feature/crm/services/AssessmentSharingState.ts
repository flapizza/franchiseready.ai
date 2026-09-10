import type { ProductionAssessmentSession } from "@/feature/assessment-engine/production/types";

export type AssessmentSharingSession = Pick<ProductionAssessmentSession, "id" | "status" | "expiresAt" | "revokedAt">;

export function assessmentSharingState(session?: AssessmentSharingSession | null, now = Date.now()) {
  if (!session) return { label: "Not started", detail: "Create a secure invitation when the candidate is ready.", canGenerate: true, replace: false };
  if (session.status === "analyzed") return { label: "Completed", detail: "Candidate Intelligence and assessment documents are available. Assessment retakes are not available here.", canGenerate: false, replace: false };
  if (session.status === "submitted") return { label: "Submitted", detail: "Return to this candidate to check for completed results.", canGenerate: false, replace: false };
  if (session.revokedAt || session.status === "cancelled" || session.status === "expired" || Date.parse(session.expiresAt) <= now) {
    return { label: "Expired or replaced", detail: "The previous link is no longer usable. Create a replacement invitation to continue.", canGenerate: true, replace: true };
  }
  return { label: session.status === "in-progress" ? "In progress" : "Invitation active", detail: session.status === "in-progress" ? "The candidate has securely saved progress. Their existing link resumes this assessment." : "A secure invitation exists. Share the link you copied when it was created.", canGenerate: true, replace: true };
}
