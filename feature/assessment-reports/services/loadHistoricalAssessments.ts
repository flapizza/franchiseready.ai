import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductionWorkspaceComposition } from "@/feature/platform/composition/ProductionWorkspaceComposition";
import type { HistoricalAssessment } from "./HistoricalAssessmentDocuments";

/** Signed-in client + candidate authorization + RLS. No tokens, current Discovery, or writes. */
export async function loadHistoricalAssessments(composition: ProductionWorkspaceComposition, candidateId: string): Promise<HistoricalAssessment[]> {
  if (!await composition.dependencies.candidates.getById(candidateId)) return [];
  const db = await createServerSupabaseClient();
  const org = composition.session.organization.id;
  const { data: candidate, error: candidateError } = await db.from("candidates").select("id").eq("public_id", candidateId).eq("organization_id", org).single();
  if (candidateError) throw new Error("Candidate documents unavailable.");
  const { data: sessions, error } = await db.from("assessment_sessions").select("id").eq("candidate_id", candidate.id).eq("organization_id", org).eq("status", "analyzed");
  if (error) throw new Error("Candidate documents unavailable.");
  const result: HistoricalAssessment[] = [];
  for (const session of sessions) {
    const { data: submissions, error: submissionError } = await db.from("assessment_submissions").select("*").eq("session_id", session.id).eq("organization_id", org);
    if (submissionError) throw new Error("Assessment submission unavailable.");
    for (const submission of submissions) {
      const { data: analyses, error: analysisError } = await db.from("assessment_analyses").select("*").eq("submission_id", submission.id).eq("session_id", session.id).eq("organization_id", org).order("generated_at");
      if (analysisError) throw new Error("Assessment history unavailable.");
      for (const a of analyses) {
        const analysis = a.analysis_snapshot as unknown as HistoricalAssessment["analysis"];
        if (analysis.version !== "franchise-ownership-v1" || analysis.analysisVersion !== 2) continue;
        result.push({ id: a.id, sessionId: session.id, submissionId: submission.id, completedAt: submission.submitted_at, generatedAt: a.generated_at, instrumentVersion: submission.instrument_version, analysis, intake: submission.intake_snapshot as unknown as HistoricalAssessment["intake"], answers: submission.response_snapshot as HistoricalAssessment["answers"] });
      }
    }
  }
  return result.sort((a,b) => b.completedAt.localeCompare(a.completedAt) || a.generatedAt.localeCompare(b.generatedAt) || a.id.localeCompare(b.id));
}
