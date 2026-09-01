import { randomUUID } from "node:crypto";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { ContactInput, ContactListPage, ContactListQuery, ContactRecord } from "../models/Contact";
import { ContactDuplicateError, ContactUnavailableError } from "../models/ContactErrors";
import type { ContactRepository } from "./ContactRepository";
import { demoContactStore } from "./DemoContactStore";

export class SeedContactRepository implements ContactRepository {
  constructor(private readonly candidates: CandidateRepository) {}
  async listAssignableConsultants() { return [{ id: "consultant-demo", name: "Jim Wood" }]; }

  async list(query: ContactListQuery): Promise<ContactListPage> {
    const normalized = query.search?.trim().toLowerCase() ?? "";
    const seeded = (await this.candidates.getAll()).map((candidate) => this.fromCandidate(candidate));
    const seededIds = new Set(seeded.map((contact) => contact.id));
    const contacts = [...seeded, ...demoContactStore.list().filter((contact) => !seededIds.has(contact.id))].filter((contact) =>
      (!normalized || [contact.displayName, contact.primaryEmail, contact.primaryPhone].some((value) => value.toLowerCase().includes(normalized))) &&
      (!query.lifecycle || contact.lifecycleStatus === query.lifecycle));
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
    };
  }
}
