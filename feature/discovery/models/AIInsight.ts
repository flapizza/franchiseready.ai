export type InsightPriority =
  | "high"
  | "medium"
  | "low";

export type InsightCategory =
  | "behavior"
  | "leadership"
  | "financial"
  | "motivation"
  | "risk"
  | "timing"
  | "sales"
  | "operations";

export interface AIInsight {
  id: string;

  category: InsightCategory;

  priority: InsightPriority;

  title: string;

  description: string;

  recommendation: string;

  confidence: number;

  generatedAt: Date;
}