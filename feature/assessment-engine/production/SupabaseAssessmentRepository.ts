import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.generated";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ConferenceAnalysis } from "../conference/types";
import type { AssessmentRepository } from "./AssessmentRepository";
import type { AssessmentProgress, ProductionAssessmentSession } from "./types";

export class AssessmentRepositoryError extends Error {}
export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace?: AuthenticatedWorkspaceContext) {}
  private first(value: unknown) { return (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | null; }
  private fail(error: { message: string } | null) { if(error)throw new AssessmentRepositoryError(error.message); }
  private json(value: unknown):Json{return JSON.parse(JSON.stringify(value)) as Json;}
  async createInvitation(candidateId: string, tokenHash: string, expiresAt: string) {
    if (!this.workspace) throw new AssessmentRepositoryError("An authenticated workspace is required.");
    const {data,error}=await this.client.rpc("create_assessment_invitation", { target_candidate_public_id: candidateId, presented_token_hash: tokenHash, invitation_expires_at: expiresAt });this.fail(error);const row=this.first(data);
    if (!row) throw new AssessmentRepositoryError("Assessment invitation could not be created.");
    return this.map(row);
  }
  async getForCandidate(candidateId: string) { const{data,error}=await this.client.rpc("get_candidate_assessment",{target_candidate_public_id:candidateId});this.fail(error);const row=this.first(data);return row?this.map(row):null; }
  async loadByTokenHash(tokenHash: string) { const{data,error}=await this.client.rpc("load_assessment_by_token",{presented_token_hash:tokenHash});this.fail(error);const row=this.first(data);return row?this.map(row):null; }
  async saveProgress(tokenHash: string, progress: AssessmentProgress) { const{data,error}=await this.client.rpc("save_assessment_progress",{presented_token_hash:tokenHash,progress_snapshot:this.json(progress)});this.fail(error);const row=this.first(data);if(!row)throw new AssessmentRepositoryError("Assessment progress could not be saved.");return this.map(row); }
  async submit(tokenHash:string,progress:AssessmentProgress,analysis:ConferenceAnalysis){const{data,error}=await this.client.rpc("submit_assessment",{presented_token_hash:tokenHash,submitted_intake:this.json(progress.intake),submitted_answers:this.json(progress.answers),submitted_analysis:this.json(analysis),submitted_analysis_version:analysis.analysisVersion});this.fail(error);const row=this.first(data);if(!row)throw new AssessmentRepositoryError("Assessment could not be submitted.");return this.map(row);}
  async regenerateAnalysis(candidateId:string,analysis:ConferenceAnalysis){const{error}=await this.client.rpc("regenerate_assessment_analysis",{target_candidate_public_id:candidateId,replacement_analysis:this.json(analysis),replacement_analysis_version:analysis.analysisVersion});this.fail(error);}
  async revoke(candidateId:string){const{error}=await this.client.rpc("revoke_assessment_invitation",{target_candidate_public_id:candidateId});this.fail(error);}
  private map(row:Record<string,unknown>):ProductionAssessmentSession{return {id:String(row.id),publicId:String(row.public_id),candidateId:String(row.candidate_public_id??row.candidate_id),status:row.status as ProductionAssessmentSession["status"],instrumentVersion:"franchise-ownership-assessment-v1",currentSection:Number(row.current_section??0),startedAt:row.started_at?String(row.started_at):null,lastSavedAt:row.last_saved_at?String(row.last_saved_at):null,submittedAt:row.submitted_at?String(row.submitted_at):null,completedAt:row.completed_at?String(row.completed_at):null,expiresAt:String(row.expires_at),revokedAt:row.revoked_at?String(row.revoked_at):null,progress:(row.progress_snapshot as AssessmentProgress|null)??null,analysis:(row.analysis_snapshot as ConferenceAnalysis|null)??null};}
}
