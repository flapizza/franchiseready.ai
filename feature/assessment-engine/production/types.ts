import type { ConferenceAnalysis, ConferenceAnswers, ConferenceIntake } from "../conference/types";

export const PRODUCTION_INSTRUMENT_VERSION = "franchise-ownership-assessment-v1" as const;
export type ProductionAssessmentStatus = "created" | "invited" | "in-progress" | "submitted" | "analyzed" | "expired" | "cancelled";
export type AssessmentProgress = { stage: "intake" | "intro" | "assessment" | "concerns"; section: number; intake: ConferenceIntake; answers: ConferenceAnswers; consent: boolean; startedAt: string };
export type ProductionAssessmentSession = {
  id: string; publicId: string; candidateId: string; status: ProductionAssessmentStatus;
  instrumentVersion: typeof PRODUCTION_INSTRUMENT_VERSION; currentSection: number;
  startedAt: string | null; lastSavedAt: string | null; submittedAt: string | null;
  completedAt: string | null; expiresAt: string; revokedAt: string | null;
  progress: AssessmentProgress | null; analysis: ConferenceAnalysis | null;
};

