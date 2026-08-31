import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { ConsultantCalendarEvent } from "../models/ConsultantCalendarEvent";
import type { CalendarRepository } from "./CalendarRepository";
import { DEMO_CONSULTANT_TIMEZONE } from "../time/ConsultantTime";
import { conferenceDemoIso } from "@/feature/demo/time/conferenceDemoClock";

function seeds(consultantId: string): ConsultantCalendarEvent[] { const createdAt = conferenceDemoIso(-14, 9); return [
  { id: "meeting-john-discovery", consultantId, candidateId: "candidate-demo", title: "Discovery Call — John Smith", description: "Validate family alignment and decision timing.", startAt: conferenceDemoIso(0, 14), endAt: conferenceDemoIso(0, 14, 30), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Conference demo · no external meeting", relatedTaskIds: [], source: "discovery", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-elena-followup", consultantId, candidateId: "elena-rodriguez", title: "Follow-Up — Elena Rodriguez", description: "Review recent email engagement and ownership questions.", startAt: conferenceDemoIso(1, 11), endAt: conferenceDemoIso(1, 11, 30), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Phone", relatedTaskIds: [], source: "consultant-created", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-jared-completed", consultantId, candidateId: "jared-wirsig", title: "Brand Presentation Recap — Jared Wirsig", startAt: conferenceDemoIso(-2, 15), endAt: conferenceDemoIso(-2, 16), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Conference demo · no external meeting", relatedTaskIds: ["task-seed-completed-jared"], source: "brand-presentation", status: "completed", notes: "Reviewed presentation reactions and agreed to send a recap.", createdAt, updatedAt: conferenceDemoIso(-2, 16) },
  { id: "meeting-team-planning", consultantId, title: "Weekly Pipeline Planning", startAt: conferenceDemoIso(2, 9), endAt: conferenceDemoIso(2, 10), timezone: DEMO_CONSULTANT_TIMEZONE, location: "Office", relatedTaskIds: [], source: "consultant-created", status: "scheduled", createdAt, updatedAt: createdAt },
  { id: "meeting-cancelled", consultantId, candidateId: "sarah-williams", title: "Referral Check-In — Sarah Williams", startAt: conferenceDemoIso(-4, 13), endAt: conferenceDemoIso(-4, 13, 30), timezone: DEMO_CONSULTANT_TIMEZONE, relatedTaskIds: [], source: "referral", status: "cancelled", createdAt, updatedAt: conferenceDemoIso(-5, 12) },
]; }
export class DemoCalendarRepository implements CalendarRepository {
  async getEvents(consultantId: string) { const overlay = demoCandidateOverlayStore.getCalendarEvents(consultantId); const byId = new Map(overlay.map((item) => [item.id, item])); const base = seeds(consultantId); return base.map((item) => byId.get(item.id) ?? item).concat(overlay.filter((item) => !base.some((seed) => seed.id === item.id))); }
  async getEvent(id: string) { return demoCandidateOverlayStore.getCalendarEvent(id) ?? seeds("consultant-demo").find((item) => item.id === id) ?? null; }
  async saveEvent(event: ConsultantCalendarEvent) { demoCandidateOverlayStore.saveCalendarEvent(event); }
  async getReminders(consultantId: string) { return demoCandidateOverlayStore.getReminders(consultantId); }
  async saveReminder(reminder: import("../models/ConsultantCalendarEvent").ConsultantReminder) { demoCandidateOverlayStore.saveReminder(reminder); }
}
