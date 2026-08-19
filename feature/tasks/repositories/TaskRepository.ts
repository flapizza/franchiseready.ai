import type { ConsultantTask } from "../models/ConsultantTask";

export interface TaskRepository {
  getAll(consultantId: string): Promise<ConsultantTask[]>;
  getById(taskId: string): Promise<ConsultantTask | null>;
  save(task: ConsultantTask): Promise<void>;
  isRecommendationDismissed(recommendationId: string): Promise<boolean>;
  dismissRecommendation(recommendationId: string): Promise<void>;
}
