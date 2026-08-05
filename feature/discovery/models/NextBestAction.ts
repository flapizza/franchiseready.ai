export type ActionPriority =
  | "high"
  | "medium"
  | "low";

export interface NextBestAction {
  id: string;

  title: string;

  description: string;

  priority: ActionPriority;

  completed: boolean;
}