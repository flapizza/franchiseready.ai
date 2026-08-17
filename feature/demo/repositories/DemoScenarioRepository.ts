import type {
  DemoCandidate,
  DemoScenario,
} from "../models/DemoScenario";
import type { CandidateIntelligence } from "@/feature/candidate-intelligence/models/CandidateIntelligence";

export interface DemoScenarioRepository {
  getScenario(): Promise<DemoScenario>;
  getCandidateById(id: string): Promise<DemoCandidate | null>;
  getCandidateIntelligence(id: string): Promise<CandidateIntelligence | null>;
}
