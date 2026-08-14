import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type { EvidenceGraph } from
  "../models/EvidenceGraph";

import { EvidenceBuilderService } from
  "../services/EvidenceBuilderService";

export class EvidenceRuntime {
  private readonly builder =
    new EvidenceBuilderService();

  public build(
    intelligence: CandidateIntelligence,
  ): EvidenceGraph {
    return this.builder.build(
      intelligence,
    );
  }
}