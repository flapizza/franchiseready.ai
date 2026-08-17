export type CandidateWorkspaceKind = "discovery" | "strategy" | "referral";

export interface CandidateWorkspaceQueueItem {
  id: string;
  name: string;
  initials: string;
  location: string;
  stageLabel: string;
  readinessLabel: string;
  attentionLabel: string;
  summary: string;
  actionLabel: string;
  href: string;
}

export interface CandidateWorkspaceQueueState {
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
  candidates: CandidateWorkspaceQueueItem[];
}
