import { ConferenceAssessmentAnalysisService } from "./ConferenceAssessmentAnalysisService.ts";
import { validateConferenceSubmission } from "./validation.ts";
import { CONFERENCE_INSTRUMENT_VERSION, CURRENT_ANALYSIS_VERSION, type ConferenceAnalysis, type ConferenceAssessmentLoadResult, type ConferenceAssessmentRecord, type StoredConferenceAssessmentRecord } from "./types.ts";

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";
function isCurrentAnalysis(value: unknown): value is ConferenceAnalysis {
  if (!isObject(value) || value.analysisVersion !== CURRENT_ANALYSIS_VERSION || value.instrumentVersion !== CONFERENCE_INSTRUMENT_VERSION) return false;
  const profile = value.ownershipProfile;
  const brief = value.consultantBrief;
  return isObject(profile) && typeof profile.interpretation === "string" && isObject(brief) && isObject(brief.ownershipOrientation) && Array.isArray(value.evidenceDetails);
}

export class ConferenceAssessmentStore {
  private records = new Map<string, StoredConferenceAssessmentRecord>();

  save(record: ConferenceAssessmentRecord | StoredConferenceAssessmentRecord) { this.records.set(record.id, structuredClone(record)); }
  load(id: string) { const record=this.records.get(id);return record?this.resolve(record):null; }
  loadByCandidateId(candidateId: string) { const record=[...this.records.values()].find(item=>item.candidateId===candidateId);return record?this.resolve(record):null; }
  get(id: string) { const result=this.load(id);return result?.ok?result.record:null; }
  getByCandidateId(candidateId: string) { const result=this.loadByCandidateId(candidateId);return result?.ok?result.record:null; }
  getAll() { return [...this.records.values()].map(record=>this.resolve(record)).filter((result):result is Extract<ConferenceAssessmentLoadResult,{ok:true}>=>result.ok).map(result=>result.record).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)); }
  clear() { this.records.clear(); }

  private resolve(snapshot: StoredConferenceAssessmentRecord): ConferenceAssessmentLoadResult {
    const instrumentVersion=snapshot.instrumentVersion??(isObject(snapshot.analysis)&&typeof snapshot.analysis.instrumentVersion==="string"?snapshot.analysis.instrumentVersion:CONFERENCE_INSTRUMENT_VERSION);
    if(instrumentVersion!==CONFERENCE_INSTRUMENT_VERSION)return {ok:false,reason:"This assessment was completed with an unsupported assessment instrument version."};
    const errors=validateConferenceSubmission(snapshot.intake,snapshot.answers,true);
    if(errors.length)return {ok:false,reason:"The original response snapshot is incomplete or incompatible and cannot be safely regenerated."};
    if(isCurrentAnalysis(snapshot.analysis))return {ok:true,record:structuredClone(snapshot as ConferenceAssessmentRecord),reanalyzed:false};
    const analysis=new ConferenceAssessmentAnalysisService().analyze(snapshot.intake,snapshot.answers);
    const upgraded:ConferenceAssessmentRecord={...snapshot,instrumentVersion:CONFERENCE_INSTRUMENT_VERSION,analysis};
    this.records.set(snapshot.id,structuredClone(upgraded));
    return {ok:true,record:structuredClone(upgraded),reanalyzed:true};
  }
}

const conferenceGlobal = globalThis as typeof globalThis & { __frangrooveConferenceAssessments?: ConferenceAssessmentStore };
if(conferenceGlobal.__frangrooveConferenceAssessments)Object.setPrototypeOf(conferenceGlobal.__frangrooveConferenceAssessments,ConferenceAssessmentStore.prototype);
export const conferenceAssessmentStore = conferenceGlobal.__frangrooveConferenceAssessments ?? new ConferenceAssessmentStore();
conferenceGlobal.__frangrooveConferenceAssessments = conferenceAssessmentStore;
