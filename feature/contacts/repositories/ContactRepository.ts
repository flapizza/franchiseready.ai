import type { ContactInput, ContactListPage, ContactListQuery, ContactRecord } from "../models/Contact";

export interface ContactRepository {
  listAssignableConsultants(): Promise<{ id: string; name: string }[]>;
  list(query: ContactListQuery): Promise<ContactListPage>;
  getById(publicId: string): Promise<ContactRecord | null>;
  create(input: ContactInput): Promise<ContactRecord>;
  update(publicId: string, input: ContactInput): Promise<ContactRecord>;
  promoteToCandidate(publicId: string): Promise<string>;
}
