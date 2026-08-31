import "server-only";

import type { CandidateResolutionResult, CandidateResolutionService } from "./CandidateResolutionService";

/** Production exact matching is unavailable until persistence exposes an authoritative operation. */
export class ProductionCandidateResolutionService implements CandidateResolutionService {
  async resolve(): Promise<CandidateResolutionResult> {
    return { status: "unavailable", reason: "not-implemented" };
  }
}
