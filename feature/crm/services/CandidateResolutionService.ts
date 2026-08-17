export type CandidateResolutionMethod =
  | "assessment-invitation"
  | "trusted-candidate-id"
  | "normalized-email"
  | "normalized-phone";

export interface CandidateResolutionRequest {
  consultantId: string;
  assessmentInvitationId?: string;
  trustedCandidateId?: string;
  email?: string;
  phone?: string;
}

export type CandidateResolutionResult =
  | {
      status: "matched";
      candidateId: string;
      method: CandidateResolutionMethod;
    }
  | {
      status: "not-found";
    }
  | {
      status: "ambiguous";
      candidateIds: string[];
      method: Extract<
        CandidateResolutionMethod,
        "normalized-email" | "normalized-phone"
      >;
    };

/**
 * Resolves an assessment participant to the candidate aggregate before any
 * create or update operation occurs. Implementations must evaluate identifiers
 * in the documented order and must never resolve from name alone.
 */
export interface CandidateResolutionService {
  resolve(
    request: CandidateResolutionRequest,
  ): Promise<CandidateResolutionResult>;
}
