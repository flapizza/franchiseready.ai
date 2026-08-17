import { conferenceScenario } from "../data/conferenceScenario";
import type {
  DemoCandidate,
  DemoScenario,
} from "../models/DemoScenario";
import type { DemoScenarioRepository } from "./DemoScenarioRepository";
import { CandidateIntelligenceAdapter } from "@/feature/candidate-intelligence/adapters/CandidateIntelligenceAdapter";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class SeedDemoScenarioRepository implements DemoScenarioRepository {
  private readonly intelligenceAdapter =
    new CandidateIntelligenceAdapter();

  async getScenario(): Promise<DemoScenario> {
    return clone(conferenceScenario);
  }

  async getCandidateById(id: string): Promise<DemoCandidate | null> {
    const candidate = conferenceScenario.candidates.find(
      (item) => item.id === id,
    );

    return candidate ? clone(candidate) : null;
  }

  async getCandidateIntelligence(id: string) {
    const candidate = await this.getCandidateById(id);

    if (!candidate) return null;

    return this.intelligenceAdapter.fromProfile(candidate.intelligence, {
      candidateId: candidate.id,
      intelligenceFlags: candidate.intelligenceFlags,
      detectedRisks: candidate.discovery.detectedRisks,
      detectedBuyingSignals: candidate.discovery.detectedBuyingSignals,
      nextDiscoveryFocus: candidate.discovery.focus,
    });
  }
}
