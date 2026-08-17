import type { CandidateStatus, PipelineStage } from "./CandidateRecord";

export type CandidateAttention = "needs-attention" | "on-track" | "referral-ready";

export interface CandidateCRMItem {
  id: string;
  fullName: string;
  initials: string;
  email: string;
  location: string;
  status: CandidateStatus;
  pipelineStage: PipelineStage;
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
}

export interface CandidateCRMStage {
  stage: PipelineStage;
  label: string;
  sequence: number;
}

export interface CandidateCRMState {
  candidates: CandidateCRMItem[];
  stages: CandidateCRMStage[];
}
