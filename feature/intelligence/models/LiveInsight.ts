export type InsightCategory =
  | "leadership"
  | "operations"
  | "financial"
  | "behavior"
  | "motivation"
  | "risk";

export type InsightSeverity =
  | "info"
  | "success"
  | "warning";

export interface LiveInsight {
  id: string;

  timestamp: string;

  category: InsightCategory;

  severity: InsightSeverity;

  title: string;

  description: string;

  readinessDelta: number;

  confidenceDelta: number;

  suggestedQuestion?: string;
}