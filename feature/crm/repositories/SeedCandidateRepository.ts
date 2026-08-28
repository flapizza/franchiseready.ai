import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateRepository } from "./CandidateRepository";

import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { demoCandidateOverlayStore } from "./DemoCandidateOverlayStore";

export class SeedCandidateRepository
  implements CandidateRepository
{
  private readonly scenarioRepository =
    new SeedDemoScenarioRepository();

  async getAll(): Promise<CandidateRecord[]> {
    const scenario = await this.scenarioRepository.getScenario();
    const overlay = demoCandidateOverlayStore.getCandidates();
    const overlayById = new Map(overlay.map((candidate) => [candidate.id, candidate]));
    const baseline = scenario.candidates.map((candidate) => overlayById.get(candidate.id) ?? candidate);
    const baselineIds = new Set(scenario.candidates.map((candidate) => candidate.id));
    return [...baseline, ...overlay.filter((candidate) => !baselineIds.has(candidate.id))];
  }

  async getById(
    id: string,
  ): Promise<CandidateRecord | null> {
    return demoCandidateOverlayStore.getCandidate(id) ??
      this.scenarioRepository.getCandidateById(id);
  }

  async findByNormalizedEmail(
    consultantId: string,
    normalizedEmail: string,
  ): Promise<CandidateRecord[]> {
    const candidates = await this.getAll();

    return candidates.filter(
      (candidate) =>
        candidate.consultantId === consultantId &&
        candidate.email.trim().toLowerCase() === normalizedEmail,
    );
  }

  async findByNormalizedPhone(
    consultantId: string,
    normalizedPhone: string,
  ): Promise<CandidateRecord[]> {
    const candidates = await this.getAll();

    return candidates.filter(
      (candidate) =>
        candidate.consultantId === consultantId &&
        candidate.phone.replace(/\D/g, "") === normalizedPhone,
    );
  }

  async save(
    candidate: CandidateRecord,
  ): Promise<CandidateRecord> {
    demoCandidateOverlayStore.saveCandidate(candidate);
    return candidate;
  }

  async deleteById(id: string): Promise<void> {
    if (!demoCandidateOverlayStore.deleteCandidate(id)) {
      throw new Error("Candidate could not be deleted.");
    }
  }
}
