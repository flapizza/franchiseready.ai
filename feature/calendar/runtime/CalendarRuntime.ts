import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { CalendarWorkspaceState } from "../models/CalendarWorkspaceState";
import type { CalendarRepository } from "../repositories/CalendarRepository";
import { MeetingBriefService } from "../services/MeetingBriefService";
import { DEMO_CONSULTANT_TIMEZONE, formatEventDate, formatEventTime, localDateKey } from "../time/ConsultantTime";

export class CalendarRuntime {
  constructor(private readonly repository: CalendarRepository, private readonly candidates: CandidateRepository, private readonly now: () => Date = () => new Date()) {}
  async build(consultantId: string): Promise<CalendarWorkspaceState> {
    const [events, candidates, reminders] = await Promise.all([this.repository.getEvents(consultantId), this.candidates.getAll(), this.repository.getReminders(consultantId)]);
    const owned = candidates.filter((item) => item.consultantId === consultantId);
    const names = new Map(owned.map((item) => [item.id, `${item.firstName} ${item.lastName}`]));
    const briefService = new MeetingBriefService(this.candidates);
    return {
      timezone: DEMO_CONSULTANT_TIMEZONE,
      todayKey: localDateKey(this.now()),
      candidates: owned.map((item) => ({ id: item.id, name: names.get(item.id)! })).sort((a, b) => a.name.localeCompare(b.name)),
      events: await Promise.all(events.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)).map(async (event) => ({
        id: event.id, title: event.title, candidateId: event.candidateId, startAt: event.startAt, endAt: event.endAt,
        candidateName: event.candidateId ? names.get(event.candidateId) : undefined,
        candidateHref: event.candidateId ? `/crm/candidates/${event.candidateId}` : undefined,
        dateKey: localDateKey(event.startAt, event.timezone), dateLabel: formatEventDate(event.startAt, event.timezone),
        timeLabel: formatEventTime(event.startAt, event.timezone), endTimeLabel: formatEventTime(event.endAt, event.timezone),
        timezone: event.timezone, location: event.location, meetingUrl: event.meetingUrl, description: event.description,
        sourceLabel: event.source.replaceAll("-", " "), status: event.status, relatedTaskCount: event.relatedTaskIds.length,
        notes: event.notes, brief: await briefService.build(event),
        followUpRecommendations: event.status === "completed" && event.candidateId ? [
          { id: `meeting-followup:${event.id}`, label: "Create follow-up task", kind: "create-task" as const },
          { id: `meeting-next:${event.id}`, label: "Schedule next meeting", kind: "schedule" as const },
          { id: `meeting-candidate:${event.id}`, label: "Review Candidate 360", href: `/crm/candidates/${event.candidateId}`, kind: "navigate" as const },
        ] : [],
        reminderCount: reminders.filter((item) => item.referenceType === "calendar-event" && item.referenceId === event.id && item.status === "pending").length,
      }))),
    };
  }
}
