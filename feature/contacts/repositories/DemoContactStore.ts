import type { ContactRecord } from "../models/Contact";
const demoGlobal = globalThis as typeof globalThis & { __frangrooveDemoContacts?: Map<string, ContactRecord> };
const records = demoGlobal.__frangrooveDemoContacts ?? new Map<string, ContactRecord>();
demoGlobal.__frangrooveDemoContacts = records;
export const demoContactStore = {
  list: () => [...records.values()], get: (id: string) => records.get(id) ?? null,
  save: (contact: ContactRecord) => { records.set(contact.id, contact); return contact; },
  reset: () => records.clear(),
};
