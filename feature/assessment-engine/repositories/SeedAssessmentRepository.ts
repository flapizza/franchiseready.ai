import type { AssessmentVersion } from "../types/domain";
import { readinessAssessment } from "../data/readinessAssessment";
import type { AssessmentRepository } from "./AssessmentRepository";

export class SeedAssessmentRepository implements AssessmentRepository {
  async getAssessmentById(
    id: string,
  ): Promise<AssessmentVersion | null> {
    if (id === readinessAssessment.id) {
      return readinessAssessment;
    }

    return null;
  }
}