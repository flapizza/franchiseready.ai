import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { CandidateRecord, CandidateStatus, PipelineStage } from "../models/CandidateRecord";
import type { CandidateRepository } from "./CandidateRepository";

type CandidateRow = {
  id: string; organization_id: string; public_id: string; assigned_membership_id: string;
  created_by_membership_id: string; first_name: string; last_name: string; preferred_name: string | null;
  email: string; phone: string | null; status: CandidateStatus; pipeline_stage_id: string;
  created_at: string; updated_at: string; archived_at: string | null;
};
type CandidateInsert = Partial<Pick<CandidateRow, "id" | "public_id" | "preferred_name" | "phone" | "status" | "pipeline_stage_id" | "created_at" | "updated_at" | "archived_at">>
  & Pick<CandidateRow, "organization_id" | "assigned_membership_id" | "created_by_membership_id" | "first_name" | "last_name" | "email">;
export type CandidateDatabase = {
  public: {
    Tables: { candidates: { Row: CandidateRow; Insert: CandidateInsert; Update: Partial<CandidateInsert>; Relationships: [] } };
    Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
};

export class CandidateRepositoryError extends Error {}

export class SupabaseCandidateRepository implements CandidateRepository {
  constructor(
    private readonly supabase: SupabaseClient<CandidateDatabase>,
    private readonly workspace: AuthenticatedWorkspaceContext,
  ) {}

  async getAll(): Promise<CandidateRecord[]> {
    const { data, error } = await this.supabase.from("candidates").select("*")
      .eq("organization_id", this.workspace.organization.id).is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new CandidateRepositoryError("Candidates could not be loaded.");
    return data.map((row) => this.toRecord(row));
  }

  async getById(publicId: string): Promise<CandidateRecord | null> {
    const { data, error } = await this.supabase.from("candidates").select("*")
      .eq("organization_id", this.workspace.organization.id).eq("public_id", publicId)
      .is("archived_at", null).maybeSingle();
    if (error) throw new CandidateRepositoryError("Candidate could not be loaded.");
    return data ? this.toRecord(data) : null;
  }

  async findByNormalizedEmail(_membershipId: string, normalizedEmail: string): Promise<CandidateRecord[]> {
    const { data, error } = await this.supabase.from("candidates").select("*")
      .eq("organization_id", this.workspace.organization.id).ilike("email", normalizedEmail)
      .is("archived_at", null);
    if (error) throw new CandidateRepositoryError("Candidate identity could not be resolved.");
    return data.map((row) => this.toRecord(row));
  }

  async findByNormalizedPhone(_membershipId: string, normalizedPhone: string): Promise<CandidateRecord[]> {
    const records = await this.getAll();
    return records.filter((candidate) => candidate.phone.replace(/\D/g, "") === normalizedPhone);
  }

  async save(candidate: CandidateRecord): Promise<CandidateRecord> {
    const existing = candidate.id.startsWith("cand_") ? await this.getById(candidate.id) : null;
    if (existing) {
      const { data, error } = await this.supabase.from("candidates").update({
        first_name: candidate.firstName, last_name: candidate.lastName, email: candidate.email,
        phone: candidate.phone || null, status: candidate.status, pipeline_stage_id: candidate.pipelineStageId ?? candidate.pipelineStage,
      }).eq("organization_id", this.workspace.organization.id).eq("public_id", candidate.id).select("*").single();
      if (error) throw new CandidateRepositoryError("Candidate could not be updated.");
      return this.toRecord(data);
    }

    const { data, error } = await this.supabase.from("candidates").insert({
      organization_id: this.workspace.organization.id,
      assigned_membership_id: this.workspace.membership.id,
      created_by_membership_id: this.workspace.membership.id,
      first_name: candidate.firstName,
      last_name: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone || null,
      status: candidate.status,
      pipeline_stage_id: candidate.pipelineStageId ?? candidate.pipelineStage,
    }).select("*").single();
    if (error) throw new CandidateRepositoryError("Candidate could not be created.");
    return this.toRecord(data);
  }

  private toRecord(row: CandidateRow): CandidateRecord {
    const stage = row.pipeline_stage_id as PipelineStage;
    return {
      id: row.public_id, firstName: row.first_name, lastName: row.last_name,
      email: row.email, phone: row.phone ?? "", city: "", state: "", country: "USA",
      consultantId: row.assigned_membership_id, status: row.status as CandidateStatus,
      pipelineStage: stage, pipelineStageId: row.pipeline_stage_id, healthScore: 0,
      createdAt: row.created_at, updatedAt: row.updated_at, lastActivityAt: row.updated_at,
      assessmentIds: [], intelligence: null,
    };
  }
}
