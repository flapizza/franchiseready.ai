import type { CandidateRepository } from "../repositories/CandidateRepository";
import { DemoCandidateActivityRepository } from "../repositories/DemoCandidateActivityRepository";
import { CandidateLifecycleService } from "./CandidateLifecycleService";

export function createDemoCandidateLifecycleService(candidates: CandidateRepository) {
  return new CandidateLifecycleService(candidates, new DemoCandidateActivityRepository());
}
