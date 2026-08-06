import type { DiscoveryMemory } from "./DiscoveryMemory";

export interface DiscoverySession {
  id: string;

  startedAt: string;

  currentStage:
    | "opening"
    | "motivation"
    | "leadership"
    | "financial"
    | "brand-fit"
    | "closing";

  memory: DiscoveryMemory;

  readiness: number;

  confidence: number;
}