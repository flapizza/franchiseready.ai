import type { ConferenceAssessmentRecord } from "./types";

class ConferenceAssessmentStore {
  private records = new Map<string, ConferenceAssessmentRecord>();
  save(record: ConferenceAssessmentRecord) { this.records.set(record.id, structuredClone(record)); }
  get(id: string) { const record = this.records.get(id); return record ? structuredClone(record) : null; }
  getByCandidateId(candidateId: string) { const record = [...this.records.values()].find((item) => item.candidateId === candidateId); return record ? structuredClone(record) : null; }
  getAll() { return [...this.records.values()].map((item) => structuredClone(item)).sort((a, b) => b.completedAt.localeCompare(a.completedAt)); }
  clear() { this.records.clear(); }
}

const conferenceGlobal = globalThis as typeof globalThis & { __frangrooveConferenceAssessments?: ConferenceAssessmentStore };
export const conferenceAssessmentStore = conferenceGlobal.__frangrooveConferenceAssessments ?? new ConferenceAssessmentStore();
conferenceGlobal.__frangrooveConferenceAssessments = conferenceAssessmentStore;
