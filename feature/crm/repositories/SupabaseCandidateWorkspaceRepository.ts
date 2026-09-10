import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ConferenceAnalysis } from "@/feature/assessment-engine/conference/types";
import type { CurrentDiscoveryIntelligence } from "@/feature/discovery/production/types";
import type { CandidateRepository } from "./CandidateRepository";
import type { PersistedCandidateWorkspace } from "../models/PersistedCandidateWorkspace";

async function pages<T>(fetch: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; from < 20000; from += 500) {
    const result = await fetch(from, from + 499);
    if (result.error || !result.data) throw new Error("Candidate workspace evidence could not be loaded.");
    rows.push(...result.data);
    if (result.data.length < 500) return rows;
  }
  throw new Error("Candidate workspace evidence exceeds the supported page limit.");
}

/** All queries use the signed-in client, organization scope and existing RLS. No write-on-read. */
export class SupabaseCandidateWorkspaceRepository {
  constructor(private readonly db: SupabaseClient<Database>, private readonly workspace: AuthenticatedWorkspaceContext, private readonly candidates: CandidateRepository) {}
  async load(candidateId?: string): Promise<PersistedCandidateWorkspace[]> {
    const records = candidateId ? [await this.candidates.getById(candidateId)].filter(x => x !== null) : await this.candidates.getAll();
    if (!records.length) return [];
    const org = this.workspace.organization.id;
    const [assessments, discoveries] = await Promise.all([
      pages((from, to) => {
        let query = this.db.from("assessment_sessions").select("id,status,started_at,last_saved_at,completed_at,created_at,candidates!assessment_sessions_candidate_id_organization_id_fkey!inner(public_id),assessment_analyses!assessment_analyses_session_id_organization_id_fkey(analysis_snapshot,superseded_at)")
          .eq("organization_id", org).order("created_at", { ascending: false }).order("id").range(from, to);
        if (candidateId) query = query.eq("candidates.public_id", candidateId);
        return query;
      }),
      pages((from, to) => {
        let query = this.db.from("discovery_sessions").select("*,candidates!inner(public_id),discovery_observations(*),discovery_intelligence(current_snapshot,superseded_at)")
          .eq("organization_id", org).order("created_at", { ascending: false }).order("id").range(from, to);
        if (candidateId) query = query.eq("candidates.public_id", candidateId);
        return query;
      }),
    ]);
    return records.map(candidate => {
      const a = assessments.find(row => row.candidates.public_id === candidate.id);
      const snapshot = a?.status === "analyzed" ? a.assessment_analyses.find(row => !row.superseded_at)?.analysis_snapshot : null;
      const analysis = snapshot as unknown as ConferenceAnalysis | null;
      if (analysis && (analysis.version !== "franchise-ownership-v1" || analysis.analysisVersion !== 2)) throw new Error("Assessment analysis version is not supported.");
      const d = discoveries.find(row => row.candidates.public_id === candidate.id && row.assessment_session_id === a?.id);
      return { candidate, assessment: a ? { id: a.id, status: a.status, startedAt: a.started_at, savedAt: a.last_saved_at, completedAt: a.completed_at, analysis: analysis ?? null } : null,
        discovery: d ? { id: d.id, publicId: d.public_id, candidateId: candidate.id, assessmentSessionId: d.assessment_session_id,
          status: d.status, summary: d.summary, consultantNotes: d.consultant_notes, nextSteps: d.next_steps,
          startedAt: d.started_at, completedAt: d.completed_at, createdAt: d.created_at, updatedAt: d.updated_at,
          observations: d.discovery_observations.map(o => ({ id: o.id, topicId: o.topic_key, topic: o.topic_label, finding: o.finding,
            candidateStatement: o.candidate_statement, status: o.status, significance: o.consultant_significance,
            followUpNeeded: o.follow_up_needed, source: "discovery" as const, createdAt: o.created_at, updatedAt: o.updated_at })),
          currentIntelligence: (d.discovery_intelligence.find(row => !row.superseded_at)?.current_snapshot ?? null) as unknown as CurrentDiscoveryIntelligence | null,
        } : null };
    });
  }
  async get(candidateId: string) { return (await this.load(candidateId))[0] ?? null; }
}
