export interface NextBestAction {
  id: string;

  title: string;

  description: string;

  priority: "low" | "medium" | "high";

  confidence: number;

  estimatedImpact: number;

  dueInDays?: number;
}