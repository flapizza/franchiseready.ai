import type {CandidateRepository} from "@/feature/crm/repositories/CandidateRepository";
import type {PersistedCandidateWorkspace} from "@/feature/crm/models/PersistedCandidateWorkspace";
import type {TaskRepository} from "@/feature/tasks/repositories/TaskRepository";
import type {ConsultantCalendarEvent} from "../models/ConsultantCalendarEvent";
export interface MeetingBrief {snapshot:string[];changes:string[];openQuestions:string[];objectives:string[];suggestedQuestions:string[]}
export interface MeetingBriefSources {tasks?:TaskRepository;workspace?:{get(id:string):Promise<PersistedCandidateWorkspace|null>}}
export class MeetingBriefService{
 constructor(private readonly candidates:CandidateRepository,private readonly sources:MeetingBriefSources={}){}
 async build(event:ConsultantCalendarEvent):Promise<MeetingBrief|null>{
  if(!event.candidateId)return null;const candidate=await this.candidates.getById(event.candidateId);if(!candidate)return null;
  const tasks=(await this.sources.tasks?.getAll(event.consultantId)??[]).filter(t=>t.candidateId===candidate.id);
  const row=await this.sources.workspace?.get(candidate.id),a=row?.assessment?.analysis;
  const unresolved=row?.discovery?.observations.filter(o=>o.followUpNeeded||o.status==="unclear"||o.status==="contradicted")??[];
  return{snapshot:[`Stage: ${candidate.pipelineStage.replaceAll('-',' ')}`,a?`Ownership profile: ${a.ownershipProfile.primary}`:candidate.intelligence?.executiveSummary||"Review the candidate's assessment and current evidence."],changes:[`${tasks.filter(t=>t.status==='open').length} open candidate tasks; ${tasks.filter(t=>t.status==='completed').length} completed.`,row?.discovery?`Discovery: ${row.discovery.status}`:"No persisted Discovery context loaded."],openQuestions:unresolved.length?unresolved.map(o=>`${o.topic}: ${o.finding}`):a?.discoveryPriorities.map(p=>p.title)??["Confirm priorities and the next commitment."],objectives:[row?.discovery?.nextSteps||"Agree on the next concrete step.","Clarify remaining fit and financial questions."],suggestedQuestions:a?.discoveryPriorities.slice(0,3).map(p=>p.suggestedQuestion)??["What has changed since our last conversation?","What would make the next decision clearer?"]};
 }
}
