import type { CandidateIntelligence } from
  "@/feature/candidate-intelligence/models/CandidateIntelligence";

import type {
  EvidenceGraph,
} from "../models/EvidenceGraph";

export class EvidenceBuilderService {
  public build(
    intelligence: CandidateIntelligence,
  ): EvidenceGraph {
    return {
      candidateId:
        intelligence.candidateId,

      confidence:
        intelligence.confidence,

      evidence: [],
    };
  }
}