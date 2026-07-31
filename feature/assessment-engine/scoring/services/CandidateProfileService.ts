import type { AssessmentSession } from "../../types/domain";
import type { CandidateProfile } from "../CandidateProfile";

export class CandidateProfileService {
  public build(
    session: AssessmentSession,
  ): CandidateProfile {
    // Temporary implementation.
    // This will be replaced by real scoring logic once
    // the Scoring Engine is connected.

    void session;

    return {
      executiveLeadership: 50,
      consultativeSelling: 50,
      financialCapacity: 50,
      operationalReadiness: 50,
      relationshipBuilding: 50,
      strategicThinking: 50,
      coachability: 50,
      growthOrientation: 50,
      riskAlignment: 50,
      preferredOwnerRole: "executive-owner",
    };
  }
}