export type WorkflowActionType =
  | "create-task"
  | "create-activity"
  | "update-health-score"
  | "recommend-next-action";

export interface WorkflowAction {
  type: WorkflowActionType;

  title: string;

  description: string;

  payload?: Record<string, unknown>;
}