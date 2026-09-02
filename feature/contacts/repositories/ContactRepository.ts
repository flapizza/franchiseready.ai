import type { ContactBulkOperation, ContactImportResult, ContactInput, ContactListPage, ContactListQuery, ContactOrganizationOptions, ContactRecord } from "../models/Contact";

export interface ContactRepository {
  listAssignableConsultants(): Promise<{ id: string; name: string }[]>;
  list(query: ContactListQuery): Promise<ContactListPage>;
  getById(publicId: string): Promise<ContactRecord | null>;
  create(input: ContactInput): Promise<ContactRecord>;
  update(publicId: string, input: ContactInput): Promise<ContactRecord>;
  promoteToCandidate(publicId: string): Promise<string>;
  organizationOptions(): Promise<ContactOrganizationOptions>;
  createTag(name: string): Promise<void>;
  createList(name: string): Promise<void>;
  renameList(publicId: string, name: string): Promise<void>;
  bulkOrganize(ids: string[], operation: ContactBulkOperation, target?: string): Promise<number>;
  importContacts(rows: ContactInput[], options:{tagIds:string[];listId?:string;defaultSource?:string}):Promise<ContactImportResult>;
}
