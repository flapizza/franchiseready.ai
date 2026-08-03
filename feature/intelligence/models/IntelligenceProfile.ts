import type { CandidateProfile } from "./CandidateProfile";
import type { CandidateIntelligence } from "./CandidateIntelligence";
import type { CandidateDNA } from "./CandidateDNA";
import type { HealthScore } from "./HealthScore";

export interface IntelligenceProfile {
  profile: CandidateProfile;

  intelligence: CandidateIntelligence;

  dna: CandidateDNA;

  health: HealthScore;
}