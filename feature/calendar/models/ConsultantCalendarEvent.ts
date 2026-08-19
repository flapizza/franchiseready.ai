export type CalendarEventStatus = "scheduled" | "completed" | "cancelled" | "no-show";
export type CalendarEventSource = "consultant-created" | "google-calendar" | "microsoft-365" | "discovery" | "brand-presentation" | "referral" | "system";

export interface ConsultantCalendarEvent {
  id: string; consultantId: string; title: string; description?: string; startAt: string; endAt: string; timezone: string;
  location?: string; meetingUrl?: string; candidateId?: string; relatedTaskIds: string[]; source: CalendarEventSource;
  providerEventId?: string; status: CalendarEventStatus; notes?: string; createdAt: string; updatedAt: string;
}

export interface ConsultantReminder {
  id: string; consultantId: string; remindAt: string; referenceType: "task" | "calendar-event" | "candidate";
  referenceId: string; status: "pending" | "dismissed" | "completed"; createdBy: "consultant" | "system"; createdAt: string;
}
