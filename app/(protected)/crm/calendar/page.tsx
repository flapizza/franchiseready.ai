import { CalendarWorkspacePage } from "@/feature/calendar/components/CalendarWorkspacePage";
import { resolveConsultantSchedule } from "@/feature/tasks/runtime/resolveConsultantSchedule";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
export const dynamic = "force-dynamic";
export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const query = await searchParams; const schedule=await resolveConsultantSchedule(); if(!schedule)return <WorkspaceFeatureUnavailable title="Calendar"/>; const state = await schedule.calendarRuntime.build(schedule.consultantId); return <CalendarWorkspacePage state={state} candidateId={typeof query.candidate === "string" ? query.candidate : undefined} eventId={typeof query.event === "string" ? query.event : undefined} />; }
