export interface PriorityCandidate {
  id: string;

  name: string;

  priority: "critical" | "high" | "normal";

  reason: string;

  recommendedAction: string;
}

export interface TodayMeeting {
  id: string;

  candidateName: string;

  time: string;

  aiFocus: string;
}

export interface ConsultantHomeState {
  greeting: string;

  activeCandidates: number;

  priorityCandidates: PriorityCandidate[];

  meetings: TodayMeeting[];

  referralPackagesReady: number;

  weeklyInsight: string;
}