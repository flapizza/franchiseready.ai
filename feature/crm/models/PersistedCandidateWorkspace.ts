import type { CandidateRecord } from "./CandidateRecord";
import type { ConferenceAnalysis } from "@/feature/assessment-engine/conference/types";
import type { ProductionAssessmentStatus } from "@/feature/assessment-engine/production/types";
import type { ProductionDiscoverySession } from "@/feature/discovery/production/types";

/** Read model only. Does not convert profile confidence into legacy readiness. */
export interface PersistedCandidateWorkspace {
  candidate: CandidateRecord;
  assessment: {
    id: string; status: ProductionAssessmentStatus; startedAt: string | null;
    savedAt: string | null; completedAt: string | null; analysis: ConferenceAnalysis | null;
  } | null;
  discovery: ProductionDiscoverySession | null;
}
