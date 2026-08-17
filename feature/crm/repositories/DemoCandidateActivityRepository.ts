import type { Activity } from "../models/Activity";
import type { CandidateActivityRepository } from "./CandidateActivityRepository";
import { demoCandidateOverlayStore } from "./DemoCandidateOverlayStore";

export class DemoCandidateActivityRepository implements CandidateActivityRepository {
  async getByCandidateId(candidateId: string): Promise<Activity[]> {
    return demoCandidateOverlayStore.getActivities(candidateId);
  }

  async add(activity: Activity): Promise<void> {
    demoCandidateOverlayStore.addActivity(activity);
  }
}
