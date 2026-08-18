export type CandidateWorkspaceKind = "discovery" | "strategy" | "referral";
export type CandidateWorkspaceView = "active" | "completed" | "all";

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
  candidateHref: string;
}

export interface CandidateWorkspaceQueueState {
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
  candidates: CandidateWorkspaceQueueItem[];
  activeView: CandidateWorkspaceView;
}
