import { ConsultantHomeRuntime } from "./ConsultantHomeRuntime";

import { IntelligenceGraphRuntime } from "@/feature/intelligence-graph/runtime/IntelligenceGraphRuntime";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import type { ConsultantHomeState } from "../models/ConsultantHomeState";
import type { IntelligenceGraph } from "@/feature/intelligence-graph/models/IntelligenceGraph";
import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";

export interface ConsultantWorkbenchState {
  consultant: ConsultantHomeState;

  candidate: CandidateRecord;

  graph: IntelligenceGraph;
}

export class ConsultantWorkbenchRuntime {
  private readonly homeRuntime =
    new ConsultantHomeRuntime();

  private readonly graphRuntime =
    new IntelligenceGraphRuntime();

  private readonly candidateRepository =
    new SeedCandidateRepository();

  public async build(): Promise<ConsultantWorkbenchState> {
    const consultant =
      this.homeRuntime.build();

    const candidates =
      await this.candidateRepository.getAll();

    if (candidates.length === 0) {
      throw new Error(
        "No candidates found in repository.",
      );
    }

    const candidate = candidates[0];

    const graph =
      this.graphRuntime.build(candidate);

    return {
      consultant,
      candidate,
      graph,
    };
  }
}