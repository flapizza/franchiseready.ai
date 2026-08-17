import type { AssessmentResult } from "../scoring/AssessmentResult";

export interface AssessmentParticipantIdentity {
  participantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface AssessmentCompletionCommand {
  assessmentSessionId: string;
  assessmentVersionId: string;
  completedAt: string;
  consultantId: string;
  assessmentInvitationId?: string;
  trustedCandidateId?: string;
  participant: AssessmentParticipantIdentity;
  result: AssessmentResult;
}

export type AssessmentCompletionReceipt =
  | {
      status: "updated-existing-candidate";
      candidateId: string;
      assessmentId: string;
      resolutionMethod:
        | "assessment-invitation"
        | "trusted-candidate-id"
        | "normalized-email"
        | "normalized-phone";
    }
  | {
      status: "created-candidate";
      candidateId: string;
      assessmentId: string;
      resolutionMethod: "no-match";
    }
  | {
      status: "requires-review";
      potentialCandidateIds: string[];
      resolutionMethod: "ambiguous-email" | "ambiguous-phone";
    };

/**
 * Application boundary invoked after assessment scoring. The implementation
 * must call CandidateResolutionService before deciding whether to update an
 * existing candidate or create a new candidate aggregate.
 */
export interface AssessmentCompletionSink {
  recordCompletion(
    command: AssessmentCompletionCommand,
  ): Promise<AssessmentCompletionReceipt>;
}
