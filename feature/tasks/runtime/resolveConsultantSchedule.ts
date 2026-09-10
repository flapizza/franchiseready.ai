import "server-only";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseConsultantScheduleRepository } from "../repositories/SupabaseConsultantScheduleRepository";
import { TaskService } from "../services/TaskService";
import { TaskRuntime } from "./TaskRuntime";
import { CalendarService } from "@/feature/calendar/services/CalendarService";
import { CalendarRuntime } from "@/feature/calendar/runtime/CalendarRuntime";

export async function resolveConsultantSchedule(){
  const r=await resolveWorkspaceComposition();if(r.status!=="resolved")return null;
  const c=r.composition;
  if("runtimes" in c)return{consultantId:c.runtimes.consultant.id,tasks:c.dependencies.tasks,calendar:c.dependencies.calendar,taskService:c.runtimes.createTaskService(),taskRuntime:c.runtimes.createTasks(),calendarService:c.runtimes.createCalendarService(),calendarRuntime:c.runtimes.createCalendar(),persisted:null};
  const repository=new SupabaseConsultantScheduleRepository(await createServerSupabaseClient(),c.dependencies.workspaceContext);
  return{consultantId:c.session.membership.id,tasks:repository,calendar:repository,taskService:new TaskService(repository,c.dependencies.candidates),taskRuntime:new TaskRuntime(repository,c.dependencies.candidates,undefined,null),calendarService:new CalendarService(repository,c.dependencies.candidates),calendarRuntime:new CalendarRuntime(repository,c.dependencies.candidates,undefined,{tasks:repository,workspace:c.dependencies.candidateWorkspace}),persisted:repository};
}
