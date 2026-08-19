import type { CandidateIntelligenceProfile } from "@/feature/intelligence/models/CandidateIntelligenceProfile";

export type PipelineStage =
  | "lead"
  | "assessment-started"
  | "assessment-completed"
  | "discovery"
  | "education"
  | "brand-matching"
  | "validation"
  | "referral"
  | "fdd-delivered"
  | "funding"
  | "meet-the-team"
  | "awarded"
  | "training"
  | "opened"
  | "closed-lost";

/** Stable FranGroove reasoning vocabulary. Consultant labels never replace it. */
export type CanonicalLifecycleStage =
  | "lead" | "qualification" | "assessment" | "discovery" | "brand-strategy"
  | "validation" | "referral" | "franchisor-process" | "decision" | "awarded"
  | "closed" | "other";

export type CandidateStatus =
  | "active"
  | "on-hold"
  | "inactive"
  | "won"
  | "lost";

export interface CandidateRecord {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  city: string;
  state: string;
  country: string;

  consultantId: string;

  status: CandidateStatus;

  pipelineStage: PipelineStage;

  /** Stable identity in the consultant's configured pipeline. Falls back to the
   * recommended mapping for older persisted records. */
  pipelineStageId?: string;

  healthScore: number;

  createdAt: string;
  updatedAt: string;

  lastActivityAt: string;

  assessmentIds: string[];

  /** Null until a completed assessment produces Candidate Intelligence. */
  intelligence: CandidateIntelligenceProfile | null;

  preferredTerritory?: string;
  leadSource?: string;
  notes?: string;
}
