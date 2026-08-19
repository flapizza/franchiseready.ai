export type MissionControlPriority =
  | "critical"
  | "high"
  | "normal";

export interface MissionControlAction {
  label: string;
  href?: string;
}

export interface MissionControlKpi {
  id: string;
  label: string;
  value: number;
}

export interface DailyBriefPriority {
  candidateId: string;
  candidateName: string;
  priority: MissionControlPriority;
  recommendedAction: string;
}

export interface DailyBriefState {
  summary: string;
  priorities: DailyBriefPriority[];
  kpis: MissionControlKpi[];
}

export interface PriorityCandidateState {
  candidateId: string;
  candidateName: string;
  reason: string;
  priority: MissionControlPriority;
  recommendedAction: string;
  openCandidateHref: string;
}

export interface AgendaMeetingState {
  id: string;
  candidateId: string;
  candidateName: string;
  time: string;
  objective: string;
  status: string;
  briefingHref: string;
}

export interface TopOpportunityState {
  candidateId: string;
  candidateName: string;
  rationale: string;
  confidence: number;
  readiness: number;
  momentum: string;
  bestBrand: string;
  estimatedTimeline: string;
  primaryAction: MissionControlAction;
  secondaryActions: MissionControlAction[];
}

export interface RecommendedActionState {
  id: string;
  candidateId: string;
  candidateName: string;
  signal: string;
  recommendation: string;
  action: MissionControlAction;
  tone: "emerald" | "amber" | "blue";
}

export interface IntroductionReadyState {
  candidateId: string;
  candidateName: string;
  brandName: string;
  confidence: number;
  action: MissionControlAction;
}

export type IntelligenceEventType =
  | "assessment-completed"
  | "momentum-change"
  | "brand-readiness"
  | "discovery-milestone"
  | "risk-signal"
  | "referral-ready"
  | "email-engagement";

export interface IntelligenceEventState {
  id: string;
  type: IntelligenceEventType;
  label: string;
  candidateId: string;
  candidateName: string;
  explanation: string;
  dateLabel: string;
}

export interface MissionControlState {
  consultantName: string;
  dailyBrief: DailyBriefState;
  topOpportunity: TopOpportunityState;
  priorityCandidates: PriorityCandidateState[];
  agenda: AgendaMeetingState[];
  recommendedActions: RecommendedActionState[];
  introductionReady: IntroductionReadyState[];
  intelligenceFeed: IntelligenceEventState[];
  taskFocus: import("@/feature/tasks/models/TaskWorkspaceState").TaskView[];
  taskCounts: { overdue: number; today: number };
  followUpRecommendations: import("@/feature/tasks/models/ConsultantTask").FollowUpRecommendation[];
}
