export type DecisionPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface NextBestAction {
  title: string;

  description: string;

  priority: DecisionPriority;

  estimatedMinutes: number;
}