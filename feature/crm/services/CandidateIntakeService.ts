import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateRepository } from "../repositories/CandidateRepository";
import type { CandidateResolutionService } from "./CandidateResolutionService";

export interface CandidateIntakeActivitySink { candidateCreated(candidate: CandidateRecord): Promise<void> }
const noActivitySink: CandidateIntakeActivitySink = { async candidateCreated() {} };

export interface CandidateIntakeInput {
  consultantId: string; firstName: string; lastName: string; email: string;
  phone?: string; city?: string; state?: string; preferredTerritory?: string; leadSource?: string; notes?: string;
}

export type CandidateIntakeResult =
  | { status: "created"; candidate: CandidateRecord }
  | { status: "exact-match"; candidate: CandidateRecord }
  | { status: "possible-match"; candidateIds: string[] };

export class CandidateIntakeService {
  public constructor(private readonly candidates: CandidateRepository, private readonly resolver: CandidateResolutionService, private readonly activities: CandidateIntakeActivitySink = noActivitySink) {}

  async create(input: CandidateIntakeInput): Promise<CandidateIntakeResult> {
    const resolution = await this.resolver.resolve({ consultantId: input.consultantId, email: input.email, phone: input.phone });
    if (resolution.status === "unavailable") throw new Error("Candidate identity resolution is unavailable.");
    if (resolution.status === "matched" && resolution.method === "normalized-phone") {
      return { status: "possible-match", candidateIds: [resolution.candidateId] };
    }
    if (resolution.status === "matched") {
      const candidate = await this.candidates.getById(resolution.candidateId);
      if (!candidate) throw new Error("Resolved candidate could not be loaded.");
      return { status: "exact-match", candidate };
    }
    if (resolution.status === "ambiguous") return { status: "possible-match", candidateIds: resolution.candidateIds };

    const now = new Date().toISOString();
    const candidate: CandidateRecord = {
      id: `candidate-${crypto.randomUUID()}`, firstName: input.firstName.trim(), lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(), phone: input.phone?.trim() ?? "", city: input.city?.trim() ?? "",
      state: input.state?.trim().toUpperCase() ?? "", country: "USA", consultantId: input.consultantId,
      status: "active", pipelineStage: "lead", healthScore: 0, createdAt: now, updatedAt: now, lastActivityAt: now,
      assessmentIds: [], intelligence: null, preferredTerritory: input.preferredTerritory?.trim(), leadSource: input.leadSource?.trim(), notes: input.notes?.trim(),
    };
    const saved = await this.candidates.save(candidate);
    await this.activities.candidateCreated(saved);
    return { status: "created", candidate: saved };
  }
}
