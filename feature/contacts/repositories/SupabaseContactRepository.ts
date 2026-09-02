import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database.generated";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ContactBulkOperation, ContactImportResult, ContactInput, ContactListPage, ContactListQuery, ContactOrganizationOptions, ContactRecord } from "../models/Contact";
import { ContactAuthorizationError, ContactDuplicateError, ContactUnavailableError } from "../models/ContactErrors";
import type { ContactRepository } from "./ContactRepository";

type ContactRow = Tables<"contacts"> & {
  candidates: { public_id: string; status: string; pipeline_stage_id: string }[] | null;
  contact_tag_memberships: { contact_tags: { public_id:string; name:string } | null }[] | null;
  contact_list_memberships: { contact_lists: { public_id:string; name:string } | null }[] | null;
};

const select = "*, candidates(public_id,status,pipeline_stage_id), contact_tag_memberships(contact_tags(public_id,name)), contact_list_memberships(contact_lists(public_id,name))";

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
    if (query.emailStatus) request = request.eq("marketing_email_status", query.emailStatus);
    if (query.smsStatus) request = request.eq("marketing_sms_status", query.smsStatus);
    if (query.assignedMembershipId) request = request.eq("assigned_membership_id", query.assignedMembershipId);
    if (query.candidateStatus === "candidate") request = request.not("candidates", "is", null);
    if (query.tagIds?.length) request = request.in("contact_tag_memberships.contact_tags.public_id", query.tagIds);
    if (query.listId) request = request.eq("contact_list_memberships.contact_lists.public_id", query.listId);
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

  async organizationOptions(): Promise<ContactOrganizationOptions> {
    const [{data:tags,error:tagError},{data:lists,error:listError}] = await Promise.all([
      this.supabase.from("contact_tags").select("public_id,name").eq("organization_id",this.workspace.organization.id).order("name"),
      this.supabase.from("contact_lists").select("public_id,name,contact_list_memberships(count)").eq("organization_id",this.workspace.organization.id).order("name"),
    ]);
    if(tagError||listError) throw new ContactUnavailableError("Contact organization options could not be loaded.");
    return {tags:(tags??[]).map((x)=>({id:x.public_id,name:x.name})),lists:(lists??[]).map((x)=>({id:x.public_id,name:x.name,memberCount:x.contact_list_memberships?.[0]?.count??0}))};
  }

  async createTag(name:string) { const {error}=await this.supabase.from("contact_tags").insert({organization_id:this.workspace.organization.id,created_by_membership_id:this.workspace.membership.id,name:name.trim()}); if(error?.code==="23505")throw new ContactDuplicateError("That tag already exists.");if(error)throw new ContactUnavailableError("Tag could not be created."); }
  async createList(name:string) { const {error}=await this.supabase.from("contact_lists").insert({organization_id:this.workspace.organization.id,created_by_membership_id:this.workspace.membership.id,name:name.trim()}); if(error?.code==="23505")throw new ContactDuplicateError("That list already exists.");if(error)throw new ContactUnavailableError("List could not be created."); }
  async renameList(publicId:string,name:string) { const {error}=await this.supabase.from("contact_lists").update({name:name.trim()}).eq("organization_id",this.workspace.organization.id).eq("public_id",publicId);if(error)throw new ContactUnavailableError("List could not be renamed."); }
  async bulkOrganize(ids:string[],operation:ContactBulkOperation,target?:string):Promise<number>{
    const lifecycle=operation==="lifecycle"?target as ContactInput["lifecycleStatus"]:undefined;
    const {data,error}=await this.supabase.rpc("bulk_organize_contacts",{target_contact_public_ids:ids,operation,target_public_id:operation==="lifecycle"?undefined:target,target_lifecycle:lifecycle});
    if(error?.code==="42501")throw new ContactAuthorizationError("You are not authorized to organize this selection.");if(error)throw new ContactUnavailableError("The selected contacts could not be updated.");return data??0;
  }
  async importContacts(rows:ContactInput[],options:{tagIds:string[];listId?:string;defaultSource?:string}):Promise<ContactImportResult>{
    const result:ContactImportResult={processed:rows.length,created:0,matched:0,invalid:0,errors:[]};
    for(let offset=0;offset<rows.length;offset+=100){
      for(const [index,row] of rows.slice(offset,offset+100).entries()) try{
        const normalized=row.primaryEmail?.trim().toLowerCase();let contact:ContactRecord|undefined;
        if(normalized){const existing=await this.list({search:normalized,limit:2});contact=existing.contacts.find(x=>x.primaryEmail.toLowerCase()===normalized);}
        if(contact)result.matched++;else{contact=await this.create({...row,source:row.source||options.defaultSource||"CSV Import"});result.created++;}
        for(const tag of options.tagIds)await this.bulkOrganize([contact.id],"add-tag",tag);
        if(options.listId)await this.bulkOrganize([contact.id],"add-list",options.listId);
      }catch{result.invalid++;result.errors.push({rowNumber:offset+index+2,message:"Row could not be imported; review its identity fields."});}
    } return result;
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
        tags:(row.contact_tag_memberships??[]).flatMap((x)=>x.contact_tags?[{id:x.contact_tags.public_id,name:x.contact_tags.name}]:[]),
        lists:(row.contact_list_memberships??[]).flatMap((x)=>x.contact_lists?[{id:x.contact_lists.public_id,name:x.contact_lists.name,memberCount:0}]:[]),
      };
    });
  }
}
