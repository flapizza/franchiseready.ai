import type { CanonicalLifecycleStage, PipelineStage } from "@/feature/crm/models/CandidateRecord";

export type TeamMemberRole = "manager" | "team-leader" | "consultant";

export interface TeamMemberProfile {
  id: string;
  managerId: string | null;
  name: string;
  firstName: string;
  initials: string;
  role: TeamMemberRole;
  roleLabel: string;
  location: string;
}

export interface TeamCandidateAssignment {
  candidateId: string;
  memberId: string;
}

export interface TeamWorkSignal {
  id: string;
  memberId: string;
  candidateId?: string;
  kind: "task" | "meeting" | "referral" | "stage-change";
  title: string;
  detail: string;
  whenLabel: string;
  href: string;
  overdue?: boolean;
  highPriority?: boolean;
}

export interface TeamScopeOption {
  id: string;
  label: string;
  description: string;
  depth: number;
  memberId?: string;
}

export interface TeamMetric {
  id: string;
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "teal" | "amber" | "rose" | "slate";
}

export interface TeamMemberSummary extends TeamMemberProfile {
  candidateCount: number;
  meetingsThisWeek: number;
  overdueTasks: number;
  activeReferrals: number;
  attentionCount: number;
  latestActivity: string;
  pipelineSummary: string;
  selected: boolean;
  scopeHref: string;
}

export interface TeamPipelineCandidate {
  id: string;
  fullName: string;
  initials: string;
  owner: TeamMemberProfile;
  stage: PipelineStage;
  stageLabel: string;
  canonicalStage: CanonicalLifecycleStage;
  readiness: number | null;
  nextAction: string;
  attention: boolean;
  attentionLabel: string;
  lastActivityLabel: string;
  href: string;
}

export interface TeamAttentionItem {
  id: string;
  title: string;
  candidateName: string;
  owner: TeamMemberProfile;
  reason: string;
  actionLabel: string;
  href: string;
  severity: "critical" | "high" | "watch";
}

export interface TeamActivityItem extends TeamWorkSignal {
  owner: TeamMemberProfile;
  candidateName?: string;
}

export interface TeamMissionControlState {
  teamName: string;
  viewer: TeamMemberProfile;
  dateLabel: string;
  health: { label: string; detail: string; attentionCount: number };
  selectedScope: TeamScopeOption;
  scopeOptions: TeamScopeOption[];
  metrics: TeamMetric[];
  members: TeamMemberSummary[];
  pipeline: TeamPipelineCandidate[];
  pipelineStages: Array<{ id: string; label: string; count: number }>;
  attention: TeamAttentionItem[];
  activity: TeamActivityItem[];
  scopedMember?: TeamMemberSummary;
}
