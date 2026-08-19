import type { CandidateStatus, CanonicalLifecycleStage, PipelineStage } from "./CandidateRecord";

export type CandidateAttention = "needs-attention" | "on-track" | "referral-ready";

export interface CandidateCRMItem {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  location: string;
  status: CandidateStatus;
  pipelineStageId: string;
  pipelineStage: string;
  lifecycleStage: PipelineStage;
  canonicalLifecycleStage: CanonicalLifecycleStage;
  stageLabel: string;
  readiness: number | null;
  readinessLabel: string;
  bestBrand: string | null;
  lastActivityLabel: string;
  nextAction: string;
  attention: CandidateAttention;
  attentionLabel: string;
  momentum: "accelerating" | "steady" | "slowing";
  referralReady: boolean;
  href: string;
  actionLabel: string;
  actionHref: string;
  momentumLabel: string;
  actionKind: "navigate" | "lifecycle";
  openTaskCount: number;
}

export interface CandidateCRMStage {
  stageId: string;
  stage: string;
  label: string;
  sequence: number;
  canonicalLifecycleStage: CanonicalLifecycleStage;
  classification: "active" | "won" | "lost" | "archived";
  colorToken?: string;
}

export interface CandidateCRMState {
  candidates: CandidateCRMItem[];
  stages: CandidateCRMStage[];
}
