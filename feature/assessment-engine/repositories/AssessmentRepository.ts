import { readinessAssessment } from "../data/readinessAssessment";
import type { AssessmentVersion } from "../types/domain";

export interface AssessmentRepository {
  getAssessmentById(
    id: string,
  ): Promise<AssessmentVersion | null>;
}

export class SeedAssessmentRepository
  implements AssessmentRepository
{
  async getAssessmentById(
    id: string,
  ): Promise<AssessmentVersion | null> {
    if (id === readinessAssessment.id) {
      return readinessAssessment;
    }

    return null;
  }
}