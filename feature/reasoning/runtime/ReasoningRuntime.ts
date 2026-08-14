import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type { EvidenceGraph } from
  "@/feature/evidence/models/EvidenceGraph";

import type { Reasoning } from
  "../models/Reasoning";

import { ReasoningService } from
  "../services/ReasoningService";

export class ReasoningRuntime {
  private readonly service =
    new ReasoningService();

  public evaluate(
    intelligence: CandidateIntelligence,
    evidence: EvidenceGraph,
  ): Reasoning {
    return this.service.evaluate(
      intelligence,
      evidence,
    );
  }
}