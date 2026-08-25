import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ConferenceAnalysis } from "../conference/types";
import type { AssessmentRepository } from "./AssessmentRepository";
import type { AssessmentProgress, ProductionAssessmentSession } from "./types";

type RpcClient = Pick<SupabaseClient, "rpc">;
export class AssessmentRepositoryError extends Error {}
export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly client: RpcClient, private readonly workspace?: AuthenticatedWorkspaceContext) {}
  private async call(name: string, args: Record<string, unknown>) {
    const { data, error } = await this.client.rpc(name as never, args as never) as { data: unknown; error: { message: string } | null };
    if (error) throw new AssessmentRepositoryError(error.message);
    return (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  }
  async createInvitation(candidateId: string, tokenHash: string, expiresAt: string) {
    if (!this.workspace) throw new AssessmentRepositoryError("An authenticated workspace is required.");
    const row = await this.call("create_assessment_invitation", { target_candidate_public_id: candidateId, presented_token_hash: tokenHash, invitation_expires_at: expiresAt });
    if (!row) throw new AssessmentRepositoryError("Assessment invitation could not be created.");
    return this.map(row);
  }
  async getForCandidate(candidateId: string) { const row=await this.call("get_candidate_assessment",{target_candidate_public_id:candidateId}); return row?this.map(row):null; }
  async loadByTokenHash(tokenHash: string) { const row=await this.call("load_assessment_by_token",{presented_token_hash:tokenHash}); return row?this.map(row):null; }
  async saveProgress(tokenHash: string, progress: AssessmentProgress) { const row=await this.call("save_assessment_progress",{presented_token_hash:tokenHash,progress_snapshot:progress}); if(!row)throw new AssessmentRepositoryError("Assessment progress could not be saved.");return this.map(row); }
  async submit(tokenHash:string,progress:AssessmentProgress,analysis:ConferenceAnalysis){const row=await this.call("submit_assessment",{presented_token_hash:tokenHash,submitted_intake:progress.intake,submitted_answers:progress.answers,submitted_analysis:analysis,submitted_analysis_version:analysis.analysisVersion});if(!row)throw new AssessmentRepositoryError("Assessment could not be submitted.");return this.map(row);}
  async regenerateAnalysis(candidateId:string,analysis:ConferenceAnalysis){await this.call("regenerate_assessment_analysis",{target_candidate_public_id:candidateId,replacement_analysis:analysis,replacement_analysis_version:analysis.analysisVersion});}
  async revoke(candidateId:string){await this.call("revoke_assessment_invitation",{target_candidate_public_id:candidateId});}
  private map(row:Record<string,unknown>):ProductionAssessmentSession{return {id:String(row.id),publicId:String(row.public_id),candidateId:String(row.candidate_public_id??row.candidate_id),status:row.status as ProductionAssessmentSession["status"],instrumentVersion:"franchise-ownership-assessment-v1",currentSection:Number(row.current_section??0),startedAt:row.started_at?String(row.started_at):null,lastSavedAt:row.last_saved_at?String(row.last_saved_at):null,submittedAt:row.submitted_at?String(row.submitted_at):null,completedAt:row.completed_at?String(row.completed_at):null,expiresAt:String(row.expires_at),revokedAt:row.revoked_at?String(row.revoked_at):null,progress:(row.progress_snapshot as AssessmentProgress|null)??null,analysis:(row.analysis_snapshot as ConferenceAnalysis|null)??null};}
}

