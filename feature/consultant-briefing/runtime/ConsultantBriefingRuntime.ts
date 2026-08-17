import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

import type { ConsultantBriefing } from "../models/ConsultantBriefing";

export class ConsultantBriefingRuntime {
  public constructor(
    private readonly candidates: CandidateRepository =
      new SeedCandidateRepository(),
  ) {}

  public async build(candidateId: string): Promise<ConsultantBriefing | null> {
    const candidate = await this.candidates.getById(candidateId);

    if (!candidate?.intelligence) return null;

    const intelligence = candidate.intelligence;

    return {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      aiConfidence: intelligence.timing.confidence,
      discoveryStage: candidate.pipelineStage,
      meetingObjective:
        intelligence.discoveryPriorities[0] ??
        "Validate ownership goals before presenting recommended brands.",
      discussionTopics: intelligence.discoveryPriorities,
      buyingSignals: [
        intelligence.behavioral.leadershipStyle,
        ...intelligence.preferredBusinessModels,
      ],
      watchFor: intelligence.discoveryPriorities,
      suggestedClosing:
        `If today’s conversation resolves the remaining priorities, advance ${candidate.firstName} to ${candidate.pipelineStage === "discovery" ? "Brand Strategy" : "the next lifecycle stage"}.`,
      nextBestAction:
        intelligence.discoveryPriorities[0] ??
        "Continue candidate evaluation",
    };
  }
}
