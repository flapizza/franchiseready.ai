import type { CandidateIntelligenceProfile } from "@/feature/intelligence/models/CandidateIntelligenceProfile";

export type PipelineStage =
  | "lead"
  | "assessment-started"
  | "assessment-completed"
  | "discovery"
  | "education"
  | "brand-matching"
  | "validation"
  | "fdd-delivered"
  | "funding"
  | "meet-the-team"
  | "awarded"
  | "training"
  | "opened"
  | "closed-lost";

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

  healthScore: number;

  createdAt: string;
  updatedAt: string;

  lastActivityAt: string;

  intelligence: CandidateIntelligenceProfile;
}