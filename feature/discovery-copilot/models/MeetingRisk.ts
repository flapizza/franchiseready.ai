export type MeetingRiskSeverity =
  | "low"
  | "medium"
  | "high";

export interface MeetingRisk {
  id: string;

  title: string;

  explanation: string;

  severity: MeetingRiskSeverity;

  confidence: number;
}