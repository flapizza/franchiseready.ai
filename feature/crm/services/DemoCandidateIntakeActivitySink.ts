import "server-only";

import type { CandidateRecord } from "../models/CandidateRecord";
import { demoCandidateOverlayStore } from "../repositories/DemoCandidateOverlayStore";
import type { CandidateIntakeActivitySink } from "./CandidateIntakeService";

export class DemoCandidateIntakeActivitySink implements CandidateIntakeActivitySink {
  async candidateCreated(candidate: CandidateRecord): Promise<void> {
    demoCandidateOverlayStore.addActivity({ id: crypto.randomUUID(), candidateId: candidate.id, consultantId: candidate.consultantId, type: "candidate-created", title: "Candidate created", createdAt: candidate.createdAt });
  }
}
