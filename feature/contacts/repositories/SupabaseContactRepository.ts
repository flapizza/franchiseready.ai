import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.generated";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ContactInput, ContactListPage, ContactListQuery, ContactRecord } from "../models/Contact";
import { ContactAuthorizationError, ContactDuplicateError, ContactUnavailableError } from "../models/ContactErrors";
import type { ContactRepository } from "./ContactRepository";

type ContactRow = Tables<"contacts"> & {
  candidates: { public_id: string; status: string; pipeline_stage_id: string }[] | null;
};

const select = "*, candidates(public_id,status,pipeline_stage_id)";

export class SupabaseContactRepository implements ContactRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly workspace: AuthenticatedWorkspaceContext,
  ) {}

  async listAssignableConsultants(): Promise<{ id: string; name: string }[]> {
    const { data: memberships, error } = await this.supabase.rpc("get_authorized_membership_ids", {
      target_organization_id: this.workspace.organization.id,
    });
    if (error) throw new ContactUnavailableError("Contact assignees could not be loaded.");
    const ids = memberships.map((item) => item.membership_id);
    if (!ids.length) return [];
    const { data: profiles } = await this.supabase.from("consultant_profiles").select("membership_id,display_name").in("membership_id", ids);
    const names = new Map((profiles ?? []).map((profile) => [profile.membership_id, profile.display_name]));
    return ids.map((id) => ({ id, name: names.get(id) ?? (id === this.workspace.membership.id ? "You" : "Consultant") }));
  }

  async list(query: ContactListQuery): Promise<ContactListPage> {
    const limit = Math.min(Math.max(query.limit, 1), 50);
    let request = this.supabase.from("contacts").select(select)
      .eq("organization_id", this.workspace.organization.id)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limit + 1);
    if (query.lifecycle) request = request.eq("lifecycle_status", query.lifecycle);
    if (query.search?.trim()) {
      const value = query.search.trim().replace(/[^\p{L}\p{N}@+.' -]/gu, " ").replace(/\s+/g, " ").slice(0, 100);
      request = request.or(`first_name.ilike.%${value}%,last_name.ilike.%${value}%,primary_email.ilike.%${value}%,primary_phone.ilike.%${value}%,company.ilike.%${value}%`);
    }
    if (query.cursor) {
      request = request.or(`updated_at.lt.${query.cursor.updatedAt},and(updated_at.eq.${query.cursor.updatedAt},id.lt.${query.cursor.internalId})`);
    }
    const { data, error } = await request;
    if (error) throw new ContactUnavailableError("Contacts could not be loaded.");
    const rows = data as unknown as ContactRow[];
    const visible = rows.slice(0, limit);
    return {
      contacts: await this.toRecords(visible),
      nextCursor: rows.length > limit && visible.at(-1)
        ? { updatedAt: visible.at(-1)!.updated_at, internalId: visible.at(-1)!.id }
        : null,
    };
  }

  async getById(publicId: string): Promise<ContactRecord | null> {
    const { data, error } = await this.supabase.from("contacts").select(select)
      .eq("organization_id", this.workspace.organization.id).eq("public_id", publicId)
      .is("archived_at", null).maybeSingle();
    if (error) throw new ContactUnavailableError("Contact could not be loaded.");
    return data ? (await this.toRecords([data as unknown as ContactRow]))[0]! : null;
  }

  async create(input: ContactInput): Promise<ContactRecord> {
    const membershipId = input.assignedMembershipId || this.workspace.membership.id;
    const { data, error } = await this.supabase.from("contacts").insert({
      organization_id: this.workspace.organization.id,
      created_by_membership_id: this.workspace.membership.id,
      assigned_membership_id: membershipId,
      ...this.toRow(input),
    }).select(select).single();
    if (error?.code === "23505") throw new ContactDuplicateError("A contact with this email already exists in your organization.");
    if (error?.code === "42501") throw new ContactAuthorizationError("You are not authorized to create this contact.");
    if (error) throw new ContactUnavailableError("Contact could not be created.");
    return (await this.toRecords([data as unknown as ContactRow]))[0]!;
  }

  async update(publicId: string, input: ContactInput): Promise<ContactRecord> {
    const membershipId = input.assignedMembershipId || this.workspace.membership.id;
    const { data, error } = await this.supabase.from("contacts").update({
      assigned_membership_id: membershipId,
      ...this.toRow(input),
    }).eq("organization_id", this.workspace.organization.id).eq("public_id", publicId).select(select).single();
    if (error?.code === "23505") throw new ContactDuplicateError("A contact with this email already exists in your organization.");
    if (error?.code === "42501") throw new ContactAuthorizationError("You are not authorized to edit this contact.");
    if (error) throw new ContactUnavailableError("Contact could not be updated.");
    return (await this.toRecords([data as unknown as ContactRow]))[0]!;
  }

  async promoteToCandidate(publicId: string): Promise<string> {
    const { data, error } = await this.supabase.rpc("promote_contact_to_candidate", { target_contact_public_id: publicId });
    if (error?.code === "23505") throw new ContactDuplicateError("This contact already has a candidate profile.");
    if (error?.code === "23514") throw new ContactUnavailableError(error.message);
    if (error?.code === "42501") throw new ContactAuthorizationError("You are not authorized to promote this contact.");
    const candidateId = data?.[0]?.candidate_public_id;
    if (error || !candidateId) throw new ContactUnavailableError("Candidate promotion could not be completed.");
    return candidateId;
  }

  private toRow(input: ContactInput) {
    return {
      first_name: input.firstName.trim(), last_name: input.lastName.trim(), preferred_name: input.preferredName?.trim() || null,
      primary_email: input.primaryEmail?.trim().toLowerCase() || null, primary_phone: input.primaryPhone?.trim() || null,
      address_line_1: input.addressLine1?.trim() || null, address_line_2: input.addressLine2?.trim() || null,
      city: input.city?.trim() || null, state_province: input.stateProvince?.trim() || null,
      postal_code: input.postalCode?.trim() || null, country: input.country, source: input.source.trim(),
      company: input.company?.trim() || null, title_occupation: input.titleOccupation?.trim() || null,
      lifecycle_status: input.lifecycleStatus,
    };
  }

  private async toRecords(rows: ContactRow[]): Promise<ContactRecord[]> {
    const membershipIds = [...new Set(rows.map((row) => row.assigned_membership_id))];
    const { data: profiles } = membershipIds.length
      ? await this.supabase.from("consultant_profiles").select("membership_id,display_name").in("membership_id", membershipIds)
      : { data: [] };
    const names = new Map((profiles ?? []).map((profile) => [profile.membership_id, profile.display_name]));
    return rows.map((row) => {
      const candidate = row.candidates?.[0];
      const preferred = row.preferred_name?.trim() ?? "";
      return {
        id: row.public_id, firstName: row.first_name, lastName: row.last_name, preferredName: preferred,
        displayName: preferred ? `${preferred} ${row.last_name}` : `${row.first_name} ${row.last_name}`,
        primaryEmail: row.primary_email ?? "", primaryPhone: row.primary_phone ?? "",
        addressLine1: row.address_line_1 ?? "", addressLine2: row.address_line_2 ?? "", city: row.city ?? "",
        stateProvince: row.state_province ?? "", postalCode: row.postal_code ?? "", country: row.country as "US" | "CA",
        source: row.source, company: row.company ?? "", titleOccupation: row.title_occupation ?? "",
        lifecycleStatus: row.lifecycle_status, marketingEmailStatus: row.marketing_email_status,
        marketingSmsStatus: row.marketing_sms_status, assignedMembershipId: row.assigned_membership_id,
        assignedConsultantName: names.get(row.assigned_membership_id) ?? "Assigned consultant",
        createdAt: row.created_at, updatedAt: row.updated_at,
        candidate: candidate ? { publicId: candidate.public_id, status: candidate.status, pipelineStageId: candidate.pipeline_stage_id } : null,
      };
    });
  }
}
