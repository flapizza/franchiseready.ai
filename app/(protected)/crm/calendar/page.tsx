import { CalendarWorkspacePage } from "@/feature/calendar/components/CalendarWorkspacePage";
import { CalendarRuntime } from "@/feature/calendar/runtime/CalendarRuntime";
import { DemoCalendarRepository } from "@/feature/calendar/repositories/DemoCalendarRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
export const dynamic = "force-dynamic";
export default async function CalendarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const query = await searchParams; const state = await new CalendarRuntime(new DemoCalendarRepository(), new SeedCandidateRepository()).build(demoConsultant.id); return <CalendarWorkspacePage state={state} candidateId={typeof query.candidate === "string" ? query.candidate : undefined} eventId={typeof query.event === "string" ? query.event : undefined} />; }
