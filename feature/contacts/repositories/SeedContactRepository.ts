import { randomUUID } from "node:crypto";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { ContactInput, ContactLifecycleStatus, ContactListPage, ContactListQuery, ContactRecord } from "../models/Contact";
import { ContactDuplicateError, ContactUnavailableError } from "../models/ContactErrors";
import type { ContactRepository } from "./ContactRepository";
import { demoContactStore } from "./DemoContactStore";

const demoTags:{id:string;name:string}[]=[];const demoLists:{id:string;name:string;memberCount:number}[]=[];
export function resetDemoAudienceOrganization(){demoTags.splice(0);demoLists.splice(0);}

export class SeedContactRepository implements ContactRepository {
  constructor(private readonly candidates: CandidateRepository) {}
  async listAssignableConsultants() { return [{ id: "consultant-demo", name: "Jim Wood" }]; }

  async list(query: ContactListQuery): Promise<ContactListPage> {
    const normalized = query.search?.trim().toLowerCase() ?? "";
    const seeded = (await this.candidates.getAll()).map((candidate) => this.fromCandidate(candidate));
    const seededIds = new Set(seeded.map((contact) => contact.id));
    const contacts = [...seeded, ...demoContactStore.list().filter((contact) => !seededIds.has(contact.id))].filter((contact) =>
      (!normalized || [contact.displayName, contact.primaryEmail, contact.primaryPhone].some((value) => value.toLowerCase().includes(normalized))) &&
      (!query.lifecycle || contact.lifecycleStatus === query.lifecycle) &&
      (!query.tagIds?.length || query.tagIds.every((id)=>contact.tags.some((tag)=>tag.id===id))) &&
      (!query.listId || contact.lists.some((list)=>list.id===query.listId)) &&
      (!query.emailStatus || contact.marketingEmailStatus===query.emailStatus) &&
      (!query.smsStatus || contact.marketingSmsStatus===query.smsStatus) &&
      (!query.candidateStatus || (query.candidateStatus==="candidate")===Boolean(contact.candidate)) &&
      (!query.assignedMembershipId || contact.assignedMembershipId===query.assignedMembershipId));
    return { contacts: contacts.slice(0, query.limit), nextCursor: null };
  }

  async getById(publicId: string): Promise<ContactRecord | null> {
    const overlay = demoContactStore.get(publicId);
    if (overlay) return overlay;
    const candidate = await this.candidates.getById(publicId.replace(/^contact-demo-/, ""));
    return candidate ? this.fromCandidate(candidate) : null;
  }

  async create(input: ContactInput): Promise<ContactRecord> {
    const email = input.primaryEmail?.trim().toLowerCase() ?? "";
    await this.assertUnique(email);
    const now = new Date().toISOString();
    const preferredName = input.preferredName?.trim() ?? "";
    return demoContactStore.save({
      id: `contact-demo-${randomUUID()}`, firstName: input.firstName.trim(), lastName: input.lastName.trim(), preferredName,
      displayName: preferredName ? `${preferredName} ${input.lastName.trim()}` : `${input.firstName.trim()} ${input.lastName.trim()}`,
      primaryEmail: email, primaryPhone: input.primaryPhone?.trim() ?? "", addressLine1: input.addressLine1?.trim() ?? "",
      addressLine2: input.addressLine2?.trim() ?? "", city: input.city?.trim() ?? "", stateProvince: input.stateProvince?.trim() ?? "",
      postalCode: input.postalCode?.trim() ?? "", country: input.country, source: input.source.trim(), company: input.company?.trim() ?? "",
      titleOccupation: input.titleOccupation?.trim() ?? "", lifecycleStatus: input.lifecycleStatus,
      marketingEmailStatus: "unknown", marketingSmsStatus: "unknown", assignedMembershipId: input.assignedMembershipId || "consultant-demo",
      assignedConsultantName: "Jim Wood", createdAt: now, updatedAt: now, candidate: null,
      tags: [], lists: [],
    });
  }

  async update(publicId: string, input: ContactInput): Promise<ContactRecord> {
    const current = demoContactStore.get(publicId);
    if (!current) throw new ContactUnavailableError("Contact could not be updated.");
    const email = input.primaryEmail?.trim().toLowerCase() ?? "";
    await this.assertUnique(email, publicId);
    const preferredName = input.preferredName?.trim() ?? "";
    const updated = demoContactStore.save({ ...current, ...input, preferredName,
      displayName: preferredName ? `${preferredName} ${input.lastName.trim()}` : `${input.firstName.trim()} ${input.lastName.trim()}`,
      primaryEmail: email, primaryPhone: input.primaryPhone?.trim() ?? "",
      assignedMembershipId: input.assignedMembershipId || current.assignedMembershipId, updatedAt: new Date().toISOString() });
    if (updated.candidate) {
      const candidate = await this.candidates.getById(updated.candidate.publicId);
      if (candidate) await this.candidates.save({ ...candidate, firstName: updated.firstName, lastName: updated.lastName, email: updated.primaryEmail, phone: updated.primaryPhone, updatedAt: updated.updatedAt });
    }
    return updated;
  }

  async promoteToCandidate(publicId: string): Promise<string> {
    const contact = demoContactStore.get(publicId);
    if (!contact) throw new ContactUnavailableError("Contact could not be promoted.");
    if (contact.candidate) throw new ContactDuplicateError("This contact already has a candidate profile.");
    if (!contact.primaryEmail) throw new ContactUnavailableError("Add an email address before promoting this contact.");
    const now = new Date().toISOString();
    const candidateId = `contact-candidate-${randomUUID()}`;
    await this.candidates.save({ id: candidateId, firstName: contact.firstName, lastName: contact.lastName, email: contact.primaryEmail,
      phone: contact.primaryPhone, city: contact.city, state: contact.stateProvince, country: contact.country === "CA" ? "Canada" : "USA",
      consultantId: contact.assignedMembershipId, status: "active", pipelineStage: "lead", pipelineStageId: "lead", healthScore: 0,
      createdAt: now, updatedAt: now, lastActivityAt: now, assessmentIds: [], intelligence: null, leadSource: contact.source });
    demoContactStore.save({ ...contact, lifecycleStatus: "active-candidate", candidate: { publicId: candidateId, status: "active", pipelineStageId: "lead" }, updatedAt: now });
    return candidateId;
  }
  async organizationOptions(){return {tags:demoTags,lists:demoLists};}
  async createTag(name:string){if(demoTags.some(x=>x.name.trim().toLowerCase()===name.trim().toLowerCase()))throw new ContactDuplicateError("That tag already exists.");demoTags.push({id:`tag-demo-${randomUUID()}`,name:name.trim()});}
  async createList(name:string){if(demoLists.some(x=>x.name.trim().toLowerCase()===name.trim().toLowerCase()))throw new ContactDuplicateError("That list already exists.");demoLists.push({id:`list-demo-${randomUUID()}`,name:name.trim(),memberCount:0});}
  async renameList(publicId:string,name:string){const list=demoLists.find(x=>x.id===publicId);if(!list)throw new ContactUnavailableError("List could not be renamed.");list.name=name.trim();}
  async bulkOrganize(ids:string[],operation:import("../models/Contact").ContactBulkOperation,target?:string){for(const id of ids){const c=await this.getById(id);if(!c)continue;if(operation==="lifecycle"&&target&&target!=="active-candidate")demoContactStore.save({...c,lifecycleStatus:target as ContactLifecycleStatus});if(operation==="add-tag"){const t=demoTags.find(x=>x.id===target);if(t&&!c.tags.some(x=>x.id===t.id))demoContactStore.save({...c,tags:[...c.tags,t]});}if(operation==="remove-tag")demoContactStore.save({...c,tags:c.tags.filter(x=>x.id!==target)});if(operation==="add-list"){const l=demoLists.find(x=>x.id===target);if(l&&!c.lists.some(x=>x.id===l.id))demoContactStore.save({...c,lists:[...c.lists,l]});}if(operation==="remove-list")demoContactStore.save({...c,lists:c.lists.filter(x=>x.id!==target)});}return ids.length;}
  async importContacts(rows:ContactInput[],options:{tagIds:string[];listId?:string;defaultSource?:string}){const result={processed:rows.length,created:0,matched:0,invalid:0,errors:[] as {rowNumber:number;message:string}[]};for(const [i,row] of rows.entries())try{const email=row.primaryEmail?.trim().toLowerCase();let c=email?(await this.list({search:email,limit:50})).contacts.find(x=>x.primaryEmail.toLowerCase()===email):undefined;if(c)result.matched++;else{c=await this.create({...row,source:row.source||options.defaultSource||"CSV Import"});result.created++;}for(const t of options.tagIds)await this.bulkOrganize([c.id],"add-tag",t);if(options.listId)await this.bulkOrganize([c.id],"add-list",options.listId);}catch{result.invalid++;result.errors.push({rowNumber:i+2,message:"Row could not be imported; review its identity fields."});}return result;}

  private async assertUnique(email: string, except?: string) {
    if (email && (await this.list({ limit: 50 })).contacts.some((contact) => contact.id !== except && contact.primaryEmail.toLowerCase() === email)) {
      throw new ContactDuplicateError("A contact with this email already exists in your organization.");
    }
  }

  private fromCandidate(candidate: Awaited<ReturnType<CandidateRepository["getAll"]>>[number]): ContactRecord {
    return {
      id: `contact-demo-${candidate.id}`, firstName: candidate.firstName, lastName: candidate.lastName,
      preferredName: "", displayName: `${candidate.firstName} ${candidate.lastName}`, primaryEmail: candidate.email,
      primaryPhone: candidate.phone, addressLine1: "", addressLine2: "", city: candidate.city,
      stateProvince: candidate.state, postalCode: "", country: candidate.country === "Canada" ? "CA" : "US",
      source: candidate.leadSource || "Conference Demo", company: "", titleOccupation: "",
      lifecycleStatus: candidate.status === "won" ? "closed-placed" : "active-candidate",
      marketingEmailStatus: "unknown", marketingSmsStatus: "unknown", assignedMembershipId: candidate.consultantId,
      assignedConsultantName: "Jim Wood", createdAt: candidate.createdAt, updatedAt: candidate.updatedAt,
      candidate: { publicId: candidate.id, status: candidate.status, pipelineStageId: candidate.pipelineStageId ?? candidate.pipelineStage },
      tags: [], lists: [],
    };
  }
}
