import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.generated";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ConferenceAnalysis } from "../conference/types";
import type { AssessmentRepository } from "./AssessmentRepository";
import type { AssessmentProgress, ContactAssessmentSession, ProductionAssessmentSession } from "./types";

export class AssessmentRepositoryError extends Error {
  constructor(message: string, public readonly code?: string) { super(message); }
}
export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace?: AuthenticatedWorkspaceContext) {}
  private first(value: unknown) { return (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | null; }
  private fail(error: { message: string; code?: string } | null) { if(error)throw new AssessmentRepositoryError(error.message, error.code); }
  private json(value: unknown):Json{return JSON.parse(JSON.stringify(value)) as Json;}
  async createContactForInvitation(input: {firstName: string; lastName: string; email: string; phone: string}) {
    if (!this.workspace) throw new AssessmentRepositoryError("An authenticated workspace is required.");
    const {data,error} = await this.client.rpc("create_assessment_contact", {
      target_organization_id:this.workspace.organization.id, proposed_first_name:input.firstName,
      proposed_last_name:input.lastName,proposed_email:input.email,proposed_phone:input.phone,
    });
    this.fail(error);
    if (!data) throw new AssessmentRepositoryError("Contact could not be created.");
    return data;
  }
  async createInvitation(candidateId: string, tokenHash: string, expiresAt: string, expectedReplacementId?: string | null) {
    if (!this.workspace) throw new AssessmentRepositoryError("An authenticated workspace is required.");
    // Omission means first invitation, never permission to replace the latest one.
    // Replacement must carry the exact session the caller observed/confirmed.
    const {data,error}=await this.client.rpc("create_assessment_invitation", { target_candidate_public_id: candidateId, presented_token_hash: tokenHash, invitation_expires_at: expiresAt, expected_replacement_id: expectedReplacementId ?? undefined });this.fail(error);const row=this.first(data);
    if (!row) throw new AssessmentRepositoryError("Assessment invitation could not be created.");
    return this.map({ ...row, candidate_public_id: candidateId });
  }
  async createContactInvitation(contactId: string, tokenHash: string, expiresAt: string, expectedReplacementId: string | null = null): Promise<ContactAssessmentSession> {
    if (!this.workspace) throw new AssessmentRepositoryError("An authenticated workspace is required.");
    const { data, error } = await this.client.rpc("create_contact_assessment_invitation", {
      target_contact_public_id: contactId, presented_token_hash: tokenHash,
      invitation_expires_at: expiresAt, expected_replacement_id: expectedReplacementId ?? undefined,
    });
    this.fail(error);
    const row = this.first(data);
    if (!row) throw new AssessmentRepositoryError("Assessment invitation could not be created.");
    return this.mapContact(row);
  }
  async getForContact(contactId: string): Promise<ContactAssessmentSession | null> {
    const { data, error } = await this.client.rpc("get_contact_assessment", { target_contact_public_id: contactId });
    this.fail(error);
    const row = this.first(data);
    return row ? this.mapContact(row) : null;
  }
  async revokeForContact(contactId: string) {
    const { error } = await this.client.rpc("revoke_contact_assessment_invitation", { target_contact_public_id: contactId });
    this.fail(error);
  }
  private mapContact(row: Record<string, unknown>): ContactAssessmentSession {
    return { ...this.map(row), contactId: String(row.contact_public_id), candidateId: row.candidate_public_id ? String(row.candidate_public_id) : null, identityConflict:row.identity_conflict === true };
  }
  async getForCandidate(candidateId: string) { const{data,error}=await this.client.rpc("get_candidate_assessment",{target_candidate_public_id:candidateId});this.fail(error);const row=this.first(data);return row?this.map(row):null; }
  async regenerateAnalysis(candidateId:string,analysis:ConferenceAnalysis){const{error}=await this.client.rpc("regenerate_assessment_analysis",{target_candidate_public_id:candidateId,replacement_analysis:this.json(analysis),replacement_analysis_version:analysis.analysisVersion});this.fail(error);}
  async revoke(candidateId:string){const{error}=await this.client.rpc("revoke_assessment_invitation",{target_candidate_public_id:candidateId});this.fail(error);}
  private map(row:Record<string,unknown>):ProductionAssessmentSession{return {id:String(row.id),publicId:String(row.public_id),candidateId:String(row.candidate_public_id??row.candidate_id),status:row.status as ProductionAssessmentSession["status"],instrumentVersion:"franchise-ownership-assessment-v1",currentSection:Number(row.current_section??0),startedAt:row.started_at?String(row.started_at):null,lastSavedAt:row.last_saved_at?String(row.last_saved_at):null,submittedAt:row.submitted_at?String(row.submitted_at):null,completedAt:row.completed_at?String(row.completed_at):null,expiresAt:String(row.expires_at),revokedAt:row.revoked_at?String(row.revoked_at):null,progress:(row.progress_snapshot as AssessmentProgress|null)??null,analysis:(row.analysis_snapshot as ConferenceAnalysis|null)??null};}
}
