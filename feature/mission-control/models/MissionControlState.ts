export interface PriorityItem {
  id: string;

  title: string;

  description: string;

  priority:
    | "critical"
    | "high"
    | "normal";

  action: string;
}

export interface TodayMeeting {
  id: string;

  candidate: string;

  time: string;

  focus: string;
}

export interface MissionControlState {
  greeting: string;

  consultant: string;

  activeCandidates: number;

  discoveryToday: TodayMeeting[];

  priorities: PriorityItem[];
}