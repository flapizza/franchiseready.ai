import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { ConsultantCalendarEvent } from "../models/ConsultantCalendarEvent";
import type { CalendarRepository } from "./CalendarRepository";
import { DEMO_CONSULTANT_TIMEZONE, demoLocalIso } from "../time/ConsultantTime";

function seeds(consultantId: string): ConsultantCalendarEvent[] { const createdAt = demoLocalIso(-14, 9); return [
  { id: "meeting-john-discovery", consultantId, candidateId: "candidate-demo", title: "Discovery Call — John Smith", description: "Validate family alignment and decision timing.", startAt: demoLocalIso(0, 23), endAt: demoLocalIso(0, 23, 30), timezone: DEMO_CONSULTANT_TIMEZONE, meetingUrl: "https://meet.google.com/demo-john", relatedTaskIds: [], source: "discovery", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-elena-followup", consultantId, candidateId: "elena-rodriguez", title: "Follow-Up — Elena Rodriguez", description: "Review recent email engagement and ownership questions.", startAt: demoLocalIso(1, 11), endAt: demoLocalIso(1, 11, 30), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Phone", relatedTaskIds: [], source: "consultant-created", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-jared-completed", consultantId, candidateId: "jared-wirsig", title: "Brand Presentation Recap — Jared Wirsig", startAt: demoLocalIso(-2, 15), endAt: demoLocalIso(-2, 16), timezone: DEMO_CONSULTANT_TIMEZONE, meetingUrl: "https://zoom.us/j/demo", relatedTaskIds: ["task-seed-completed-jared"], source: "brand-presentation", status: "completed", notes: "Reviewed presentation reactions and agreed to send a recap.", createdAt, updatedAt: demoLocalIso(-2, 16) },
  { id: "meeting-team-planning", consultantId, title: "Weekly Pipeline Planning", startAt: demoLocalIso(2, 9), endAt: demoLocalIso(2, 10), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Office", relatedTaskIds: [], source: "consultant-created", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-cancelled", consultantId, candidateId: "sarah-williams", title: "Referral Check-In — Sarah Williams", startAt: demoLocalIso(-4, 13), endAt: demoLocalIso(-4, 13, 30), timezone: DEMO_CONSULTANT_TIMEZONE, relatedTaskIds: [], source: "referral", status: "cancelled", createdAt, updatedAt: demoLocalIso(-5, 12) },
]; }
export class DemoCalendarRepository implements CalendarRepository {
  async getEvents(consultantId: string) { const overlay = demoCandidateOverlayStore.getCalendarEvents(consultantId); const byId = new Map(overlay.map((item) => [item.id, item])); const base = seeds(consultantId); return base.map((item) => byId.get(item.id) ?? item).concat(overlay.filter((item) => !base.some((seed) => seed.id === item.id))); }
  async getEvent(id: string) { return demoCandidateOverlayStore.getCalendarEvent(id) ?? seeds("consultant-demo").find((item) => item.id === id) ?? null; }
  async saveEvent(event: ConsultantCalendarEvent) { demoCandidateOverlayStore.saveCalendarEvent(event); }
  async getReminders(consultantId: string) { return demoCandidateOverlayStore.getReminders(consultantId); }
  async saveReminder(reminder: import("../models/ConsultantCalendarEvent").ConsultantReminder) { demoCandidateOverlayStore.saveReminder(reminder); }
}
