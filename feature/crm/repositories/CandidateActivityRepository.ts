import type { Activity } from "../models/Activity";

export interface CandidateActivityRepository {
  getByCandidateId(candidateId: string): Promise<Activity[]>;
  add(activity: Activity): Promise<void>;
}
